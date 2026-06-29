const { PDFParse } = require('pdf-parse'); // pdf-parse v2 exports a class
const mammoth = require('mammoth');

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Extract plain text from an uploaded CV buffer. Supports PDF and DOCX.
async function extractText(buffer, mimetype) {
  if (mimetype === PDF) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }
  if (mimetype === DOCX) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  const err = new Error('Unsupported file type. Please upload a PDF or DOCX.');
  err.status = 400;
  throw err;
}

module.exports = { extractText, PDF, DOCX };
