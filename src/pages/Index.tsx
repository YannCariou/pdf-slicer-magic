import { useState } from "react";
import { Upload, FileText, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PDFViewer from "@/components/PDFViewer";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageNumber: 1,
      selectedText: "",
    },
  });

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      toast({
        title: "PDF ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "PDF ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  const handleTextSelect = (text: string, position: { x: number; y: number }) => {
    setSelectedTextInfo({ text, position });
    form.setValue("selectedText", text);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleProcessPDF = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile || !selectedTextInfo) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF et le texte à extraire.",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing PDF with config:", values);
    console.log("Selected text position:", selectedTextInfo.position);
    console.log("Selected file:", selectedFile.name);

    try {
      // Simulation du traitement (à remplacer par l'appel à votre API)
      const mockGeneratedFiles = [
        `page_${values.pageNumber}_extrait.pdf`,
        `page_${values.pageNumber + 1}_extrait.pdf`,
      ];
      
      setGeneratedFiles(mockGeneratedFiles);
      toast({
        title: "Traitement terminé",
        description: "Les fichiers ont été générés avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du PDF.",
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

        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg mb-2">
              Glissez-déposez votre PDF ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">Formats acceptés : PDF</p>
          </label>
        </div>

        {selectedFile && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-medium">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <PDFViewer file={selectedFile} onTextSelect={handleTextSelect} />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProcessPDF)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pageNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de page exemple</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {selectedTextInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">Texte sélectionné :</h4>
                    <p className="text-sm text-gray-600">{selectedTextInfo.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Position : x={selectedTextInfo.position.x}, y={selectedTextInfo.position.y}
                    </p>
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Fichiers générés</h2>
            <div className="space-y-3">
              {generatedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span>{file}</span>
                  </div>
                  <button className="p-2 text-primary hover:text-primary-hover transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;