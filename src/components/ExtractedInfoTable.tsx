
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
}

const ExtractedInfoTable = ({ 
  extractedInfos, 
  onValidate, 
  generatedFiles = [],
  onDownloadFile,
  onDownloadAll,
  hasGeneratedFiles,
  isProcessing = false,
  processingProgress = 0
}: ExtractedInfoTableProps) => {
  console.log("Rendering table with extracted infos:", extractedInfos);
  console.log("Generated files:", generatedFiles);
  
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
        {hasGeneratedFiles && onDownloadAll && (
          <Button
            onClick={onDownloadAll}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isProcessing}
          >
            <Download className="w-4 h-4" />
            Tout télécharger
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
                    {generatedFile && onDownloadFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadFile(generatedFile)}
                        className="hover:text-primary"
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
