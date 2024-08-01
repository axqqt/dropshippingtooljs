"use server";
import { exec } from 'child_process';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const pythonScriptPath = path.join(process.cwd(), './cook.py');

    exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Error generating recipes' });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Error generating recipes' });
      }

      try {
        const recipes = JSON.parse(stdout);
        res.status(200).json({ recipes });
      } catch (parseError) {
        console.error(`parse error: ${parseError}`);
        res.status(500).json({ error: 'Error parsing response' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
