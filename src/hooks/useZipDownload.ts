import { useState } from 'react';
import JSZip from 'jszip';
import { useToast } from './use-toast';

export const useZipDownload = (month?: string, year?: string) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSingleFile = async (fileName: string) => {
    try {
      console.log(`Début du téléchargement de ${fileName}`);
      const dataUrl = localStorage.getItem(fileName);
      
      if (!dataUrl) {
        console.error(`URL not found for file: ${fileName}`);
        throw new Error("URL not found");
      }

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      if (blob.size === 0) {
        console.error(`Empty blob for file: ${fileName}`);
        throw new Error("Empty file");
      }

      console.log(`Blob created for ${fileName}, size: ${blob.size} bytes`);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      console.log(`Download URL created: ${downloadUrl}`);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
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
          const response = await fetch(dataUrl);
          if (!response.ok) {
            console.error(`Failed to fetch ${fileName}`);
            continue;
          }
          
          const pdfBlob = await response.blob();
          if (pdfBlob.size === 0) {
            console.error(`Empty PDF blob for ${fileName}`);
            continue;
          }
          
          console.log(`Adding ${fileName} to ZIP, blob size: ${pdfBlob.size} bytes`);
          zip.file(fileName, pdfBlob);
          hasFiles = true;
        } catch (error) {
          console.error(`Erreur lors de l'ajout de ${fileName} au ZIP:`, error);
        }
      }
      
      if (!hasFiles) {
        throw new Error("Aucun fichier n'a pu être ajouté au ZIP");
      }
      
      console.log("Génération du ZIP...");
      const zipBlob = await zip.generateAsync({type: "blob"});
      console.log(`ZIP généré avec succès, taille: ${zipBlob.size} bytes`);
      
      if (zipBlob.size === 0) {
        throw new Error("Le fichier ZIP généré est vide");
      }
      
      const zipUrl = URL.createObjectURL(zipBlob);
      console.log(`ZIP URL created: ${zipUrl}`);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      const zipFileName = `BP_20${year}${month}.zip`;
      console.log(`Nom du fichier ZIP: ${zipFileName}`);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(zipUrl);
      console.log("ZIP URL revoked");

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