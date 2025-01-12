import { useState } from "react";
import { PDFDocument } from 'pdf-lib';
import { useToast } from "@/hooks/use-toast";
import { splitPDFByPage } from "@/services/pdfService";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";

export const usePDFProcessing = (selectedFile: File, onFilesGenerated: (files: string[]) => void) => {
  const { toast } = useToast();
  const [showTable, setShowTable] = useState(false);
  const [period, setPeriod] = useState<string>("");
  
  const { extractedInfos, extractAllTexts } = usePDFTextExtraction(selectedFile);

  const handleTableValidation = async (selectedPages: number[]) => {
    if (extractedInfos.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord extraire des informations du PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Début du traitement du PDF pour les pages:", selectedPages);
      const generatedFileNames: string[] = [];
      
      // Créer un tableau de promesses pour traiter tous les fichiers
      const processPromises = selectedPages.map(async (pageNumber) => {
        const info = extractedInfos.find(info => info.pageNumber === pageNumber);
        if (!info) return null;

        console.log(`Traitement de la page ${pageNumber}`);
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        
        const fileName = `${info.referenceText} ${info.text} ${period}.pdf`;
        console.log(`Nom de fichier généré : ${fileName}`);
        
        const url = URL.createObjectURL(splitPdf);
        localStorage.setItem(fileName, url);
        
        return fileName;
      });

      // Attendre que tous les fichiers soient traités
      const results = await Promise.all(processPromises);
      const validFileNames = results.filter((name): name is string => name !== null);
      
      onFilesGenerated(validFileNames);
      toast({
        title: "Traitement terminé",
        description: `${validFileNames.length} fichier(s) ont été générés avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors du traitement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExtractAll = async () => {
    try {
      console.log("Début de l'extraction de toutes les pages");
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      console.log(`Nombre total de pages : ${totalPages}`);
      
      await extractAllTexts(totalPages);
      setShowTable(true);
      
      toast({
        title: "Extraction réussie",
        description: "Les informations ont été extraites de toutes les pages",
      });
    } catch (error) {
      console.error("Erreur lors de l'extraction:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'extraction",
        variant: "destructive",
      });
    }
  };

  return {
    showTable,
    period,
    extractedInfos,
    setPeriod,
    handleTableValidation,
    handleExtractAll
  };
};