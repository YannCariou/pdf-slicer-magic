import { useState } from "react";
import { extractTextFromPosition } from "@/services/pdfService";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
  position: { x: number; y: number };
}

export const usePDFTextExtraction = (selectedFile: File | null) => {
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);

  const handleTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    console.log(`Handling text selection for page ${pageNumber}:`, { text, position });
    
    setExtractedInfos(prev => {
      const exists = prev.some(info => info.pageNumber === pageNumber);
      if (exists) {
        return prev.map(info => 
          info.pageNumber === pageNumber 
            ? { 
                ...info, 
                referenceText: text,
                position: info.position // Garder la position originale
              } 
            : info
        );
      }
      return [...prev, { pageNumber, text, position }];
    });
  };

  const extractAllTexts = async (totalPages: number, position: { x: number; y: number }) => {
    console.log("Starting text extraction for all pages with position:", position);
    const texts: { [pageNumber: number]: string } = {};
    
    // Créer une copie de la position pour éviter les références circulaires
    const fixedPosition = { x: position.x, y: position.y };
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`Extracting text from page ${pageNumber} at position:`, fixedPosition);
      try {
        const text = await extractTextFromPosition(selectedFile!, fixedPosition, pageNumber);
        texts[pageNumber] = text;
        
        setExtractedInfos(prev => {
          const existingInfo = prev.find(info => info.pageNumber === pageNumber);
          if (!existingInfo) {
            return [...prev, { 
              pageNumber, 
              text,
              position: fixedPosition 
            }];
          }
          return prev.map(info => 
            info.pageNumber === pageNumber 
              ? { ...info, text } 
              : info
          );
        });
        
        console.log(`Found text for page ${pageNumber}:`, text);
      } catch (error) {
        console.error(`Error extracting text from page ${pageNumber}:`, error);
        texts[pageNumber] = '';
      }
    }
    
    return texts;
  };

  return {
    extractedInfos,
    handleTextSelect,
    extractAllTexts
  };
};