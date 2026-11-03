"""어촌생활 웹사이트판 만들기: 게임(index.html)에 Firebase 연결 스크립트를 끼워 web/public 에 복사해요.
   사용법 (프로젝트 폴더에서):  python3 tools/build_web.py"""
import pathlib, shutil
root = pathlib.Path(__file__).resolve().parent.parent
pub = root / "web" / "public"
src = (root / "index.html").read_text(encoding="utf8")
v = "10.12.2"
inject = "\n".join([
    f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-app-compat.js"></script>',
    f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-auth-compat.js"></script>',
    f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-firestore-compat.js"></script>',
    f'<script src="https://www.gstatic.com/firebasejs/{v}/firebase-database-compat.js"></script>',
    '<script src="firebase-config.js"></script>',
    '<script src="platform.js"></script>',
]) + "\n"
marker = "<script>\n(() => {"
assert src.count(marker) == 1, "게임 스크립트 시작 위치를 찾지 못했어요"
html = src.replace(marker, inject + marker)
html = html.replace("</body></html>", "") if html.rstrip().endswith("</body></html>") else html
if not html.rstrip().endswith("</html>"):
    html = html.rstrip() + "\n</body></html>\n"
(pub / "index.html").write_text(html, encoding="utf8")
for d in ["a", "fish"]:
    if (pub / d).exists(): shutil.rmtree(pub / d)
    shutil.copytree(root / d, pub / d)
print("web/public 준비 완료:", sum(1 for _ in pub.rglob("*") if _.is_file()), "개 파일")
