import { PDFExtract } from "pdf.js-extract";

const base64ToBuffer = (base64String) => {
  try {
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error('Invalid base64 data');
  }
};

const extractPdfTextBuffer = async (buffer) => {
  const options = { disableWorker: true };
  const pdfExtract = new PDFExtract();
  const chunks = [];
  const maxChunkSize = 2000;

  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, options, (err, data) => {
      if (err) {
        console.error(err, "Error PDF Extractor");
        return reject(err);
      }

      const pages = data.pages;
      pages.forEach((page) => {
        let ch = "";
        page.content.forEach((chunk) => {
          if ((ch + chunk.str).length > maxChunkSize) {
            chunks.push(ch);
            ch = chunk.str;
          } else {
            ch += chunk.str;
          }
        });

        // Push the last chunk if there's remaining content
        if (ch.length > 0) {
          chunks.push(ch);
        }
      });

      resolve(chunks);
    });
  });
};

const extractPdfText = async (fileData) => {
  const buffer = base64ToBuffer(fileData);
  return await extractPdfTextBuffer(buffer);
};

export { extractPdfText, extractPdfTextBuffer };