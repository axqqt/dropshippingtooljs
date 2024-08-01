"use server";
import formidable from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the file' });
      }

      const filePath = files.file.filepath;

      // You can replace this section with the actual call to the image analysis function
      exec(`python analyze_image.py ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: 'Error analyzing image' });
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return res.status(500).json({ error: 'Error analyzing image' });
        }

        try {
          const ingredients = JSON.parse(stdout).ingredients;
          res.status(200).json({ ingredients });
        } catch (parseError) {
          res.status(500).json({ error: 'Error parsing response' });
        }
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
