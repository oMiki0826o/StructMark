"""
File: browser_smoke.py
Modification: 2026-10-11 — 用真實 Chromium 驗證語系、響應式、文件搜尋和 Playground。

Usage: python3 scripts/browser_smoke.py --base-url http://127.0.0.1:8765/StructMark/
Requires: pip install playwright && python -m playwright install chromium
"""
import argparse
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright


# ── 瀏覽器驗收 ──
def verify(base_url: str) -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for width in (320, 375, 390, 430, 760, 1440):
                page = browser.new_page(viewport={"width": width, "height": 900})
                try:
                    for locale in ("zh-tw", "en"):
                        page.goto(urljoin(base_url, f"{locale}/"), wait_until="networkidle")
                        page.locator(".hero-copy h1").wait_for()
                        result = page.evaluate("""() => {
                            const heading = document.querySelector('.hero-copy h1');
                            const rect = heading.getBoundingClientRect();
                            const style = getComputedStyle(heading);
                            return {
                                overflow: document.documentElement.scrollWidth > innerWidth + 2,
                                wraps: rect.height > parseFloat(style.lineHeight) * 1.45
                            };
                        }""")
                        assert not result["overflow"], f"Horizontal overflow: {width}px, {locale}"
                        if width <= 760:
                            assert not result["wraps"], f"Wrapped heading: {width}px, {locale}"
                finally:
                    page.close()

            page = browser.new_page(viewport={"width": 390, "height": 844})
            try:
                page.goto(urljoin(base_url, "zh-tw/docs/"), wait_until="networkidle")
                page.locator("#docs-search-input").fill("表格")
                page.get_by_role("link", name="表格與資料").first.wait_for()

                page.goto(urljoin(base_url, "zh-tw/playground/"), wait_until="networkidle")
                page.locator("#source-input").wait_for()
                page.on("dialog", lambda dialog: dialog.accept())
                page.locator("#example-select").select_option("table")
                assert "| 名稱" in page.locator("#source-input").input_value()
                page.get_by_role("tab", name="AST 樹狀圖").click()
                page.locator(".ast-tree").wait_for()
                page.locator(".ast-tree summary").nth(1).click()
                assert page.locator("#source-input").evaluate("el => el.selectionEnd > el.selectionStart"), "AST Tree did not select source range"
                page.get_by_role("tab", name="AST JSON").click()
                page.locator(".ast-output").get_by_text('"document"').wait_for()
                source = "#1 Custom draft\n\n*[Preserved]"
                page.locator("#source-input").fill(source)
                page.get_by_role("link", name="EN").click()
                page.locator("#source-input").wait_for()
                assert page.locator("#source-input").input_value() == source, "Draft not preserved across locale switch"
            finally:
                page.close()
        finally:
            browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True, help="Static site base URL ending with /StructMark/")
    args = parser.parse_args()
    verify(args.base_url)
    print("Browser smoke checks passed: mobile, desktop, locales, search, Playground.")
