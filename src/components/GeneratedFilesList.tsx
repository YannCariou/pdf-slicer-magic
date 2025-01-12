import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedFilesListProps {
  files: string[];
  onDownload: (fileName: string) => void;
}

const GeneratedFilesList = ({ files, onDownload }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    try {
      console.log("Début du téléchargement groupé");
      
      for (const fileName of files) {
        const downloadUrl = localStorage.getItem(fileName);
        if (!downloadUrl) {
          console.error(`URL non trouvée pour ${fileName}`);
          continue;
        }

        // Créer un lien temporaire pour le téléchargement
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Fichier ${fileName} téléchargé`);
        
        // Petite pause entre chaque téléchargement pour éviter les problèmes de navigateur
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Téléchargement réussi",
        description: `${files.length} fichier(s) ont été téléchargés.`,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les fichiers.",
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
          </div>
        ))}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleDownloadAll}
            className="flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger la sélection ({files.length} fichier{files.length > 1 ? 's' : ''})
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneratedFilesList;