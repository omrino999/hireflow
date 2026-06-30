// Export helpers for AI text (CVs). Reused by Profile and Job Detail (tailored CV).

// PDF: render the already-displayed HTML element to a PDF (dynamic import keeps it out of the main bundle)
export async function downloadPdf(element, filename = 'cv') {
  if (!element) return;
  const html2pdf = (await import('html2pdf.js')).default;
  await html2pdf()
    .set({
      margin: 12,
      filename: `${filename}.pdf`,
      html2canvas: {
        scale: 2,
        backgroundColor: '#ffffff',
        // force a light, readable render even if the app is in dark mode
        onclone: (doc) => doc.querySelectorAll('*').forEach((el) => { el.style.color = '#0f172a'; }),
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();
}

// Word: wrap the rendered HTML in a doc and save as .doc (Word opens HTML-based .doc reliably)
export function downloadDoc(element, filename = 'cv') {
  if (!element) return;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${element.innerHTML}</body></html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
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
