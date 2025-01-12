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
        console.log(`Tentative de téléchargement pour ${fileName}`);
        const pdfData = localStorage.getItem(fileName);
        
        if (!pdfData) {
          console.error(`Données non trouvées pour ${fileName}`);
          continue;
        }

        console.log("Format des données PDF:", pdfData.substring(0, 100));

        try {
          // Vérifier si les données sont au format base64
          if (!pdfData.includes('base64')) {
            console.error("Les données ne sont pas au format base64");
            throw new Error("Format de données invalide");
          }

          // Extraire la partie base64 des données
          const base64Data = pdfData.split(',')[1];
          console.log("Longueur des données base64:", base64Data.length);

          // Convertir les données base64 en Blob
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          console.log("Blob créé avec succès, taille:", blob.size);
          
          // Créer une URL à partir du Blob
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Créer un lien temporaire pour le téléchargement
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          
          // Ajouter le lien au document
          document.body.appendChild(link);
          
          // Déclencher le clic
          link.click();
          
          // Nettoyer
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          
          console.log(`Fichier ${fileName} téléchargé avec succès`);
        } catch (error) {
          console.error(`Erreur lors du traitement du fichier ${fileName}:`, error);
          throw error;
        }
        
        // Attendre entre chaque téléchargement
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Téléchargement réussi",
        description: `${files.length} fichier(s) ont été téléchargés.`,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement des fichiers.",
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