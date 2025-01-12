import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PDFDropZone from "@/components/PDFDropZone";
import GeneratedFilesList from "@/components/GeneratedFilesList";
import PDFProcessor from "@/components/PDFProcessor";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1E293B]">Découpe PDF</h1>
          <p className="text-lg text-gray-600">
            Sélectionnez le texte qui servira de modèle pour découper votre PDF
          </p>
        </header>

        <PDFDropZone onFileSelect={setSelectedFile} />

        {selectedFile && (
          <PDFProcessor 
            selectedFile={selectedFile}
            onFilesGenerated={setGeneratedFiles}
          />
        )}

        {generatedFiles.length > 0 && (
          <GeneratedFilesList 
            files={generatedFiles}
            month={month}
            year={year}
          />
        )}
      </div>
    </div>
  );
};

export default Index;