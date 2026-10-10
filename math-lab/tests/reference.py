"""مرجع مستقل (Python/NumPy) للتحقق من حسابات المختبر.
يطبع JSON بحالات عشوائية ثابتة البذرة وقيمها المتوقعة، ويقارنها tests/math.test.mjs.
"""
import json, math, random
from fractions import Fraction
import numpy as np

random.seed(2026)
out = {"quad": [], "det": [], "cramer": [], "comb": [], "trig": [], "circle": [], "log": [], "floor": []}

for _ in range(300):
    a = random.choice([v / 2 for v in range(-10, 11) if v != 0])
    b = random.randint(-20, 20) / 2
    c = random.randint(-20, 20) / 2
    D = b * b - 4 * a * c
    r = np.roots([a, b, c])
    out["quad"].append({"a": a, "b": b, "c": c, "D": D, "vx": -b / (2 * a), "vy": c - b * b / (4 * a),
                        "roots": sorted(float(x.real) for x in r) if D >= 0 else [],
                        "im": abs(float(r[0].imag)) if D < 0 else 0})

for _ in range(200):
    A = np.array([[random.randint(-6, 6) for _ in range(2)] for _ in range(2)], dtype=float)
    d = float(np.linalg.det(A))
    inv = np.linalg.inv(A).tolist() if abs(round(d)) > 0 else None
    out["det"].append({"A": A.tolist(), "det": round(d), "inv": inv})

for _ in range(200):
    a1, b1, c1, a2, b2, c2 = (random.randint(-9, 9) for _ in range(6))
    D = a1 * b2 - b1 * a2
    sol = np.linalg.solve([[a1, b1], [a2, b2]], [c1, c2]).tolist() if D != 0 else None
    out["cramer"].append({"s": [a1, b1, c1, a2, b2, c2], "sol": sol})

for n in range(0, 21):
    for r in range(0, n + 1):
        out["comb"].append({"n": n, "r": r, "C": str(math.comb(n, r)), "P": str(math.perm(n, r)), "F": str(math.factorial(n))})

for deg in range(-720, 721, 15):
    rad = math.radians(deg)
    cs = math.cos(rad)
    out["trig"].append({"deg": deg, "sin": math.sin(rad), "cos": cs, "tan": None if abs(cs) < 1e-12 else math.tan(rad),
                        "norm": deg % 360})

for _ in range(100):
    L, K, C = random.randint(-8, 8), random.randint(-8, 8), random.randint(-40, 40)
    r2 = L * L + K * K - C
    out["circle"].append({"L": L, "K": K, "C": C, "r2": r2, "r": math.sqrt(r2) if r2 > 0 else None})

for base in [0.5, 2, 3, 10, math.e]:
    for v in [0.001, 0.04, 1, 8, 64, 100, 729]:
        out["log"].append({"a": base, "v": v, "y": math.log(v, base)})

for _ in range(150):
    a = random.choice([v / 2 for v in range(-8, 9) if v != 0]); b = random.randint(-10, 10) / 2; n = random.randint(-10, 10)
    e1, e2 = Fraction(n) - Fraction(b), Fraction(n + 1) - Fraction(b)
    lo, hi = sorted([float(e1 / Fraction(a)), float(e2 / Fraction(a))])
    out["floor"].append({"a": a, "b": b, "n": n, "lo": lo, "hi": hi, "closedLeft": a > 0})

print(json.dumps(out))
