import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
const mammoth = require('mammoth');

export async function parseDocument(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  let text;

  if (ext === '.pdf') {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (ext === '.docx') {
    const data = await mammoth.extractRawText({ path: filePath });
    text = data.value;
  } else if (ext === '.txt' || ext === '.md') {
    text = await fs.readFile(filePath, 'utf-8');
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const normalized = text.replace(/\u0000/g, '').trim();
  if (!normalized) {
    throw new Error('No extractable text was found. Scanned PDFs need OCR before they can be uploaded.');
  }
  return normalized;
}
