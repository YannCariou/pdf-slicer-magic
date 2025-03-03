
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useZipDownload } from "@/hooks/useZipDownload";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
}

interface ExtractedInfoTableProps {
  extractedInfos: ExtractedInfo[];
  onValidate: () => void;
  generatedFiles?: string[];
  onDownloadFile?: (fileName: string) => void;
  onDownloadAll?: () => void;
  hasGeneratedFiles: boolean;
  isProcessing?: boolean;
  processingProgress?: number;
  month?: string;
  year?: string;
}

const ExtractedInfoTable = ({ 
  extractedInfos, 
  onValidate, 
  generatedFiles = [],
  onDownloadFile,
  onDownloadAll,
  hasGeneratedFiles,
  isProcessing = false,
  processingProgress = 0,
  month = "",
  year = ""
}: ExtractedInfoTableProps) => {
  console.log("Rendering table with extracted infos:", extractedInfos);
  console.log("Generated files:", generatedFiles);
  
  // Utiliser le hook useZipDownload pour la création du ZIP
  const { downloadSingleFile, downloadAllFiles, isDownloading } = useZipDownload(month, year);
  
  const handleDownloadSingle = (fileName: string) => {
    if (onDownloadFile) {
      onDownloadFile(fileName);
    } else {
      downloadSingleFile(fileName);
    }
  };
  
  const handleDownloadAll = () => {
    console.log("Tentative de téléchargement ZIP avec", generatedFiles.length, "fichiers");
    if (onDownloadAll) {
      onDownloadAll();
    } else {
      downloadAllFiles(generatedFiles);
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end gap-4 mb-4">
        <Button 
          onClick={onValidate}
          className="flex items-center gap-2"
          disabled={hasGeneratedFiles || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isProcessing ? "Traitement en cours..." : "Valider et générer les fichiers"}
        </Button>
        {hasGeneratedFiles && (
          <Button
            onClick={handleDownloadAll}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isProcessing || isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Création du ZIP..." : `Télécharger en ZIP (${generatedFiles.length} fichiers)`}
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Création des fichiers en cours...</span>
            <span>{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      )}

      <div className="overflow-auto max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 sticky top-0 bg-white">N° Page</TableHead>
              <TableHead className="sticky top-0 bg-white">Nom(s) & Prénom(s)</TableHead>
              <TableHead className="sticky top-0 bg-white">Matricule</TableHead>
              <TableHead className="w-24 sticky top-0 bg-white">Fichier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extractedInfos.map((info) => {
              const fileIndex = info.pageNumber - 1;
              const generatedFile = generatedFiles.length > fileIndex ? generatedFiles[fileIndex] : null;
              
              return (
                <TableRow key={info.pageNumber}>
                  <TableCell>{info.pageNumber}</TableCell>
                  <TableCell>{info.referenceText || "Non extrait"}</TableCell>
                  <TableCell>{info.text}</TableCell>
                  <TableCell>
                    {generatedFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadSingle(generatedFile)}
                        className="hover:text-primary"
                        disabled={isDownloading}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExtractedInfoTable;
