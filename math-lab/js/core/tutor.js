/* مساعد الرياضيات الذكي (AI Math Tutor)
 * محرك محلي يعتمد على القواعد: يطابق سؤال الطالب مع قواعد كل محاكاة،
 * ويولّد الإجابة من القيم الحالية للمتغيرات — لا يخترع أرقاماً.
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};

  function norm(s) {
    return String(s || '')
      .replace(/[ً-ٰٟـ]/g, '') // التشكيل والتطويل
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[؟?!،,.:؛]/g, ' ')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }
  ML.normAr = norm;

  const GENERIC = [
    { k: ['مجال', 'domain', 'مدي', 'range', 'المسموح'], kind: 'domain' },
    { k: ['خطوات', 'خطوه', 'حل', 'كيف احسب', 'كيف نحسب', 'steps'], kind: 'steps' },
    { k: ['ماذا حدث', 'لماذا تغير', 'ليش تغير', 'ماذا تغير', 'what happened'], kind: 'explain' },
    { k: ['اشرح', 'شرح', 'ما هو', 'ما هي', 'وضح', 'ابسط', 'بسط', 'فكره', 'explain'], kind: 'learn' },
    { k: ['مصدر', 'صفحه', 'الكتاب', 'درس'], kind: 'source' },
    { k: ['مرحبا', 'السلام', 'اهلا', 'hello', 'hi'], kind: 'hello' },
    { k: ['تحدي', 'سوال', 'تمرين', 'مساله'], kind: 'challenge' }
  ];

  function score(q, keys) {
    let s = 0;
    for (const k of keys) {
      const nk = norm(k);
      if (!nk) continue;
      if (q.includes(nk)) s += nk.length > 3 ? 2 : 1;
    }
    return s;
  }

  /* يرجع نصاً منسقاً (rich) */
  ML.tutorAnswer = function (sim, question, state) {
    const q = norm(question);
    const p = state.p, d = state.d;
    if (!q) return 'اكتب سؤالك عن المحاكاة الحالية، مثل: «' + ((sim.tutor && sim.tutor[0] && sim.tutor[0].q) || 'اشرح الدرس') + '»';
    // 1) قواعد خاصة بالمحاكاة
    let best = null, bestS = 0;
    (sim.tutor || []).forEach((r) => {
      const s = score(q, r.k) + (norm(r.q) === q ? 10 : 0);
      if (s > bestS) { bestS = s; best = r; }
    });
    // 2) نوايا عامة
    let gen = null, genS = 0;
    GENERIC.forEach((g) => { const s = score(q, g.k); if (s > genS) { genS = s; gen = g; } });
    if (best && bestS >= genS) return best.a(p, d);
    if (gen) {
      switch (gen.kind) {
        case 'domain':
          return '**المتغيرات ومجالاتها في هذه المحاكاة:**\n' + sim.vars.map((v) => '• $' + v[0] + '$: ' + v[1] + ' — المجال: ' + v[2]).join('\n');
        case 'steps': {
          const st = sim.steps ? sim.steps(p, d) : [];
          return st.length ? '**خطوات الحل بالقيم الحالية:**\n' + st.map((s, i) => (i + 1) + ') ' + s).join('\n') : 'لا توجد خطوات حسابية لهذه الحالة.';
        }
        case 'explain':
          return state.lastExplain && state.lastExplain.length ? '**آخر تغيير:**\n' + state.lastExplain.join('\n') : 'لم تغيّر أي قيمة بعد. حرّك أحد المنزلقات ثم اسألني مرة أخرى.';
        case 'learn':
          return '**' + sim.titleAr + '**\n' + sim.summary + '\n' + (sim.learn || []).slice(0, 3).join('\n');
        case 'source':
          return 'المصدر: كتاب الرياضيات للصف العاشر (فلسطين، الطبعة الرابعة 2026) — ' + ML.unitName(sim.unit) + '، الدرس ' + sim.lesson + ': ' + sim.titleAr + '، صفحة ' + sim.page + '.';
        case 'hello':
          return 'أهلاً بك! أنا مساعد الرياضيات الذكي. أرى أنك في محاكاة «' + sim.titleAr + '». اسألني عن أي قيمة تراها أو عن سبب تغيّر الرسم.';
        case 'challenge':
          return (sim.challenges && sim.challenges.length) ? 'جرّب وضع **تحدي** في أعلى الصفحة. مثال: ' + sim.challenges[0].q : 'لا توجد تحديات لهذه المحاكاة.';
      }
    }
    // 3) رد احتياطي مرتبط بالحالة الحالية
    const res = sim.results ? sim.results(p, d).slice(0, 4).map((r) => '• ' + r[0] + ': ' + (r[2] === false ? r[1] : '$' + r[1] + '$')).join('\n') : '';
    return 'لم أتعرف على السؤال بدقة، لكن هذه قيم المحاكاة الآن:\n' + res + '\n\nجرّب أحد الأسئلة المقترحة بالأسفل.';
  };
})(typeof window !== 'undefined' ? window : globalThis);
