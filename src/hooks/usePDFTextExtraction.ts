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
    console.log(`Handling text selection for page ${pageNumber}:`, text);
    
    setExtractedInfos(prev => {
      const exists = prev.some(info => info.pageNumber === pageNumber);
      if (exists) {
        return prev.map(info => 
          info.pageNumber === pageNumber 
            ? { 
                ...info, 
                referenceText: info.text, // L'ancien texte devient la référence
                text, // Le nouveau texte devient la cible
                position 
              } 
            : info
        );
      }
      return [...prev, { pageNumber, text, position }];
    });
    return { text, position };
  };

  const extractAllTexts = async (totalPages: number, position: { x: number; y: number }) => {
    const texts: { [pageNumber: number]: string } = {};
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`Extracting text from page ${pageNumber} at position:`, position);
      const text = await extractTextFromPosition(selectedFile!, position, pageNumber);
      texts[pageNumber] = text;
      console.log(`Found text at position: "${text}"`);
    }
    
    return texts;
  };

  return {
    extractedInfos,
    handleTextSelect,
    extractAllTexts
  };
};