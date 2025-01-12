import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import PDFProcessingForm from "./PDFProcessingForm";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";
import { useToast } from "@/hooks/use-toast";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const [isTableValidated, setIsTableValidated] = useState(false);
  const { toast } = useToast();
  
  const { 
    extractedInfos, 
    extractAllTexts 
  } = usePDFTextExtraction(selectedFile);

  const handleTableValidation = () => {
    if (extractedInfos.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord extraire des informations du PDF",
        variant: "destructive",
      });
      return;
    }
    
    setIsTableValidated(true);
    toast({
      title: "Tableau validé",
      description: "Vous pouvez maintenant générer les fichiers",
    });
  };

  const handleExtractAll = async () => {
    try {
      console.log("Début de l'extraction de toutes les pages");
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      console.log(`Nombre total de pages : ${totalPages}`);
      
      await extractAllTexts(totalPages);
      
      toast({
        title: "Extraction réussie",
        description: "Les informations ont été extraites de toutes les pages",
      });
    } catch (error) {
      console.error("Erreur lors de l'extraction:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'extraction",
        variant: "destructive",
      });
    }
  };

  // Récupérer la première entrée pour obtenir les positions
  const firstInfo = extractedInfos[0];
  const selectedTextInfo = firstInfo ? {
    text: firstInfo.text,
    position: { x: 0, y: 0 } // Les positions seront ajustées par extractAllTexts
  } : null;
  
  const referenceTextInfo = firstInfo ? {
    text: firstInfo.referenceText || "",
    position: { x: 0, y: 0 } // Les positions seront ajustées par extractAllTexts
  } : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <Button 
        onClick={handleExtractAll}
        className="w-full mb-4"
      >
        Extraire toutes les informations
      </Button>

      <PDFViewer file={selectedFile} onTextSelect={() => {}} />

      {extractedInfos.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-4">Informations extraites par page :</h4>
          <ExtractedInfoTable 
            extractedInfos={extractedInfos} 
            onValidate={handleTableValidation}
          />
        </div>
      )}

      {isTableValidated && (
        <PDFProcessingForm
          selectedFile={selectedFile}
          onFilesGenerated={onFilesGenerated}
          extractAllTexts={extractAllTexts}
          selectedTextInfo={selectedTextInfo}
          referenceTextInfo={referenceTextInfo}
        />
      )}
    </div>
  );
};

export default PDFProcessor;