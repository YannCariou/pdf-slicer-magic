import { useState } from "react";
import { Upload, FileText, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      toast({
        title: "PDF ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "PDF ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleProcessPDF = () => {
    // Simulation du traitement pour la démo
    console.log("Processing PDF:", selectedFile?.name);
    const mockGeneratedFiles = [
      "Dupont_Jean_12345_Janvier_1.pdf",
      "Martin_Marie_67890_Janvier_2.pdf",
    ];
    setGeneratedFiles(mockGeneratedFiles);
    toast({
      title: "Traitement terminé",
      description: "Les fichiers ont été générés avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1E293B]">Découpe PDF</h1>
          <p className="text-lg text-gray-600">
            Découpez et renommez vos fichiers PDF en quelques clics
          </p>
        </header>

        {/* Zone de dépôt */}
        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg mb-2">
              Glissez-déposez votre PDF ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">Formats acceptés : PDF</p>
          </label>
        </div>

        {/* Fichier sélectionné */}
        {selectedFile && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-medium">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleProcessPDF}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                <Settings className="w-4 h-4" />
                Traiter le PDF
              </button>
            </div>
          </div>
        )}

        {/* Fichiers générés */}
        {generatedFiles.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Fichiers générés</h2>
            <div className="space-y-3">
              {generatedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span>{file}</span>
                  </div>
                  <button className="p-2 text-primary hover:text-primary-hover transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;