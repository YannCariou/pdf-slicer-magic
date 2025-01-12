import { useState } from "react";
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import PDFProcessingForm from "./PDFProcessingForm";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";
import { useTextSelection } from "@/hooks/useTextSelection";
import SelectionModeButtons from "./SelectionModeButtons";
import SelectedTextInfo from "./SelectedTextInfo";
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
    handleTextSelect: handleExtractedTextSelect, 
    extractAllTexts 
  } = usePDFTextExtraction(selectedFile);
  
  const {
    selectedTextInfo,
    referenceTextInfo,
    selectionMode,
    handleTextSelect,
    setSelectionMode
  } = useTextSelection();

  const onTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    console.log('Text selected:', { text, position, pageNumber });
    handleTextSelect(text, position);
    handleExtractedTextSelect(text, position, pageNumber);
  };

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <SelectionModeButtons 
        selectionMode={selectionMode}
        onModeChange={setSelectionMode}
      />

      <PDFViewer file={selectedFile} onTextSelect={onTextSelect} />

      <SelectedTextInfo 
        selectedTextInfo={selectedTextInfo}
        referenceTextInfo={referenceTextInfo}
      />

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
          selectedTextInfo={selectedTextInfo}
          referenceTextInfo={referenceTextInfo}
          onFilesGenerated={onFilesGenerated}
          extractAllTexts={extractAllTexts}
        />
      )}
    </div>
  );
};

export default PDFProcessor;