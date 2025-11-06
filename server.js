import express from "express";
import puppeteer from "puppeteer";

const app = express();

async function fetchPageWithBrowser(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-zygote",
      "--single-process"
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
  });

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
      console.log(`🔍 Fetching ${url}`);
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
