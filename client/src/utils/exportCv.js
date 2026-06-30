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

const buildHtml = (innerHTML, title) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>` +
  `<style>${LIGHT_CSS}</style></head><body>${innerHTML}</body></html>`;

// PDF: open a clean light document and trigger the browser's print → "Save as PDF".
// Reliable, always light, no html2canvas/oklch issues.
export function exportPdf(element, filename = 'cv') {
  if (!element) return;
  const w = window.open('', '_blank', 'width=820,height=1000');
  if (!w) { alert('Please allow pop-ups to download the PDF.'); return; }
  w.document.write(buildHtml(element.innerHTML, filename));
  w.document.close();
  w.onafterprint = () => w.close();
  setTimeout(() => { w.focus(); w.print(); }, 300);
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
