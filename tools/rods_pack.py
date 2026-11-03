"""낚싯대 3D 모델 팩(OBJ + MTL 묶음 zip) → a/rods.json

쓰는 법:  python3 tools/rods_pack.py <fishing_rods_14_tiers_3d_pack.zip>

zip 안의 OBJ 파일 이름 앞 번호(01~14)를 게임 낚싯대 id에 맞춰요.
낚싯대 하나마다 정점(Int16로 줄인 위치) · 재질별 삼각형 번호를 base64로 담아요.
릴(Reel · ReelHandle 묶음)은 따로 표시해서, 게임에서는 내가 고른 릴로 바꿔 보여 줄 수 있어요.
"""
import base64, json, pathlib, re, struct, sys, zipfile

IDS = {1: "bamboo", 2: "lure", 3: "fiber", 4: "rock", 5: "carbon", 6: "surf", 7: "boat",
       8: "iridium", 9: "titan", 10: "obsidian", 11: "legend", 12: "abyss", 13: "palace", 14: "myth"}
REEL_GROUPS = {"Reel", "ReelHandle"}

def hexc(vals):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(float(v) * 255))) for v in vals)

def parse_mtl(text):
    mats, cur = {}, None
    for line in text.splitlines():
        p = line.split()
        if not p: continue
        if p[0] == "newmtl": cur = mats.setdefault(p[1], {"c": "#cccccc", "o": 1.0, "e": None, "ns": 20.0})
        elif cur is None: continue
        elif p[0] == "Kd": cur["c"] = hexc(p[1:4])
        elif p[0] == "Ke": cur["e"] = hexc(p[1:4])
        elif p[0] == "d": cur["o"] = float(p[1])
        elif p[0] == "Ns": cur["ns"] = float(p[1])
    return mats

def parse_obj(text):
    vs, parts, mat, grp = [], {}, None, ""
    for line in text.splitlines():
        if line.startswith("v "):
            vs.append(tuple(float(x) for x in line.split()[1:4]))
        elif line.startswith("usemtl "):
            mat = line.split()[1]
        elif line.startswith("g "):
            grp = line.split()[1]
        elif line.startswith("f "):
            idx = [int(t.split("/")[0]) for t in line.split()[1:]]
            idx = [i - 1 if i > 0 else len(vs) + i for i in idx]
            key = (mat, grp in REEL_GROUPS)
            tris = parts.setdefault(key, [])
            for k in range(1, len(idx) - 1):   # 다각형은 부채꼴로 삼각형 나누기
                tris += [idx[0], idx[k], idx[k + 1]]
    return vs, parts

def b64(fmt, arr):
    return base64.b64encode(struct.pack("<%d%s" % (len(arr), fmt), *arr)).decode()

def main(zpath, out):
    z = zipfile.ZipFile(zpath)
    names = z.namelist()
    mtl_name = next(n for n in names if n.endswith(".mtl"))
    mats = parse_mtl(z.read(mtl_name).decode("utf8"))
    pack = {}
    for n in sorted(names):
        m = re.match(r"(?:.*/)?(\d\d)_[^/]+\.obj$", n)
        if not m: continue
        rid = IDS[int(m.group(1))]
        vs, parts = parse_obj(z.read(n).decode("utf8"))
        lo = [min(v[i] for v in vs) for i in range(3)]
        hi = [max(v[i] for v in vs) for i in range(3)]
        sc = [(hi[i] - lo[i]) / 65534 or 1e-6 for i in range(3)]
        q = [round((v[i] - lo[i]) / sc[i]) - 32767 for v in vs for i in range(3)]
        reel_v = sorted({i for (mt, reel), t in parts.items() if reel for i in t})
        reel_c = [sum(vs[i][k] for i in reel_v) / len(reel_v) for k in range(3)] if reel_v else None
        groups = []
        for (mt, reel), tris in sorted(parts.items(), key=lambda kv: (kv[0][1], kv[0][0] or "")):
            mm = mats.get(mt, {"c": "#cccccc", "o": 1.0, "e": None, "ns": 20.0})
            g = {"c": mm["c"], "i": b64("H", tris)}
            if mm["o"] < 1: g["o"] = mm["o"]
            if mm["e"]: g["e"] = mm["e"]
            if mm["ns"] >= 60: g["s"] = 1   # 반짝이는 금속 · 유리
            if reel: g["reel"] = 1
            groups.append(g)
        pack[rid] = {"lo": [round(x, 5) for x in lo], "sc": [x for x in sc], "len": round(hi[1] - lo[1], 4),
                     "v": b64("h", q), "g": groups, **({"reel": [round(x, 4) for x in reel_c]} if reel_c else {})}
        print(rid, n, "정점", len(vs), "삼각형", sum(len(t) for t in parts.values()) // 3)
    assert set(pack) == set(IDS.values()), "14종이 다 있어야 해요"
    pathlib.Path(out).write_text(json.dumps(pack, separators=(",", ":")), encoding="utf8")
    print("→", out, pathlib.Path(out).stat().st_size // 1024, "KB")

if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent.parent
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else root / "a" / "rods.json")
