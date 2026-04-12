"""全プロジェクトの OGP 画像を一括生成"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

TARGETS = [
    ("og-hirake.html",  "../../hirake/public/og-image.png"),
    ("og-ams.html",     "../../AttendanceManagementSystem/public/og-image.png"),
    ("og-oas.html",     "../../oas-spa/public/og-image.png"),
]

async def main():
    script_dir = Path(__file__).parent
    base = script_dir.parent.parent  # fukumoto-reservation/

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for template_name, rel_output in TARGETS:
            template = script_dir / template_name
            # OAS と AMS の public ディレクトリは apps/ 直下
            if "AttendanceManagementSystem" in rel_output:
                output = Path(r"C:\Users\SM7B\Workspace\apps\AttendanceManagementSystem\public\og-image.png")
            elif "hirake" in rel_output:
                output = Path(r"C:\Users\SM7B\Workspace\apps\hirake\public\og-image.png")
            else:
                output = base / "oas-spa" / "public" / "og-image.png"

            output.parent.mkdir(parents=True, exist_ok=True)
            page = await browser.new_page(viewport={"width": 1200, "height": 630})
            await page.goto(template.as_uri())
            await page.wait_for_timeout(2000)
            await page.screenshot(path=str(output), type="png")
            await page.close()
            print(f"OK: {output}")

        await browser.close()

asyncio.run(main())
