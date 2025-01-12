import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedFilesListProps {
  files: string[];
}

const GeneratedFilesList = ({ files }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const handleDownload = async (fileName: string) => {
    try {
      const downloadUrl = localStorage.getItem(fileName);
      if (!downloadUrl) {
        throw new Error("URL not found");
      }

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

  const handleDownloadAll = async () => {
    console.log("Début du téléchargement de tous les fichiers");
    try {
      // Créer un délai entre chaque téléchargement pour éviter les problèmes de navigateur
      for (const fileName of files) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Attendre 500ms entre chaque téléchargement
        await handleDownload(fileName);
      }
      
      toast({
        title: "Téléchargement terminé",
        description: "Tous les fichiers ont été téléchargés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement multiple:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement des fichiers.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fichiers générés</h2>
        {files.length > 0 && (
          <Button
            onClick={handleDownloadAll}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Tout télécharger
          </Button>
        )}
      </div>
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