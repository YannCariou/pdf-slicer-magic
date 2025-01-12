import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface GeneratedFilesListProps {
  files: string[];
}

const GeneratedFilesList = ({ files }: GeneratedFilesListProps) => {
  const { toast } = useToast();

  const handleDownload = async (fileName: string) => {
    try {
      console.log(`Début du téléchargement de ${fileName}`);
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
    console.log("Début de la création du ZIP");
    try {
      const zip = new JSZip();
      
      // Ajouter chaque fichier au ZIP
      for (const fileName of files) {
        const downloadUrl = localStorage.getItem(fileName);
        if (!downloadUrl) {
          console.error(`URL not found for ${fileName}`);
          continue;
        }
        
        try {
          // Convertir le Data URL en Blob
          const base64Data = downloadUrl.split(',')[1];
          const blob = await fetch(`data:application/pdf;base64,${base64Data}`).then(res => res.blob());
          zip.file(fileName, blob);
          console.log(`Fichier ${fileName} ajouté au ZIP avec succès`);
        } catch (error) {
          console.error(`Erreur lors de l'ajout de ${fileName} au ZIP:`, error);
        }
      }
      
      console.log("Génération du ZIP...");
      const zipBlob = await zip.generateAsync({type: "blob"});
      console.log("ZIP généré avec succès");
      
      // Créer un URL pour le téléchargement
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = "documents.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

      toast({
        title: "Téléchargement réussi",
        description: "Tous les fichiers ont été téléchargés dans un ZIP.",
      });
    } catch (error) {
      console.error('Erreur lors de la création du ZIP:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du ZIP.",
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