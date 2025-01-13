import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PDFDropZone from "@/components/PDFDropZone";
import PDFProcessor from "@/components/PDFProcessor";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const { toast } = useToast();

  const handleFilesGenerated = (files: string[], month: string, year: string) => {
    setGeneratedFiles(files);
    setMonth(month);
    setYear(year);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1E293B]">Découpe PDF par YC (01/2025)</h1>
          <p className="text-gray-600">
            Sélectionnez le texte qui servira de modèle pour découper votre PDF
          </p>
        </header>

        <PDFDropZone onFileSelect={setSelectedFile} />

        {selectedFile && (
          <PDFProcessor 
            selectedFile={selectedFile}
            onFilesGenerated={handleFilesGenerated}
          />
        )}
      </div>
    </div>
  );
};

export default Index;