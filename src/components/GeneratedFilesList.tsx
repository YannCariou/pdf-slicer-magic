import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedFilesListProps {
  files: string[];
  onDownload: (fileName: string) => void;
}

const GeneratedFilesList = ({ files, onDownload }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const handleDownload = async (fileName: string) => {
    try {
      const downloadUrl = localStorage.getItem(fileName);
      if (!downloadUrl) {
        throw new Error("URL not found");
      }

      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName; // Définit le nom du fichier pour le téléchargement
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Fichiers générés</h2>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span>{file}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(file)}
              className="text-primary hover:text-primary-hover transition-colors"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedFilesList;