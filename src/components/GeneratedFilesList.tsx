import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedFilesListProps {
  files: string[];
  onDownload: (fileName: string) => void;
}

const GeneratedFilesList = ({ files, onDownload }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const downloadSingleFile = async (fileName: string) => {
    try {
      console.log(`Tentative de téléchargement pour ${fileName}`);
      const storedData = localStorage.getItem(fileName);
      
      if (!storedData) {
        console.error(`Données non trouvées pour ${fileName}`);
        throw new Error("Données non trouvées");
      }

      // Reconstruire le blob à partir des données stockées
      const { type, data } = JSON.parse(storedData);
      const blob = new Blob([new Uint8Array(data)], { type });

      // Créer et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      console.log(`Téléchargement réussi pour ${fileName}`);
      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${fileName} a été téléchargé.`,
      });
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${fileName}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de télécharger ${fileName}`,
        variant: "destructive",
      });
    }
  };

  const handleDownloadAll = async () => {
    console.log("Début du téléchargement groupé");
    let successCount = 0;
    
    for (const fileName of files) {
      try {
        await downloadSingleFile(fileName);
        successCount++;
        if (successCount < files.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Erreur lors du téléchargement de ${fileName}:`, error);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Téléchargements terminés",
        description: `${successCount} fichier(s) sur ${files.length} ont été téléchargés.`,
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
              size="sm"
              onClick={() => downloadSingleFile(file)}
              className="ml-2"
            >
              <Download className="w-4 h-4" />
            </Button>
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