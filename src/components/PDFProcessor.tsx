
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import ExtractedInfoTable from "./ExtractedInfoTable";
import { usePDFTextExtraction } from "@/hooks/usePDFTextExtraction";
import { useToast } from "@/hooks/use-toast";
import { splitPDFByPage } from "@/services/pdfService";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useZipDownload } from "@/hooks/useZipDownload";

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[], month: string, year: string) => void;
}

const formSchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Le mois doit être au format MM (01-12)"),
  year: z.string().regex(/^[0-9]{2}$/, "L'année doit être au format AA (00-99)")
});

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const { toast } = useToast();
  const [showTable, setShowTable] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<string>("");
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: "",
      year: ""
    }
  });
  
  const { 
    extractedInfos, 
    extractAllTexts 
  } = usePDFTextExtraction(selectedFile);

  const {
    downloadSingleFile,
    downloadAllFiles,
    isDownloading
  } = useZipDownload(currentMonth, currentYear);

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
      setProcessingStatus("Préparation des fichiers...");
      const generatedFileNames: string[] = [];
      const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = pdfDoc.getPageCount();
      
      // Traiter par petits lots pour éviter des problèmes de mémoire
      const batchSize = 5;
      
      for (let i = 0; i < totalPages; i += batchSize) {
        const lastIndex = Math.min(i + batchSize, totalPages);
        setProcessingStatus(`Traitement des pages ${i+1}-${lastIndex} sur ${totalPages}...`);
        
        // Traiter chaque page dans le lot actuel
        for (let pageNumber = i + 1; pageNumber <= lastIndex; pageNumber++) {
          const info = extractedInfos.find(info => info.pageNumber === pageNumber);
          if (!info) continue;
          
          console.log(`Traitement de la page ${pageNumber}`);
          try {
            const splitPdf = await splitPDFByPage(selectedFile, pageNumber);
            
            // Format du nom de fichier: "Nom(s) & Prénom(s)_Matricule_AAAAMM.pdf"
            const fileName = `${info.referenceText || 'Unknown'}_${info.text || 'NoID'}_${currentYear}${currentMonth}.pdf`;
            console.log(`Nom de fichier généré : ${fileName}`);
            
            const blob = new Blob([splitPdf], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);
            
            generatedFileNames.push(fileName);
            localStorage.setItem(fileName, downloadUrl);
          } catch (error) {
            console.error(`Erreur lors du traitement de la page ${pageNumber}:`, error);
          }
        }
        
        // Petite pause entre les lots pour permettre au garbage collector de faire son travail
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setGeneratedFiles(generatedFileNames);
      setProcessingStatus("");
      
      if (generatedFileNames.length === 0) {
        throw new Error("Aucun fichier n'a pu être généré");
      }
      
      if (generatedFileNames.length !== extractedInfos.length) {
        console.warn(`Attention: ${extractedInfos.length - generatedFileNames.length} fichiers n'ont pas pu être générés`);
      }
      
      onFilesGenerated(generatedFileNames, currentMonth, currentYear);
      toast({
        title: "Traitement terminé",
        description: `${generatedFileNames.length} fichiers ont été générés avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors du traitement:", error);
      setProcessingStatus("");
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
        description: `Les informations ont été extraites des ${totalPages} pages`,
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Période sélectionnée:", `${values.month}/${values.year}`);
    setCurrentMonth(values.month);
    setCurrentYear(values.year);
    handleExtractAll();
  };

  const handleDownloadAll = () => {
    if (generatedFiles.length > 0) {
      downloadAllFiles(generatedFiles);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 space-y-4">
      {!showTable ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mois (MM)</FormLabel>
                    <FormControl>
                      <Input placeholder="MM" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année (AA)</FormLabel>
                    <FormControl>
                      <Input placeholder="AA" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Extraire toutes les informations
            </Button>
          </form>
        </Form>
      ) : (
        <div className="p-4 space-y-4">
          <PDFViewer file={selectedFile} onTextSelect={() => {}} />

          {processingStatus && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800">
              {processingStatus}
            </div>
          )}

          {extractedInfos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-4">Informations extraites par page :</h4>
              <ExtractedInfoTable 
                extractedInfos={extractedInfos} 
                onValidate={handleTableValidation}
                generatedFiles={generatedFiles}
                onDownloadFile={downloadSingleFile}
                onDownloadAll={handleDownloadAll}
                hasGeneratedFiles={generatedFiles.length > 0}
                isDownloading={isDownloading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFProcessor;
