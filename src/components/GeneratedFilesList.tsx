import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedFilesListProps {
  files: string[];
}

const GeneratedFilesList = ({ files }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const downloadFile = async (fileName: string) => {
    try {
      console.log(`Tentative de téléchargement pour ${fileName}`);
      const url = window[`pdf_${fileName}`];
      
      if (!url) {
        console.error(`URL non trouvée pour ${fileName}`);
        throw new Error("URL non trouvée");
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
              onClick={() => downloadFile(file)}
              className="ml-2"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedFilesList;