import 'arabic.dart';

/// إبدالات لهجية شائعة: الحرف الفصيح ← ما قد ينطقه الطفل بعاميته.
/// (الحروف بعد التطبيع: الهمزة على الألف تصير «ا»).
const Map<String, Set<String>> dialectSubstitutions = {
  'ث': {'ت', 'س'},
  'ذ': {'د', 'ز'},
  'ظ': {'ض', 'ز'},
  'ق': {'ء', 'ا', 'ك'},
};

/// إبدال لهجي واحد داخل كلمة.
class DialectSwap {
  const DialectSwap(this.expected, this.heard);

  /// الحرف الفصيح المطلوب.
  final String expected;

  /// الحرف الذي نطقه الطفل.
  final String heard;

  @override
  bool operator ==(Object other) =>
      other is DialectSwap &&
      other.expected == expected &&
      other.heard == heard;

  @override
  int get hashCode => Object.hash(expected, heard);

  @override
  String toString() => '$expected←$heard';
}

/// إن كان الفرق بين الهيكلين إبدالات لهجية فقط أعادها، وإلا null.
List<DialectSwap>? dialectSwaps(String expectedWord, String heardWord) {
  final e = skeleton(expectedWord).runes.toList();
  final h = skeleton(heardWord).runes.toList();
  if (e.length != h.length) return null;
  final swaps = <DialectSwap>[];
  for (var i = 0; i < e.length; i++) {
    if (e[i] == h[i]) continue;
    final el = String.fromCharCode(e[i]);
    final hl = String.fromCharCode(h[i]);
    if (dialectSubstitutions[el]?.contains(hl) ?? false) {
      swaps.add(DialectSwap(el, hl));
    } else {
      return null;
    }
  }
  return swaps.isEmpty ? null : swaps;
}
