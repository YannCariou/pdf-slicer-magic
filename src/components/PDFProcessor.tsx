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

interface PDFProcessorProps {
  selectedFile: File;
  onFilesGenerated: (files: string[]) => void;
}

const formSchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Le mois doit être au format MM (01-12)"),
  year: z.string().regex(/^[0-9]{2}$/, "L'année doit être au format AA (00-99)")
});

const PDFProcessor = ({ selectedFile, onFilesGenerated }: PDFProcessorProps) => {
  const { toast } = useToast();
  const [showTable, setShowTable] = useState(false);
  
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
        
        // Créer le nom du fichier avec le format "Nom Prénom Matricule.pdf"
        const fileName = `${info.referenceText} ${info.text}.pdf`;
        console.log(`Nom de fichier généré : ${fileName}`);
        
        // Créer un Blob à partir du PDF
        const blob = new Blob([splitPdf], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);
        
        generatedFileNames.push(fileName);
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Période sélectionnée:", `${values.month}/${values.year}`);
    handleExtractAll();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      {!showTable ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <>
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
        </>
      )}
    </div>
  );
};

export default PDFProcessor;