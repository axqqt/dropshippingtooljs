"use server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import cheerio from 'cheerio';
import { parse } from 'json2csv';

const ALIEXPRESS_SEARCH_URL = "https://www.aliexpress.com/wholesale";

// Initialize Gemini API with your API key
const genAI = new GoogleGenerativeAI("AIzaSyDzUMB9-zViLm0Ltar3GcqsjpJHQiAgeIE");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to configure request headers
const configureHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
});

// Function to analyze prompt using Gemini API
const aiAnalyzePrompt = async (prompt) => {
  try {
    // Start a chat session
    const chat = model.startChat({ history: [] });

    // Send the message to extract key terms
    const result = await chat.sendMessage(`Extract key search terms from this prompt: ${prompt}\nKey terms:`);
    const key_terms = result.response.text().trim().split(", ");
    
    return key_terms;
  } catch (error) {
    console.error("Error in aiAnalyzePrompt:", error);
    throw new Error('Failed to analyze prompt');
  }
};

// Function to search AliExpress using key terms
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
    throw new Error('Failed to search AliExpress');
  }
};

// Function to extract product data from a URL
const extractProductData = async (url) => {
  const headers = configureHeaders();
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const title = $('h1.product-title-text').text().trim();
    const price = $('span.product-price-value').text().trim();
    const description = $('div.product-description').text().trim();
    const imageSrc = $('img.magnifier-image').attr('src');

    return {
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
  } catch (error) {
    console.error("Error in extractProductData:", error);
    return null;
  }
};

// Next.js API route handler
export async function POST(req) {
  try {
    const { prompt } = await req.json();
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

    if (data.length === 0) {
      return new Response(JSON.stringify({ error: 'No products found' }), { status: 404 });
    }

    // Convert data to CSV format with fields explicitly defined
    const fields = [
      "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
      "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
      "Variant SKU", "Variant Price", "Variant Inventory Qty", "Image Src"
    ];
    const csv = parse(data, { fields });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=products.csv'
      }
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
