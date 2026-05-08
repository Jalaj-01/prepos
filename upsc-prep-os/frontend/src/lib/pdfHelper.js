let pdfjsLib = null;

// =========================
// LOAD PDFJS
// =========================

const loadPDFJS = async () => {

    if (!pdfjsLib) {

        pdfjsLib = await import(
            'pdfjs-dist/legacy/build/pdf.js'
        );

        const PDFJS_VERSION = '4.0.379';

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    }

    return pdfjsLib;
};


// =========================
// EXTRACT TEXT
// =========================

export const extractTextFromPDF = async (file) => {

    if (typeof window === "undefined") return "";

    const pdfjs = await loadPDFJS();

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map(item => item.str)
            .join(" ");

        fullText += pageText + "\n";
    }

    return fullText;
};


// =========================
// EXTRACT PAGE IMAGES
// =========================

export const extractPDFPagesAsImages = async (file) => {

    if (typeof window === "undefined") return [];

    const pdfjs = await loadPDFJS();

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer
    });

    const pdf = await loadingTask.promise;

    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i);

        const viewport = page.getViewport({
            scale: 2
        });

        const canvas = document.createElement('canvas');

        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        const imageBase64 = canvas.toDataURL(
            'image/png'
        );

        pages.push({
            pageNumber: i,
            image: imageBase64
        });
    }

    return pages;
};


// =========================
// OCR FROM IMAGE
// =========================

export const extractTextWithOCR = async (
    imageFile
) => {

    const Tesseract =
        await import('tesseract.js');

    const result =
        await Tesseract.recognize(
            imageFile,
            'eng',
            {
                logger: m =>
                    console.log(m)
            }
        );

    return result.data.text;
};