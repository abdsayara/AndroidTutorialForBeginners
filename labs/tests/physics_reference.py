#!/usr/bin/env python3
"""مرجع مستقل لقوانين الفيزياء (Python) — يُقارن به physics.test.mjs.
يكتب JSON إلى stdout: حالات عشوائية بقيم حقيقية + أمثلة الكتاب المحلولة."""
import json
import math
import random

random.seed(2020)
R_GAS = 8.314
NA = 6.02e23
C = dict(water=4186, ice=2093, aluminium=900, iron=452, copper=387, lead=128)
LF, LV = 3.33e5, 2.26e6

def equilibrium(m1, c1, t1, m2, c2, t2):
    # حل كح مكتسبة = كح مفقودة مباشرة
    return (m1 * c1 * t1 + m2 * c2 * t2) / (m1 * c1 + m2 * c2)

def heating(m, ti, tf, boil, ci):
    q = 0.0
    if ti < 0:
        q += m * ci * (min(tf, 0) - ti)
    if tf > 0:
        q += m * LF + m * C['water'] * tf
    if tf >= 100 and boil:
        q += m * LV
    return q

def vec_add(a, tha, b, thb):
    x = a * math.cos(math.radians(tha)) + b * math.cos(math.radians(thb))
    y = a * math.sin(math.radians(tha)) + b * math.sin(math.radians(thb))
    return dict(R=math.hypot(x, y), x=x, y=y)

def vertical(v0, h0, g):
    t_top = max(0.0, v0 / g)
    h_max = h0 + (v0 * v0 / (2 * g) if v0 > 0 else 0)
    # h0 + v0 t − ½ g t² = 0
    t_g = (v0 + math.sqrt(v0 * v0 + 2 * g * h0)) / g
    return dict(tTop=t_top, hMax=h_max, tGround=t_g, vGround=abs(v0 - g * t_g))

cases = dict(eq=[], heat=[], vec=[], vert=[], gas=[], press=[], buoy=[])
for _ in range(200):
    m1, m2 = random.uniform(0.05, 5), random.uniform(0.1, 5)
    k = random.choice(['aluminium', 'iron', 'copper', 'lead'])
    t1, t2 = random.uniform(0, 100), random.uniform(0, 100)
    cases['eq'].append(dict(m1=m1, k=k, t1=t1, m2=m2, t2=t2, Te=equilibrium(m1, C[k], t1, m2, C['water'], t2)))
    m, ti, tf, boil = random.uniform(0.05, 2), random.uniform(-30, 0), random.uniform(0.01, 100), random.random() < 0.5
    if random.random() < 0.2:
        tf = 100
    cases['heat'].append(dict(m=m, ti=ti, tf=tf, boil=boil, Q=heating(m, ti, tf, boil, C['ice'])))
    a, b, tha, thb = random.uniform(0, 50), random.uniform(0, 50), random.uniform(0, 360), random.uniform(0, 360)
    cases['vec'].append(dict(a=a, b=b, tha=tha, thb=thb, **vec_add(a, tha, b, thb)))
    v0, h0, g = random.uniform(-30, 50), random.uniform(0, 2000), random.uniform(1, 25)
    cases['vert'].append(dict(v0=v0, h0=h0, g=g, **vertical(v0, h0, g)))
    p1, v1, t1, p2, t2 = random.uniform(0.1, 20), random.uniform(0.05, 50), random.uniform(50, 1000), random.uniform(0.1, 20), random.uniform(50, 1000)
    cases['gas'].append(dict(P1=p1, V1=v1, T1=t1, P2=p2, T2=t2, V2=p1 * v1 * t2 / (t1 * p2), boyle=p1 * v1 / v1 * 1, charles=v1 * t2 / t1, gay=p1 * t2 / t1))
    rho, h, P0 = random.choice([1000, 1260, 750, 13595]), random.uniform(0, 100), random.choice([1e5, 1.013e5])
    cases['press'].append(dict(rho=rho, h=h, g=10, P0=P0, P=P0 + rho * 10 * h))
    V, rb, rl = random.uniform(0.1, 50), random.uniform(100, 8000), random.uniform(700, 13600)
    Vm = V * 1e-3
    Vsub = Vm * rb / rl if rb < rl else Vm
    cases['buoy'].append(dict(V=V, rb=rb, rl=rl, Fb=rl * Vsub * 10, app=max(0.0, rb * Vm * 10 - rl * Vsub * 10)))

print(json.dumps(cases))
