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
                referenceText: text, // Le nouveau texte devient la référence
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
      try {
        const text = await extractTextFromPosition(selectedFile!, position, pageNumber);
        texts[pageNumber] = text;
        console.log(`Found text at position for page ${pageNumber}: "${text}"`);
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