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

const formSchema = z.object({
  selectedText: z.string().min(1, "Veuillez sélectionner un texte dans le PDF"),
});

interface PDFProcessingFormProps {
  selectedFile: File;
  selectedTextInfo: { text: string; position: { x: number; y: number } } | null;
  onFilesGenerated: (files: string[]) => void;
  extractAllTexts: (totalPages: number, position: { x: number; y: number }) => Promise<{ [pageNumber: number]: string }>;
}

const PDFProcessingForm = ({ 
  selectedFile, 
  selectedTextInfo, 
  onFilesGenerated,
  extractAllTexts 
}: PDFProcessingFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedText: "",
    },
  });

  const handleProcessPDF = async () => {
    if (!selectedFile || !selectedTextInfo) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF et extraire au moins une information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedFileNames: string[] = [];
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      
      const pageTexts = await extractAllTexts(totalPages, selectedTextInfo.position);
      
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const pageText = pageTexts[pageNumber] || `page_${pageNumber}`;
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        const fileName = `page_${pageNumber}_${pageText.replace(/\s+/g, '_')}.pdf`;
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
      <form onSubmit={form.handleSubmit(handleProcessPDF)} className="space-y-4">
        <Button type="submit" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          Traiter le PDF
        </Button>
      </form>
    </Form>
  );
};

export default PDFProcessingForm;