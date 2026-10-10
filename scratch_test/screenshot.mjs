import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    await page.goto('http://localhost:5173/user/dashboard');
    // Wait a moment for animations
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: '/Users/rotimiolaosebikan/.gemini/antigravity-ide/brain/4ac2e4e4-3bf3-4303-bba2-598c53ea1c58/dashboard_screenshot.png', fullPage: true });
    console.log("Screenshot saved to /Users/rotimiolaosebikan/.gemini/antigravity-ide/brain/4ac2e4e4-3bf3-4303-bba2-598c53ea1c58/dashboard_screenshot.png");
    
    await browser.close();
  } catch (error) {
    console.error("Error taking screenshot:", error);
    process.exit(1);
  }
})();
