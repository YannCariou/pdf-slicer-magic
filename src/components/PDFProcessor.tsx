import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { splitPDFByPage } from "@/services/pdfService";
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  position: { x: number; y: number };
}

const formSchema = z.object({
  pageNumber: z.number().min(1, "Le numéro de page doit être supérieur à 0"),
  selectedText: z.string().min(1, "Veuillez sélectionner un texte dans le PDF"),
});

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);
  const { toast } = useToast();
  const [selectedTextInfo, setSelectedTextInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageNumber: 1,
      selectedText: "",
    },
  });

  const handleTextSelect = (text: string, position: { x: number; y: number }, pageNumber: number) => {
    setSelectedTextInfo({ text, position });
    form.setValue("selectedText", text);
    
    setExtractedInfos(prev => {
      const exists = prev.some(info => info.pageNumber === pageNumber);
      if (exists) {
        return prev.map(info => 
          info.pageNumber === pageNumber 
            ? { ...info, text, position } 
            : info
        );
      }
      return [...prev, { pageNumber, text, position }];
    });
  };

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
      const totalPages = await getNumberOfPages(selectedFile);
      
      // Pour chaque page du PDF
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        // Extraire le texte à la même position sur chaque page
        const textAtPosition = await extractTextFromPosition(
          selectedFile,
          selectedTextInfo.position,
          pageNumber
        );
        
        // Générer un nouveau PDF pour cette page
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        const fileName = `page_${pageNumber}_${textAtPosition.replace(/\s+/g, '_')}.pdf`;
        generatedFileNames.push(fileName);
        
        // Stocker le blob pour le téléchargement
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <PDFViewer file={selectedFile} onTextSelect={handleTextSelect} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleProcessPDF)} className="space-y-4">
          {selectedTextInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Texte sélectionné :</h4>
              <p className="text-sm text-gray-600">{selectedTextInfo.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                Position : x={selectedTextInfo.position.x}, y={selectedTextInfo.position.y}
              </p>
            </div>
          )}

          {extractedInfos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-4">Informations extraites par page :</h4>
              <ExtractedInfoTable extractedInfos={extractedInfos} />
            </div>
          )}

          <Button type="submit" className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Traiter le PDF
          </Button>
        </form>
      </Form>
    </div>
  );
};

const getNumberOfPages = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
};

export default PDFProcessor;