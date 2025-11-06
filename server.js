import express from "express";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const app = express();

async function fetchPageWithBrowser(url) {
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
  });

  console.log("🔍 Fetching:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

  const html = await page.content();
  await browser.close();
  return html;
}

app.get("/scrape/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase().replace(/\s+/g, "");
  const urls = [
    `https://www.car.info/sv-se/license-plate/S/${reg}`,
    `https://biluppgifter.se/fordon/${reg}`,
  ];

  for (const url of urls) {
    try {
      const html = await fetchPageWithBrowser(url);
      if (html && html.length > 1000 && !html.includes("Just a moment")) {
        console.log(`✅ Success for ${reg}`);
        return res.type("text/html").send(html);
      }
    } catch (e) {
      console.error(`❌ Error for ${url}:`, e.message);
    }
  }

  res.status(502).send("blocked");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Puppeteer proxy running on port ${PORT}`));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Puppeteer proxy running on port ${PORT}`));
