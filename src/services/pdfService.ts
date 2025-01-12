import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

export const splitPDFByPage = async (pdfFile: File, pageNumber: number): Promise<Blob> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const newPdfDoc = await PDFDocument.create();
  const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
  newPdfDoc.addPage(copiedPage);
  
  const pdfBytes = await newPdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const extractTextFromPosition = async (
  pdfFile: File,
  position: { x: number; y: number },
  pageNumber: number
): Promise<string> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  console.log(`Extracting text from page ${pageNumber} at position:`, position);
  
  let closestText = '';
  let minDistance = Infinity;
  const tolerance = 50; // Tolérance de 50 pixels pour la position
  
  for (const item of textContent.items) {
    const textItem = item as any;
    const itemX = textItem.transform[4];
    const itemY = textItem.transform[5];
    
    // Calculer la distance euclidienne entre la position cliquée et la position du texte
    const distance = Math.sqrt(
      Math.pow(position.x - itemX, 2) + 
      Math.pow(position.y - itemY, 2)
    );
    
    // Ne considérer que les textes dans la zone de tolérance
    if (distance < tolerance && distance < minDistance) {
      minDistance = distance;
      closestText = textItem.str;
      console.log(`Found closer text: "${closestText}" at distance ${distance}`);
    }
  }
  
  console.log(`Selected text for page ${pageNumber}: "${closestText}"`);
  return closestText || `page_${pageNumber}`;
};