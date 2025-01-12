import { useState } from "react";
import { extractTextFromPosition } from "@/services/pdfService";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
  position: { x: number; y: number };
  referencePosition?: { x: number; y: number };
}

export const usePDFTextExtraction = (selectedFile: File | null) => {
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [referencePosition, setReferencePosition] = useState<{ x: number; y: number } | null>(null);

  const handleTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    console.log(`Handling text selection for page ${pageNumber}:`, { text, position });
    
    const exists = extractedInfos.some(info => info.pageNumber === pageNumber);
    
    if (exists) {
      // Mise à jour de l'information de référence
      setReferencePosition(position);
      setExtractedInfos(prev => 
        prev.map(info => 
          info.pageNumber === pageNumber 
            ? { 
                ...info, 
                referenceText: text,
                referencePosition: position
              } 
            : info
        )
      );
    } else {
      // Nouvelle entrée avec l'information cible
      setTargetPosition(position);
      setExtractedInfos(prev => [...prev, { 
        pageNumber, 
        text,
        position,
      }]);
    }
  };

  const extractAllTexts = async (totalPages: number, position: { x: number; y: number }) => {
    console.log("Starting text extraction for all pages");
    const texts: { [pageNumber: number]: string } = {};
    
    if (!selectedFile) {
      console.error("No file selected");
      return texts;
    }
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      try {
        const text = await extractTextFromPosition(selectedFile, position, pageNumber);
        texts[pageNumber] = text;
        
        console.log(`Extracted text for page ${pageNumber}:`, text);
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