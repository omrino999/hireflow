// Export helpers for AI CV text. We build clean, explicitly-LIGHT HTML in a context
// that does NOT load Tailwind — so exports are always light-mode and free of the
// oklch() colors html2canvas can't parse.

const LIGHT_CSS = `
  body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff;
         line-height: 1.5; padding: 24px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 1.6em; margin: 0.5em 0 0.3em; color: #111; }
  h2 { font-size: 1.3em; margin: 0.6em 0 0.3em; color: #111; }
  h3 { font-size: 1.1em; margin: 0.6em 0 0.3em; color: #111; }
  p, li { font-size: 14px; color: #111; }
  ul, ol { padding-left: 1.4em; margin: 0.4em 0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 1em 0; }
  strong { font-weight: 700; }
  a { color: #1d4ed8; }
`;

// Inline body style as well as the <style> block — Word's embedded-CSS support is
// unreliable, but it honors inline styles and color inheritance.
const BODY_STYLE = 'color:#111;background:#ffffff;font-family:Arial,Helvetica,sans-serif;';

const buildHtml = (innerHTML, title) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>` +
  `<style>${LIGHT_CSS}</style></head><body style="${BODY_STYLE}">${innerHTML}</body></html>`;

// PDF: build directly from the Markdown text with jsPDF — one-click download,
// no popup, no print dialog, always light. Renders headings/bullets/spacing
// (not rich HTML, but clean and readable for a CV).
export async function exportPdf(markdown, filename = 'cv') {
  if (!markdown) return;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (h) => { if (y + h > pageH - margin) { doc.addPage(); y = margin; } };
  const stripBold = (t) => t.replace(/\*\*(.*?)\*\*/g, '$1');

  const write = (text, { size = 11, style = 'normal', indent = 0, gapAfter = 3 } = {}) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(17, 17, 17); // always dark text on white
    for (const w of doc.splitTextToSize(text, maxW - indent)) {
      ensure(size + 4);
      doc.text(w, margin + indent, y);
      y += size + 4;
    }
    y += gapAfter;
  };

  for (const raw of markdown.replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) { y += 6; continue; }
    if (/^###\s+/.test(line)) { write(stripBold(line.replace(/^###\s+/, '')), { size: 12, style: 'bold', gapAfter: 3 }); }
    else if (/^##\s+/.test(line)) { write(stripBold(line.replace(/^##\s+/, '')), { size: 14, style: 'bold', gapAfter: 4 }); }
    else if (/^#\s+/.test(line)) { write(stripBold(line.replace(/^#\s+/, '')), { size: 18, style: 'bold', gapAfter: 6 }); }
    else if (/^---+$/.test(line.trim())) { ensure(10); doc.setDrawColor(200); doc.line(margin, y, pageW - margin, y); y += 10; }
    else if (/^[-*]\s+/.test(line)) { write('•  ' + stripBold(line.replace(/^[-*]\s+/, '')), { indent: 12, gapAfter: 1 }); }
    else { write(stripBold(line), { gapAfter: 2 }); }
  }

  doc.save(`${filename}.pdf`);
}

// Word: save a clean light HTML-based .doc (Word opens it reliably).
export function exportDoc(element, filename = 'cv') {
  if (!element) return;
  const blob = new Blob(['﻿', buildHtml(element.innerHTML, filename)], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
