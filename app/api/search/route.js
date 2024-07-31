// pages/api/search.js
"use client"
import axios from 'axios';
import cheerio from 'cheerio';

const LLAMA_API_URL = "http://localhost:8080/generate";
const ALIEXPRESS_SEARCH_URL = "https://www.aliexpress.com/wholesale";

const configureHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
});

const aiAnalyzePrompt = async (prompt) => {
  const payload = {
    prompt: `Extract key search terms from this prompt: ${prompt}\nKey terms:`
  };
  const response = await axios.post(LLAMA_API_URL, payload);
  const key_terms = response.data.trim().split(", ");
  return key_terms;
};

const searchAliExpress = async (key_terms) => {
  const headers = configureHeaders();
  const search_url = `${ALIEXPRESS_SEARCH_URL}?SearchText=${key_terms.join('+')}`;
  try {
    const response = await axios.get(search_url, { headers });
    const $ = cheerio.load(response.data);

    const product_links = [];
    $('a').each((i, item) => {
      const href = $(item).attr('href');
      if (href && href.startsWith("/item")) {
        product_links.push(`https://www.aliexpress.com${href}`);
      }
    });

    return product_links;
  } catch (error) {
    console.error("Error in searchAliExpress:", error);
    return [];
  }
};

const extractProductData = async (url) => {
  const headers = configureHeaders();
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const title = $('h1.product-title-text').text().trim();
    const price = $('span.product-price-value').text().trim();
    const description = $('div.product-description').text().trim();
    const imageSrc = $('img.magnifier-image').attr('src');

    const product_data = {
      "Handle": `product-${Math.floor(Math.random() * 9000) + 1000}`,
      "Title": title,
      "Body (HTML)": `<p>${description}</p>`,
      "Vendor": "AliExpress",
      "Type": "",
      "Tags": "",
      "Published": "TRUE",
      "Option1 Name": "Size",
      "Option1 Value": "One Size",
      "Option2 Name": "Color",
      "Option2 Value": "Default",
      "Variant SKU": `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
      "Variant Price": price,
      "Variant Inventory Qty": `${Math.floor(Math.random() * 90) + 10}`,
      "Image Src": imageSrc,
    };

    return product_data;
  } catch (error) {
    console.error("Error in extractProductData:", error);
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const key_terms = await aiAnalyzePrompt(prompt);
      const product_links = await searchAliExpress(key_terms);

      const data = [];
      for (const link of product_links) {
        const product_data = await extractProductData(link);
        if (product_data) {
          data.push(product_data);
          await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000)); // Polite scraping
        }
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error in handler:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
