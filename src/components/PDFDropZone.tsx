import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFDropZoneProps {
  onFileSelect: (file: File) => void;
}

const PDFDropZone = ({ onFileSelect }: PDFDropZoneProps) => {
  const { toast } = useToast();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      onFileSelect(file);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      toast({
        title: "PDF ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  return (
    <div
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
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
  );
};

export default PDFDropZone;