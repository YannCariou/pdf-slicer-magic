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
    
    setExtractedInfos(prev => {
      const exists = prev.some(info => info.pageNumber === pageNumber);
      if (exists) {
        // Si la page existe déjà, on met à jour la référence
        setReferencePosition(position);
        return prev.map(info => 
          info.pageNumber === pageNumber 
            ? { 
                ...info, 
                referenceText: text,
                referencePosition: position
              } 
            : info
        );
      } else {
        // Nouvelle page, on enregistre la position cible
        setTargetPosition(position);
        return [...prev, { 
          pageNumber, 
          text, 
          position,
        }];
      }
    });
  };

  const extractAllTexts = async (totalPages: number, position: { x: number; y: number }) => {
    console.log("Starting text extraction for all pages");
    const texts: { [pageNumber: number]: string } = {};
    
    if (!targetPosition || !referencePosition) {
      console.error("Target or reference position not set");
      return texts;
    }
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      try {
        // Extraire le texte cible
        const targetText = await extractTextFromPosition(selectedFile!, targetPosition, pageNumber, false);
        // Extraire le texte de référence
        const referenceText = await extractTextFromPosition(selectedFile!, referencePosition, pageNumber, true);
        
        texts[pageNumber] = targetText;
        
        setExtractedInfos(prev => {
          const existingInfo = prev.find(info => info.pageNumber === pageNumber);
          if (!existingInfo) {
            return [...prev, { 
              pageNumber, 
              text: targetText,
              referenceText: referenceText,
              position: targetPosition,
              referencePosition: referencePosition
            }];
          }
          return prev.map(info => 
            info.pageNumber === pageNumber 
              ? { 
                  ...info, 
                  text: targetText,
                  referenceText: referenceText,
                  position: targetPosition,
                  referencePosition: referencePosition
                } 
              : info
          );
        });
        
        console.log(`Extracted texts for page ${pageNumber}:`, { targetText, referenceText });
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