import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/scrape/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase().replace(/\s+/g, "");
  const urls = [
    `https://www.car.info/sv-se/license-plate/S/${reg}`,
    `https://biluppgifter.se/fordon/${reg}`,
  ];

  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
          "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
        },
      });
      if (resp.status === 200) {
        const text = await resp.text();
        return res.status(200).send(text);
      }
    } catch (e) {
      console.error(e);
    }
  }
  res.status(502).send("blocked");
});

app.listen(3000, () => console.log("Proxy up on :3000"));
