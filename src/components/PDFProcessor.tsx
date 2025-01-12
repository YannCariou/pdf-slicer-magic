import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";
import { useToast } from "@/hooks/use-toast";
import { splitPDFByPage } from "@/services/pdfService";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const { toast } = useToast();
  
  const { 
    extractedInfos, 
    extractAllTexts 
  } = usePDFTextExtraction(selectedFile);

  const handleTableValidation = async () => {
    if (extractedInfos.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord extraire des informations du PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Début du traitement du PDF");
      const generatedFileNames: string[] = [];
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const info = extractedInfos.find(info => info.pageNumber === pageNumber);
        if (!info) continue;

        console.log(`Traitement de la page ${pageNumber}`);
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        
        const fileName = info.text 
          ? `${info.text.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s-_.]/g, '_')}.pdf`
          : `page_${pageNumber}.pdf`;
        
        console.log(`Nom de fichier généré : ${fileName}`);
        generatedFileNames.push(fileName);
        
        const downloadUrl = URL.createObjectURL(splitPdf);
        localStorage.setItem(fileName, downloadUrl);
      }
      
      onFilesGenerated(generatedFileNames);
      toast({
        title: "Traitement terminé",
        description: "Les fichiers ont été générés avec succès.",
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <Button 
        onClick={handleExtractAll}
        className="w-full mb-4"
      >
        Extraire toutes les informations
      </Button>

      <PDFViewer file={selectedFile} onTextSelect={() => {}} />

      {extractedInfos.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-4">Informations extraites par page :</h4>
          <ExtractedInfoTable 
            extractedInfos={extractedInfos} 
            onValidate={handleTableValidation}
          />
        </div>
      )}
    </div>
  );
};

export default PDFProcessor;