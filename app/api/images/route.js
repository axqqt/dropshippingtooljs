// /app/api/images/route.js

"use server";

import { GoogleAuth } from 'google-auth-library';
import { GenerativeLanguageServiceClient } from '@google-cloud/generative-language';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const client = new GenerativeLanguageServiceClient({
        auth
      });

      const generationConfig = {
        temperature: 1,
        top_p: 0.95,
        top_k: 64,
        max_output_tokens: 8192,
        response_schema: {
          type: 'object',
          description: 'Return some of the most popular cookie recipes',
          properties: {
            recipes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recipe_name: {
                    type: 'string',
                    description: 'name of the recipe'
                  }
                }
              }
            }
          }
        },
        response_mime_type: 'application/json'
      };

      const [response] = await client.generateText({
        modelName: 'gemini-1.5-flash',
        generationConfig,
        prompt: {
          text: 'Generate a list of cookie recipes in JSON format.'
        }
      });

      const recipes = JSON.parse(response.text);
      res.status(200).json({ recipes });
    } catch (error) {
      console.error('Error generating recipes:', error);
      res.status(500).json({ error: 'Error generating recipes' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
