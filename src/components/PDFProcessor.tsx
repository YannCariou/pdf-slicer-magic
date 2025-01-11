import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import SelectedTextPreview from "./SelectedTextPreview";
import PDFProcessingForm from "./PDFProcessingForm";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const [selectedTextInfo, setSelectedTextInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const { extractedInfos, handleTextSelect, extractAllTexts } = usePDFTextExtraction(selectedFile);

  const onTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    const textInfo = handleTextSelect(text, position, pageNumber);
    setSelectedTextInfo(textInfo);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <PDFViewer file={selectedFile} onTextSelect={onTextSelect} />

      {selectedTextInfo && (
        <SelectedTextPreview 
          text={selectedTextInfo.text} 
          position={selectedTextInfo.position} 
        />
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
        onFilesGenerated={onFilesGenerated}
        extractAllTexts={extractAllTexts}
      />
    </div>
  );
};

export default PDFProcessor;