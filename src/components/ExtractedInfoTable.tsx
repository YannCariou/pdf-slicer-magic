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
import { Check, Download } from "lucide-react";

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
}

const ExtractedInfoTable = ({ 
  extractedInfos, 
  onValidate, 
  generatedFiles = [],
  onDownloadFile
}: ExtractedInfoTableProps) => {
  console.log("Rendering table with extracted infos:", extractedInfos);
  console.log("Generated files:", generatedFiles);
  
  return (
    <div className="w-full space-y-4">
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
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-end">
        <Button 
          onClick={onValidate}
          className="flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Valider et générer les fichiers
        </Button>
      </div>
    </div>
  );
};

export default ExtractedInfoTable;