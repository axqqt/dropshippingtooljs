"use client";
import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const baseURL = "http://localhost:5000";

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/api/search`, { prompt });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold mb-4">Product Search</h1>
      {loading ? (
        <h1>Loading... Please Wait</h1>
      ) : (
        <div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ color: "black" }}
            placeholder="Enter product prompt"
            className="mb-4 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="mb-4 p-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div key={index} className="border p-4 rounded">
                <img
                  src={product["Image Src"]}
                  alt={product.Title}
                  className="mb-2 w-full h-40 object-cover"
                />
                <h2 className="text-lg font-bold">{product.Title}</h2>
                <p dangerouslySetInnerHTML={{ __html: product["Body (HTML)"] }}></p>
                <p className="font-bold">{product["Variant Price"]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
