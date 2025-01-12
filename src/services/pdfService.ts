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
  pageNumber: number,
): Promise<string> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  console.log(`Extracting text from page ${pageNumber} at position:`, position);
  
  let targetText = '';
  let minDistance = Infinity;
  
  // Ajuster les tolérances
  const horizontalTolerance = 200; // Augmenté pour chercher plus loin horizontalement
  const verticalTolerance = 10;
  
  for (const item of textContent.items) {
    const textItem = item as any;
    const itemX = textItem.transform[4];
    const itemY = textItem.transform[5];
    
    const verticalDistance = Math.abs(position.y - itemY);
    
    if (verticalDistance <= verticalTolerance) {
      const horizontalDistance = Math.abs(position.x - itemX);
      
      if (horizontalDistance <= horizontalTolerance) {
        const totalDistance = Math.sqrt(
          Math.pow(horizontalDistance, 2) + 
          Math.pow(verticalDistance * 2, 2)
        );
        
        if (totalDistance < minDistance) {
          minDistance = totalDistance;
          targetText = textItem.str;
        }
      }
    }
  }
  
  return targetText;
};

export const findTextAfterReference = async (
  pdfFile: File,
  referenceText: string,
  pageNumber: number
): Promise<{ text: string; position: { x: number; y: number } }> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  console.log(`Searching for text after "${referenceText}" on page ${pageNumber}`);
  
  let referencePosition: { x: number; y: number } | null = null;
  let referenceIndex = -1;
  
  // Trouver d'abord la position du texte de référence et son index
  for (let i = 0; i < textContent.items.length; i++) {
    const textItem = textContent.items[i] as any;
    if (textItem.str.includes(referenceText)) {
      referencePosition = {
        x: textItem.transform[4],
        y: textItem.transform[5]
      };
      referenceIndex = i;
      break;
    }
  }
  
  if (referencePosition && referenceIndex !== -1) {
    // Chercher le texte qui suit immédiatement la référence
    const nextItems = textContent.items.slice(referenceIndex + 1);
    const verticalTolerance = 5;
    
    for (const item of nextItems) {
      const textItem = item as any;
      const itemY = textItem.transform[5];
      
      // Vérifier si c'est sur la même ligne (à peu près)
      if (Math.abs(itemY - referencePosition.y) <= verticalTolerance) {
        // Ignorer les caractères spéciaux comme ":" et les espaces
        if (textItem.str.trim() && textItem.str.trim() !== ':') {
          console.log(`Found text "${textItem.str}" after "${referenceText}" on page ${pageNumber}`);
          return {
            text: textItem.str.trim(),
            position: {
              x: textItem.transform[4],
              y: itemY
            }
          };
        }
      }
    }
  }
  
  console.warn(`No valid text found after "${referenceText}" on page ${pageNumber}`);
  return { text: '', position: { x: 0, y: 0 } };
};
