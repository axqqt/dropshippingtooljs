"use client"
import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const base64 = await convertToBase64(file);
    setImage(base64);
    setError(null); // Clear any previous errors
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIngredients(response.data.ingredients);
      setError(null);
    } catch (error) {
      console.error('Error analyzing image:', error);
      if (error.response && error.response.status === 422) {
        setError('The image could not be identified as a recipe. Please try a different image.');
      } else {
        setError('An error occurred while analyzing the image. Please try again.');
      }
      setIngredients([]);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div>
      <h1>Recipe Ingredient Analyzer</h1>
      <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} />
      <button onClick={handleSubmit}>Analyze Ingredients</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {image && (
        <div>
          <Image src={image} alt="Uploaded recipe" width={300} height={300} />
        </div>
      )}
      {ingredients.length > 0 && (
        <div>
          <h2>Ingredients:</h2>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient} - <a href={`https://www.amazon.com/s?k=${ingredient}`} target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
