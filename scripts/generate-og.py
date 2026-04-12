"""OGP画像生成スクリプト — og-template.html を 1200x630 PNG にキャプチャ"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    script_dir = Path(__file__).parent
    template = script_dir / "og-template.html"
    output   = script_dir.parent / "public" / "og-image.png"

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1200, "height": 630})
        await page.goto(template.as_uri())
        # Google Fonts 読み込み待ち
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(output), type="png")
        await browser.close()

    print(f"OGP画像生成完了: {output}")

asyncio.run(main())
