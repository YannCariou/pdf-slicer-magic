
import { useState } from 'react';
import { saveAs } from 'file-saver';
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

      fetch(dataUrl)
        .then(response => response.blob())
        .then(blob => {
          saveAs(blob, fileName);
          console.log(`Téléchargement réussi pour ${fileName}`);
          toast({
            title: "Téléchargement réussi",
            description: `Le fichier ${fileName} a été téléchargé.`,
          });
        })
        .catch(error => {
          throw error;
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
    console.log("Début de la création du ZIP avec", files.length, "fichiers");
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      let hasFiles = false;
      let processedCount = 0;

      // Traiter les fichiers par lots de 10 pour éviter les problèmes de mémoire
      const batchSize = 10;
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i += batchSize) {
        const batch = files.slice(i, Math.min(i + batchSize, totalFiles));
        
        // Traitement des fichiers dans ce lot
        for (const fileName of batch) {
          const dataUrl = localStorage.getItem(fileName);
          if (!dataUrl) {
            console.error(`URL not found for ${fileName}`);
            continue;
          }

          try {
            console.log(`Processing ${fileName}`);
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            zip.file(fileName, blob);
            hasFiles = true;
            processedCount++;
            console.log(`${fileName} ajouté au ZIP avec succès (${processedCount}/${totalFiles})`);
          } catch (error) {
            console.error(`Erreur lors de l'ajout de ${fileName} au ZIP:`, error);
          }
        }
        
        // Petite pause entre les lots pour permettre au navigateur de respirer
        await new Promise(resolve => setTimeout(resolve, 100));
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

      const zipFileName = `BP_20${year}${month}.zip`;
      console.log(`Nom du fichier ZIP: ${zipFileName}`);
      saveAs(content, zipFileName);

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
