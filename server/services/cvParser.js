const { PDFParse } = require('pdf-parse'); // pdf-parse v2 exports a class
const mammoth = require('mammoth');

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Extract plain text from an uploaded CV buffer. Supports PDF and DOCX.
// Falls back to the filename extension when the mimetype is blank (common with drag-drop).
async function extractText(buffer, mimetype, filename = '') {
  const isPdf = mimetype === PDF || /\.pdf$/i.test(filename);
  const isDocx = mimetype === DOCX || /\.docx$/i.test(filename);

  if (isPdf) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }
  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  const err = new Error('Unsupported file type. Please upload a PDF or DOCX.');
  err.status = 400;
  throw err;
}

module.exports = { extractText, PDF, DOCX };
