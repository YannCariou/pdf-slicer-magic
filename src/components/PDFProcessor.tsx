import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import PeriodForm from "./PeriodForm";
import { usePDFProcessing } from "@/hooks/usePDFProcessing";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const {
    showTable,
    period,
    extractedInfos,
    setPeriod,
    handleTableValidation,
    handleExtractAll
  } = usePDFProcessing(selectedFile, onFilesGenerated);

  const handlePeriodSubmit = (newPeriod: string) => {
    setPeriod(newPeriod);
    handleExtractAll();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      {!showTable ? (
        <PeriodForm onSubmit={handlePeriodSubmit} />
      ) : (
        <>
          <PDFViewer file={selectedFile} onTextSelect={() => {}} />

          {extractedInfos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-4">Informations extraites par page :</h4>
              <ExtractedInfoTable 
                extractedInfos={extractedInfos} 
                onValidate={handleTableValidation}
                period={period}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PDFProcessor;