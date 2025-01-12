import { useState } from "react";
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import SelectedTextPreview from "./SelectedTextPreview";
import PDFProcessingForm from "./PDFProcessingForm";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const [selectedTextInfo, setSelectedTextInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const [referenceTextInfo, setReferenceTextInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const [selectionMode, setSelectionMode] = useState<'target' | 'reference'>('target');
  const { toast } = useToast();

  const { extractedInfos, handleTextSelect, extractAllTexts } = usePDFTextExtraction(selectedFile);

  const onTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    if (selectionMode === 'target') {
      const textInfo = handleTextSelect(text, position, pageNumber);
      setSelectedTextInfo(textInfo);
      toast({
        title: "Information cible sélectionnée",
        description: "Vous pouvez maintenant sélectionner l'information de référence",
      });
      setSelectionMode('reference');
    } else {
      setReferenceTextInfo({ text, position });
      toast({
        title: "Information de référence sélectionnée",
        description: "Les deux informations ont été sélectionnées",
      });
      setSelectionMode('target');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={() => setSelectionMode('target')}
          variant={selectionMode === 'target' ? "default" : "outline"}
        >
          Sélectionner l'information cible
        </Button>
        <Button 
          onClick={() => setSelectionMode('reference')}
          variant={selectionMode === 'reference' ? "default" : "outline"}
        >
          Sélectionner l'information de référence
        </Button>
      </div>

      <PDFViewer file={selectedFile} onTextSelect={onTextSelect} />

      {selectedTextInfo && (
        <div className="space-y-2">
          <h4 className="font-medium">Information cible sélectionnée :</h4>
          <SelectedTextPreview 
            text={selectedTextInfo.text} 
            position={selectedTextInfo.position} 
          />
        </div>
      )}

      {referenceTextInfo && (
        <div className="space-y-2">
          <h4 className="font-medium">Information de référence sélectionnée :</h4>
          <SelectedTextPreview 
            text={referenceTextInfo.text} 
            position={referenceTextInfo.position} 
          />
        </div>
      )}

      {extractedInfos.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-4">Informations extraites par page :</h4>
          <ExtractedInfoTable extractedInfos={extractedInfos} />
        </div>
      )}

      <PDFProcessingForm
        selectedFile={selectedFile}
        selectedTextInfo={selectedTextInfo}
        referenceTextInfo={referenceTextInfo}
        onFilesGenerated={onFilesGenerated}
        extractAllTexts={extractAllTexts}
      />
    </div>
  );
};

export default PDFProcessor;