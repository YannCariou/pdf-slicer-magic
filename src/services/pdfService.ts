import { PDFDocument } from 'pdf-lib';

export const splitPDFByPage = async (pdfFile: File, pageNumber: number): Promise<Blob> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Créer un nouveau document PDF avec une seule page
  const newPdfDoc = await PDFDocument.create();
  const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
  newPdfDoc.addPage(copiedPage);
  
  const pdfBytes = await newPdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const extractTextFromPosition = async (pdfFile: File, position: { x: number, y: number }, pageNumber: number): Promise<string> => {
  // Cette fonction sera implémentée plus tard pour extraire le texte à la position spécifiée
  // Pour l'instant, nous utilisons la position existante
  return `page_${pageNumber}`;
};