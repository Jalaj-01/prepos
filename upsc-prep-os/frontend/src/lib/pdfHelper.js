// export const extractTextFromPDF = async (file) => {
//     // Dynamic import the main library only (Client-side only)
//     const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

//     // Use a CDN for the worker to avoid bundling issues in Vercel/Next.js
//     // This ensures the worker is always available without being part of the build process
//     const pdfjsVersion = '4.0.379'; // Standard stable version
//     pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`;

//     const arrayBuffer = await file.arrayBuffer();
//     const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
//     const pdf = await loadingTask.promise;
    
//     let fullText = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const textContent = await page.getTextContent();
        
//         // Extract text items and join them with spaces
//         const pageText = textContent.items
//             .map(item => item.str)
//             .join(" ");
            
//         fullText += pageText + "\n";
//     }

//     return fullText;
// };

let pdfjsLib = null;

export const extractTextFromPDF = async (file) => {
    // Prevent server-side execution
    if (typeof window === "undefined") {
        throw new Error("PDF extraction only works in browser");
    }

    // Lazy load only in browser
    if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');

        // Worker from CDN
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        const textContent = await page.getTextContent();

        // Extract text items and join them
        const pageText = textContent.items
            .map(item => item.str)
            .join(" ");

        fullText += pageText + "\n";
    }

    return fullText;
};