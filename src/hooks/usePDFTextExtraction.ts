import { useState } from "react";
import { findTextAfterReference } from "@/services/pdfService";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
}

export const usePDFTextExtraction = (selectedFile: File | null) => {
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);
  
  const extractAllTexts = async (totalPages: number) => {
    console.log("Starting text extraction for all pages");
    const texts: { [pageNumber: number]: string } = {};
    
    if (!selectedFile) {
      console.error("No file selected");
      return texts;
    }
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      try {
        // Extraire le matricule (après "Matricule")
        const matriculeResult = await findTextAfterReference(selectedFile, "Matricule", pageNumber);
        // Extraire le nom (après "Nom(s) & Prénom(s)")
        const nomResult = await findTextAfterReference(selectedFile, "Nom(s) & Prénom(s)", pageNumber);
        
        // Mettre à jour les informations extraites
        setExtractedInfos(prev => {
          const existingInfo = prev.find(info => info.pageNumber === pageNumber);
          if (existingInfo) {
            return prev.map(info => 
              info.pageNumber === pageNumber 
                ? {
                    ...info,
                    text: matriculeResult.text,
                    referenceText: nomResult.text
                  }
                : info
            );
          } else {
            return [...prev, {
              pageNumber,
              text: matriculeResult.text,
              referenceText: nomResult.text
            }];
          }
        });
        
        texts[pageNumber] = matriculeResult.text;
        console.log(`Extracted for page ${pageNumber}:`, {
          matricule: matriculeResult.text,
          nom: nomResult.text
        });
      } catch (error) {
        console.error(`Error extracting text from page ${pageNumber}:`, error);
        texts[pageNumber] = '';
      }
    }
    
    return texts;
  };

  return {
    extractedInfos,
    extractAllTexts
  };
};