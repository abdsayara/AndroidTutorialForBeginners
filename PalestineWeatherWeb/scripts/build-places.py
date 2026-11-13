#!/usr/bin/env python3
"""Builds server/data/places.json: the Arab towns and villages on the map and in the search.

Only places from lists that say whose they are, so no Israeli town, moshav or kibbutz gets in:

  1. West Bank and Gaza: OCHA's «Palestinian Communities in the West Bank and the Gaza Strip»
     (PCBS names, positions and 2017 population), from the Humanitarian Data Exchange:
     https://data.humdata.org/dataset/state-of-palestine-admin-level-2-boundaries  (the .xlsx)
  2. Inside the 1948 line: the Arab, Druze and Bedouin localities in Wikidata (the members of
     English Wikipedia's «Arab localities in Israel» category tree), with their Arabic names
     and positions: one JSON list of [qid, {ar, lat, lon, pop, types}] saved from the query.
  3. From the previous list: Palestine's cities under their own names, and a few Arab
     villages the two lists miss (KEEP_CUR below).

    python3 scripts/build-places.py communities.xlsx wikidata.json server/data/places.json

Needs openpyxl. The output replaces server/data/places.json (the third argument is read
first, as the previous list).
"""
import collections
import json
import sys

import openpyxl

import math
import re
def clean(s):
    s = re.sub('[ً-ْٰـ‎‏‪-‮]', '', s or '')
    s = re.sub(r'\s*\(.*?\)\s*', ' ', s)
    s = s.split('،')[0].split(',')[0]
    return re.sub(r'\s+', ' ', s).strip()
def norm(s):
    s = clean(s)
    s = re.sub('[أإآٱ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي').replace('ؤ', 'و').replace('ئ', 'ي')
    s = re.sub(r'\bال', '', s)
    return re.sub(r'[\s\-\'’`]+', '', s)
def km(a, b, c, d):
    return math.hypot((a - c) * 111.0, (b - d) * 111.0 * math.cos(math.radians(a)))

xlsx_path, wd_path, out_path = sys.argv[1:4]
rows = list(openpyxl.load_workbook(xlsx_path, read_only=True)['data'].iter_rows(values_only=True))
ix = {n: i for i, n in enumerate(rows[0])}
def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0
ocha = [{'name': clean(r[ix['NAME_ARB']]), 'lat': float(r[ix['Y']]), 'lon': float(r[ix['X']]), 'pop': num(r[ix['pop2017']]), 'cap': r[ix['Capital']]}
        for r in rows[1:] if r[ix['NAME_ARB']] is not None]
il = json.load(open(wd_path))
cur = json.load(open(out_path))
# Wikidata items that are not a town or village of their own (regions, merged councils, city quarters, a Jewish town).
IL_DROP={'Q1218','Q5776','Q167659','Q1026821','Q2917278','Q2345008','Q2890539','Q1611002','Q2889452','Q7211365','Q6065117',
         'Q2448062','Q947454','Q2897524','Q2902361','Q2918594','Q2919246','Q2919614','Q4540439','Q22947416','Q152593','Q180294','Q41621'}
IL_NAME={'Q152385':'ترشيحا','Q2777426':'مقيبلة','Q2890238':'يانوح - جت','Q2890184':'كسرى - سميع','Q246995':'السيد','Q4702222':'العراقيب',
         'Q2632879':'كفر ياسيف','Q2777567':'طمرة الزعبية','Q925908':'اللقية','Q655065':'رأس العين','Q7959259':'وادي النعم'}
# Places already on the map that the two lists don't carry: Palestine's cities under their own names, and Arab villages inside.
KEEP_CUR={'الخالصة','صفد','طبرية','العفولة','بيسان','أم خالد','كفر سابا','ملبس','تل أبيب','يازور','اللد','إسدود','الفالوجة','بئر السبع','أم الرشراش',
          'الريحانية','معليا','الرامة','شعب','المغار','حمام','كفر كما','بسمة'}
CUR_NAME={'حمام':'وادي الحمام'}
out=[]
def kind(pop, cap=False): return 'c' if pop>=50000 or cap else 't' if pop>=8000 else 'v'
for o in ocha:
    out.append([o['name'],round(o['lat'],4),round(o['lon'],4),kind(o['pop'], str(o['cap'])=='1'),o['pop'],'ocha'])
n_il=0
for k,e in il:
    if k in IL_DROP: continue
    name=IL_NAME.get(k) or clean(e['ar'] or '')
    if not name: continue
    if any(km(e['lat'],e['lon'],p[1],p[2])<1.5 for p in out): continue
    out.append([name,round(e['lat'],4),round(e['lon'],4),kind(e['pop']),e['pop'],'wd']); n_il+=1
n_cur=0
for name,lat,lon,kd in cur:
    keep = name in KEEP_CUR or (name=='عين حوض' and lon>34.99)
    if not keep: continue
    if any(km(lat,lon,p[1],p[2])<1.5 for p in out): continue
    out.append([CUR_NAME.get(name,name),lat,lon,kd,0,'cur']); n_cur+=1
# same name twice within 3 km: keep the first (the official list wins)
final=[]
for p in out:
    if any(norm(q[0])==norm(p[0]) and km(p[1],p[2],q[1],q[2])<3 for q in final): continue
    final.append(p)
order={'c':0,'t':1,'v':2}
final.sort(key=lambda p:(order[p[3]],-p[4],p[0]))
print('ocha',len(ocha),'inside',n_il,'kept',n_cur,'total',len(final), collections.Counter(p[3] for p in final))
json.dump([p[:4] for p in final], open(out_path, 'w'), ensure_ascii=False, separators=(',', ':'))
# how far the old positions were from the verified ones
moved=[]; 
for name,lat,lon,kd in cur:
    same=[p for p in final if norm(p[0])==norm(name)]
    if same:
        d=min(km(lat,lon,p[1],p[2]) for p in same)
        if 1.5<d<15: moved.append((name,round(d,1)))
print('old entries whose position was off by 1.5-15 km:',len(moved), sorted(moved,key=lambda m:-m[1])[:25])
dropped=[n for n,la,lo,k in cur if not any(km(la,lo,p[1],p[2])<1.5 or norm(p[0])==norm(n) for p in final)]
print('old entries dropped:',len(dropped))
print('cities/towns:', ' ، '.join(p[0] for p in final if p[3]!='v')[:2500])
