import { PDFDocument } from 'pdf-lib';

export const splitPDFByPage = async (pdfFile: File, pageNumber: number): Promise<Blob> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};