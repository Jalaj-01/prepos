let _pdfjsLib = null;

async function getPdfJS() {
  if (_pdfjsLib) return _pdfjsLib;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Worker served from /public — copy it there once (see SETUP above)
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  _pdfjsLib = pdfjs;
  return _pdfjsLib;
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE TEXT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export async function extractTextFromPDF(file) {
  let pdf = null;
  try {
    const pdfjs = await getPdfJS();
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items;

      if (!items.length) {
        fullText += `\nPage ${i}\n`;
        continue;
      }

      let pageText = "";
      let lastY = null;

      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += "\n";
        }
        pageText += item.str + (item.hasEOL ? "\n" : " ");
        lastY = item.transform[5];
      }

      fullText += `\nPage ${i}\n${pageText}\n`;
    }

    return fullText;
  } catch (err) {
    console.error("[pdfHelper] extractTextFromPDF error:", err);
    return "";
  } finally {
    if (pdf) try { pdf.destroy(); } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE → IMAGE
// ─────────────────────────────────────────────────────────────────────────────

export async function extractPDFPagesAsImages(file, scale = 2.5) {
  let pdf = null;
  try {
    const pdfjs = await getPdfJS();
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      pages.push({ pageNumber: i, image: canvas.toDataURL("image/png") });
    }
    return pages;
  } catch (err) {
    console.error("[pdfHelper] extractPDFPagesAsImages error:", err);
    return [];
  } finally {
    if (pdf) try { pdf.destroy(); } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OCR  (Tesseract.js)
// ─────────────────────────────────────────────────────────────────────────────

export async function extractTextWithOCR(file, onProgress) {
  try {
    const Tesseract = await import("tesseract.js");
    const pages = await extractPDFPagesAsImages(file, 2.5);

    if (!pages.length) {
      console.error("[pdfHelper] OCR: no pages rendered.");
      return "";
    }

    let fullText = "";

    for (const { pageNumber, image } of pages) {
      try {
        onProgress?.({
          page: pageNumber,
          total: pages.length,
          status: `OCR page ${pageNumber} of ${pages.length}`,
        });

        const { data: { text } } = await Tesseract.recognize(image, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              onProgress?.({
                page: pageNumber,
                total: pages.length,
                status: `Page ${pageNumber}: ${Math.round(m.progress * 100)}%`,
              });
            }
          },
        });

        fullText += `\nPage ${pageNumber}\n${text}\n`;
      } catch (e) {
        console.warn(`[pdfHelper] OCR page ${pageNumber} failed:`, e.message);
        fullText += `\nPage ${pageNumber}\n[OCR_FAILED]\n`;
      }
    }

    console.log(`[pdfHelper] OCR done. ${fullText.length} chars.`);
    return fullText;
  } catch (err) {
    console.error("[pdfHelper] extractTextWithOCR error:", err);
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART EXTRACT  ─  native first, OCR fallback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Heuristic: after stripping "Page N" lines, if fewer than 500 real chars
 * remain the PDF is almost certainly scanned → run OCR.
 */
function countMeaningfulChars(text) {
  return text
    .split("\n")
    .filter((l) => !/^\s*Page\s+\d+\s*$/.test(l))   // strip bare page labels
    .join(" ")
    .replace(/\s+/g, "")
    .length;
}

export async function smartExtract(file, onProgress) {
  const nativeText = await extractTextFromPDF(file);
  const meaningful = countMeaningfulChars(nativeText);

  console.log(`[pdfHelper] Meaningful chars after stripping page labels: ${meaningful}`);

  if (meaningful >= 500) {
    console.log("[pdfHelper] Using native extraction.");
    return { text: nativeText, method: "native" };
  }

  console.log("[pdfHelper] Sparse text → switching to OCR.");
  const ocrText = await extractTextWithOCR(file, onProgress);
  return { text: ocrText || nativeText, method: "ocr" };
}