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
  isReference: boolean = false
): Promise<string> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  console.log(`Extracting ${isReference ? 'reference' : 'target'} text from page ${pageNumber} at position:`, position);
  
  let closestText = '';
  let minDistance = Infinity;
  
  // Ajuster les tolérances en fonction du type de texte
  const horizontalTolerance = isReference ? 150 : 100; // Plus large pour la référence
  const verticalTolerance = 15; // Tolérance verticale pour les deux types
  
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
          Math.pow(verticalDistance, 2)
        );
        
        if (totalDistance < minDistance) {
          minDistance = totalDistance;
          closestText = textItem.str;
          console.log(`Found ${isReference ? 'reference' : 'target'} text: "${closestText}" at distance ${totalDistance} (v:${verticalDistance}, h:${horizontalDistance})`);
        }
      }
    }
  }
  
  console.log(`Selected ${isReference ? 'reference' : 'target'} text for page ${pageNumber}: "${closestText}"`);
  return closestText || `page_${pageNumber}`;
};