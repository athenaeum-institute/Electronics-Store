import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.error('BROWSER ERROR:', err.toString());
  });
  
  console.log("Navigating to http://localhost:5173 ...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (e) {
    console.log("Goto error:", e.message);
  }
  
  // Wait a bit to ensure React mounts
  await new Promise(r => setTimeout(r, 6000));
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("Root HTML length:", rootHtml.length);
  if (rootHtml.length < 100) {
    console.log("Root HTML:", rootHtml);
  }
  
  await browser.close();
})();
