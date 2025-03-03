
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
    if (!files || files.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun fichier à télécharger.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Début de la création du ZIP avec ${files.length} fichiers`);
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      const batchSize = 3; // Traiter 3 fichiers à la fois pour éviter les problèmes de mémoire
      let processedCount = 0;
      let failedCount = 0;
      
      // Traiter les fichiers par lots
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i/batchSize + 1}/${Math.ceil(files.length/batchSize)}, ${batch.length} fichiers`);
        
        // Traiter chaque fichier dans le lot actuel
        const batchPromises = batch.map(async (fileName) => {
          const dataUrl = localStorage.getItem(fileName);
          if (!dataUrl) {
            console.error(`URL not found for ${fileName}`);
            failedCount++;
            return;
          }
          
          try {
            console.log(`Récupération du fichier ${fileName}...`);
            const response = await fetch(dataUrl);
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const blob = await response.blob();
            console.log(`Ajout de ${fileName} (${blob.size} octets) au ZIP`);
            zip.file(fileName, blob);
            processedCount++;
          } catch (error) {
            console.error(`Erreur lors de l'ajout de ${fileName} au ZIP:`, error);
            failedCount++;
          }
        });
        
        // Attendre que tous les fichiers du lot soient traités
        await Promise.all(batchPromises);
        
        // Petite pause entre les lots pour permettre au garbage collector de faire son travail
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`Progression: ${processedCount}/${files.length} fichiers traités`);
      }
      
      if (processedCount === 0) {
        throw new Error("Aucun fichier n'a pu être ajouté au ZIP");
      }
      
      console.log(`Génération du ZIP avec ${processedCount} fichiers...`);
      const zipName = `all.zip`;
      
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5 // Niveau de compression moyen pour un bon équilibre entre vitesse et taille
        }
      }, (metadata) => {
        console.log(`Progression ZIP: ${metadata.percent.toFixed(1)}%`);
      });
      
      console.log(`ZIP généré: ${content.size} octets. Démarrage du téléchargement...`);
      saveAs(content, zipName);
      
      toast({
        title: "Téléchargement réussi",
        description: `L'archive ZIP a été téléchargée avec ${processedCount} fichiers${failedCount > 0 ? ` (${failedCount} fichiers n'ont pas pu être inclus)` : ''}.`,
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
