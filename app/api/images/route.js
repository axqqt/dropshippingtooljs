"use server";

import { GoogleAuth } from 'google-auth-library';
import { GenerativeServiceClient } from '@google-ai/generativelanguage';
import dotenv from 'dotenv';
import formidable from 'formidable';
import fs from 'fs';

dotenv.config();

export const POST = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the file' });
      return;
    }

    const file = files.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      const client = new GenerativeServiceClient({
        auth,
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
                    description: 'name of the recipe',
                  },
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        response_mime_type: 'application/json',
      };

      const [response] = await client.generateText({
        modelName: 'gemini-1.5-flash',
        generationConfig,
        prompt: {
          text: 'Generate a list of cookie recipes in JSON format.',
        },
      });

      const recipes = JSON.parse(response.text);
      res.status(200).json({ recipes });
    } catch (error) {
      console.error('Error generating recipes:', error);
      res.status(500).json({ error: 'Error generating recipes' });
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};
