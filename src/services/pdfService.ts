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
  const horizontalTolerance = 100; // Tolérance horizontale plus large
  const verticalTolerance = 10; // Tolérance verticale plus stricte
  
  for (const item of textContent.items) {
    const textItem = item as any;
    const itemX = textItem.transform[4];
    const itemY = textItem.transform[5];
    
    // Vérifier d'abord si nous sommes dans la même zone verticale
    const verticalDistance = Math.abs(position.y - itemY);
    if (verticalDistance <= verticalTolerance) {
      // Si nous sommes dans la bonne zone verticale, calculer la distance horizontale
      const horizontalDistance = Math.abs(position.x - itemX);
      if (horizontalDistance <= horizontalTolerance) {
        const totalDistance = Math.sqrt(
          Math.pow(horizontalDistance, 2) + 
          Math.pow(verticalDistance, 2)
        );
        
        if (totalDistance < minDistance) {
          minDistance = totalDistance;
          closestText = textItem.str;
          console.log(`Found closer text: "${closestText}" at distance ${totalDistance} (v:${verticalDistance}, h:${horizontalDistance})`);
        }
      }
    }
  }
  
  console.log(`Selected text for page ${pageNumber}: "${closestText}"`);
  return closestText || `page_${pageNumber}`;
};