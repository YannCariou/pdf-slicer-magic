import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PDFDocument } from 'pdf-lib';
import { splitPDFByPage } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({});

interface PDFProcessingFormProps {
  selectedFile: File;
  selectedTextInfo: { text: string; position: { x: number; y: number } } | null;
  referenceTextInfo: { text: string; position: { x: number; y: number } } | null;
  onFilesGenerated: (files: string[]) => void;
  extractAllTexts: (totalPages: number, position: { x: number; y: number }) => Promise<{ [pageNumber: number]: string }>;
}

const PDFProcessingForm = ({ 
  selectedFile, 
  selectedTextInfo,
  referenceTextInfo,
  onFilesGenerated,
  extractAllTexts 
}: PDFProcessingFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleProcessPDF = async () => {
    console.log("Début du traitement du PDF");
    if (!selectedFile || !selectedTextInfo || !referenceTextInfo) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF et les deux informations nécessaires.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Chargement du PDF");
      const generatedFileNames: string[] = [];
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      console.log(`Nombre total de pages : ${totalPages}`);
      
      console.log("Extraction des textes pour toutes les pages");
      const targetTexts = await extractAllTexts(totalPages, selectedTextInfo.position);
      const referenceTexts = await extractAllTexts(totalPages, referenceTextInfo.position);
      
      console.log("Textes extraits :", { targetTexts, referenceTexts });
      
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        console.log(`Traitement de la page ${pageNumber}`);
        const targetText = targetTexts[pageNumber];
        const referenceText = referenceTexts[pageNumber];
        
        console.log(`Page ${pageNumber} - Référence: ${referenceText}, Cible: ${targetText}`);
        
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        
        // Utiliser le texte cible pour le nom du fichier, avec fallback sur le numéro de page
        const fileName = targetText 
          ? `${targetText.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s-_.]/g, '_')}.pdf`
          : `page_${pageNumber}.pdf`;
        
        console.log(`Nom de fichier généré : ${fileName}`);
        generatedFileNames.push(fileName);
        
        const downloadUrl = URL.createObjectURL(splitPdf);
        localStorage.setItem(fileName, downloadUrl);
        console.log(`Fichier généré : ${fileName}`);
      }
      
      onFilesGenerated(generatedFileNames);
      toast({
        title: "Traitement terminé",
        description: "Les fichiers ont été générés avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleProcessPDF();
      }} className="space-y-4">
        <Button type="submit" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          Traiter le PDF
        </Button>
      </form>
    </Form>
  );
};

export default PDFProcessingForm;