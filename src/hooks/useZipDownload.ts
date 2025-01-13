import { useState } from 'react';
import JSZip from 'jszip';
import { useToast } from './use-toast';

export const useZipDownload = (month?: string, year?: string) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSingleFile = (fileName: string) => {
    try {
      console.log(`Début du téléchargement de ${fileName}`);
      const dataUrl = localStorage.getItem(fileName);
      
      if (!dataUrl) {
        console.error(`URL not found for file: ${fileName}`);
        throw new Error("URL not found");
      }

      console.log(`DataURL trouvée pour ${fileName}`);
      
      const link = document.createElement('a');
      link.href = dataUrl;
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
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive",
      });
    }
  };

  const downloadAllFiles = async (files: string[]) => {
    console.log("Début de la création du ZIP");
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      let hasFiles = false;

      for (const fileName of files) {
        const dataUrl = localStorage.getItem(fileName);
        if (!dataUrl) {
          console.error(`URL not found for ${fileName}`);
          continue;
        }

        try {
          console.log(`Processing ${fileName}`);
          const base64Data = dataUrl.split(',')[1];
          zip.file(fileName, base64Data, { base64: true });
          hasFiles = true;
          console.log(`${fileName} ajouté au ZIP avec succès`);
        } catch (error) {
          console.error(`Erreur lors de l'ajout de ${fileName} au ZIP:`, error);
        }
      }

      if (!hasFiles) {
        throw new Error("Aucun fichier n'a pu être ajouté au ZIP");
      }

      console.log("Génération du ZIP...");
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });

      const zipUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = zipUrl;
      const zipFileName = `BP_20${year}${month}.zip`;
      console.log(`Nom du fichier ZIP: ${zipFileName}`);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(zipUrl);

      toast({
        title: "Téléchargement réussi",
        description: "L'archive ZIP a été téléchargée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la création du ZIP:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du ZIP.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadSingleFile,
    downloadAllFiles,
    isDownloading
  };
};