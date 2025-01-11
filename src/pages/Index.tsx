import { useState } from "react";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PDFViewer from "@/components/PDFViewer";
import PDFDropZone from "@/components/PDFDropZone";
import GeneratedFilesList from "@/components/GeneratedFilesList";
import ExtractedInfoTable from "@/components/ExtractedInfoTable";
import { splitPDFByPage } from "@/services/pdfService";
import { PDFDocument } from 'pdf-lib';

interface ExtractedInfo {
  pageNumber: number;
  text: string;
}

const formSchema = z.object({
  pageNumber: z.number().min(1, "Le numéro de page doit être supérieur à 0"),
  selectedText: z.string().min(1, "Veuillez sélectionner un texte dans le PDF"),
});

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  const [selectedTextInfo, setSelectedTextInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);
  const [extractedInfos, setExtractedInfos] = useState<ExtractedInfo[]>([]);

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
            ? { ...info, text } 
            : info
        );
      }
      return [...prev, { pageNumber, text }];
    });
  };

  const handleProcessPDF = async () => {
    if (!selectedFile || extractedInfos.length === 0) {
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
        // Extraire le texte à la même position que celle sélectionnée initialement
        const selectedInfo = extractedInfos[0]; // Utiliser la première sélection comme modèle
        const extractedText = selectedInfo.text;
        
        // Générer un nouveau PDF pour cette page
        const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
        const fileName = `page_${pageNumber}_${extractedText.replace(/\s+/g, '_')}.pdf`;
        generatedFileNames.push(fileName);
        
        // Stocker le blob pour le téléchargement
        const downloadUrl = URL.createObjectURL(splitPdf);
        localStorage.setItem(fileName, downloadUrl);
      }
      
      setGeneratedFiles(generatedFileNames);
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

  const handleDownload = async (fileName: string) => {
    try {
      const downloadUrl = localStorage.getItem(fileName);
      if (!downloadUrl) throw new Error("URL not found");
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1E293B]">Découpe PDF</h1>
          <p className="text-lg text-gray-600">
            Sélectionnez le texte qui servira de modèle pour découper votre PDF
          </p>
        </header>

        <PDFDropZone onFileSelect={setSelectedFile} />

        {selectedFile && (
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
        )}

        {generatedFiles.length > 0 && (
          <GeneratedFilesList files={generatedFiles} onDownload={handleDownload} />
        )}
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir le nombre total de pages
const getNumberOfPages = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return pdfDoc.getPageCount();
};

export default Index;
