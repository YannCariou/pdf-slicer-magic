
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
import { Check, Download, Archive, Loader2 } from "lucide-react";

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
  isDownloading?: boolean;
}

const ExtractedInfoTable = ({ 
  extractedInfos, 
  onValidate, 
  generatedFiles = [],
  onDownloadFile,
  onDownloadAll,
  hasGeneratedFiles,
  isDownloading = false
}: ExtractedInfoTableProps) => {
  console.log("Rendering table with extracted infos:", extractedInfos);
  console.log("Generated files:", generatedFiles);
  
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end gap-4 mb-4">
        <Button 
          onClick={onValidate}
          className="flex items-center gap-2"
          disabled={hasGeneratedFiles || isDownloading}
        >
          <Check className="w-4 h-4" />
          Valider et générer les fichiers
        </Button>
        {hasGeneratedFiles && onDownloadAll && (
          <Button
            onClick={onDownloadAll}
            className="flex items-center gap-2"
            variant="secondary"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création du ZIP en cours...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Télécharger all.zip ({generatedFiles.length} fichiers)
              </>
            )}
          </Button>
        )}
      </div>

      <div className="bg-blue-50 rounded p-3 mb-4 text-sm text-blue-800">
        <strong>{extractedInfos.length}</strong> pages détectées. {hasGeneratedFiles && <strong>{generatedFiles.length}</strong>} fichiers générés.
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">N° Page</TableHead>
            <TableHead>Nom(s) & Prénom(s)</TableHead>
            <TableHead>Matricule</TableHead>
            <TableHead className="w-24">Fichier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extractedInfos.map((info) => (
            <TableRow key={info.pageNumber}>
              <TableCell>{info.pageNumber}</TableCell>
              <TableCell>{info.referenceText || "Non extrait"}</TableCell>
              <TableCell>{info.text}</TableCell>
              <TableCell>
                {generatedFiles[info.pageNumber - 1] && onDownloadFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownloadFile(generatedFiles[info.pageNumber - 1])}
                    className="hover:text-primary"
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExtractedInfoTable;
