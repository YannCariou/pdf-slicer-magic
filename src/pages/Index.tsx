import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PDFDropZone from "@/components/PDFDropZone";
import GeneratedFilesList from "@/components/GeneratedFilesList";
import PDFProcessor from "@/components/PDFProcessor";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleDownload = async (fileName: string) => {
    try {
      const downloadUrl = localStorage.getItem(fileName);
      if (!downloadUrl) throw new Error("URL not found");
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${fileName} a été téléchargé.`,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive",
      });
    }
  };

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
          <GeneratedFilesList files={generatedFiles} onDownload={handleDownload} />
        )}
      </div>
    </div>
  );
};

export default Index;