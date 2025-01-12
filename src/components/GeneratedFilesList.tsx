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
      console.log(`Téléchargement unique du fichier ${fileName}`);
      const base64Data = localStorage.getItem(fileName);
      
      if (!base64Data) {
        console.error(`Données non trouvées pour ${fileName}`);
        throw new Error("Données non trouvées");
      }

      const base64Content = base64Data.split(',')[1];
      const binaryStr = window.atob(base64Content);
      const bytes = new Uint8Array(binaryStr.length);
      
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      
      console.log(`Clic sur le lien pour ${fileName}`);
      a.click();
      
      // Attendre un peu avant de nettoyer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`Fichier ${fileName} téléchargé avec succès`);
      
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
    
    for (const fileName of files) {
      try {
        await downloadSingleFile(fileName);
        // Attendre entre chaque fichier
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erreur lors du téléchargement de ${fileName}:`, error);
      }
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