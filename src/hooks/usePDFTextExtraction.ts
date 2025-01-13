import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
}

export const usePDFTextExtraction = (file: File) => {
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);

  const extractAllTexts = async (totalPages: number) => {
    console.log("Début de l'extraction de toutes les pages");
    const newExtractedInfos: ExtractedInfo[] = [];
    
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      for (let i = 1; i <= totalPages; i++) {
        const page = pdfDoc.getPage(i - 1);
        const text = await page.getTextContent();
        
        // Simulation d'extraction - à remplacer par la vraie logique d'extraction
        const matricule = `MAT${String(i).padStart(3, '0')}`;
        const nomPrenom = `NOM${String(i).padStart(3, '0')}`;
        
        newExtractedInfos.push({
          pageNumber: i,
          text: matricule,
          referenceText: nomPrenom
        });
      }
      
      setExtractedInfos(newExtractedInfos);
      console.log("Extraction terminée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'extraction:", error);
      throw error;
    }
  };

  const resetExtraction = () => {
    console.log("Réinitialisation de l'extraction");
    setExtractedInfos([]);
  };

  return {
    extractedInfos,
    extractAllTexts,
    resetExtraction
  };
};