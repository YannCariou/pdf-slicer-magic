
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import PDFDropZone from "@/components/PDFDropZone";
import PDFProcessor from "@/components/PDFProcessor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const { toast } = useToast();
  const { logout, currentUser } = useAuth();

  const handleFilesGenerated = (files: string[], month: string, year: string) => {
    setGeneratedFiles(files);
    setMonth(month);
    setYear(year);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // La mémoire sera vidée car l'application sera réinitialisée après la déconnexion
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <header className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#1E293B]">Découpe PDF</h1>
            <p className="text-sm text-gray-600">
              par YC pour Inetum Software (01/2025)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <>
                <span className="text-sm text-gray-500">{currentUser.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut size={16} />
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </header>

        <PDFDropZone onFileSelect={setSelectedFile} />

        {selectedFile && (
          <PDFProcessor 
            selectedFile={selectedFile}
            onFilesGenerated={handleFilesGenerated}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
