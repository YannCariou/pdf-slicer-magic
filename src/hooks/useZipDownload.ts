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

      // Créer un blob à partir du dataURL
      const base64Data = dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const downloadUrl = URL.createObjectURL(blob);
      console.log(`Download URL created: ${downloadUrl}`);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL
      URL.revokeObjectURL(downloadUrl);
      console.log(`Download URL revoked for ${fileName}`);

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
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          zip.file(fileName, blob);
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

      if (content.size === 0) {
        throw new Error("Le fichier ZIP généré est vide");
      }

      console.log(`ZIP généré avec succès, taille: ${content.size} bytes`);
      const zipUrl = URL.createObjectURL(content);
      console.log(`ZIP URL created: ${zipUrl}`);

      const link = document.createElement('a');
      link.href = zipUrl;
      const zipFileName = `BP_20${year}${month}.zip`;
      console.log(`Nom du fichier ZIP: ${zipFileName}`);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(zipUrl);
      console.log("ZIP URL revoked");

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