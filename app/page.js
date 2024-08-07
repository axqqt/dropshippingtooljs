"use client";
import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const baseURLPython  = "http://localhost:5000"

  const handleSearch = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await axios.post(`${baseURLPython}/api/search`, { prompt });
      if (response.status === 200) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data);
        } else {
          setStatus("No valid products found in the response.");
          setProducts([]);
        }
      } else if (response.status === 404) {
        setStatus("No results found.");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setStatus("Error fetching products.");
      setProducts([]);
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
            placeholder="Enter product prompt"
            style={{color:"black"}}
            className="mb-4 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="mb-4 p-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <h1>{status}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product, index) => (
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
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
