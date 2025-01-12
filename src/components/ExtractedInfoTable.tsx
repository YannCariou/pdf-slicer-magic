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
import { Check } from "lucide-react";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
}

interface ExtractedInfoTableProps {
  extractedInfos: ExtractedInfo[];
  onValidate: () => void;
  period?: string;
}

const ExtractedInfoTable = ({ extractedInfos, onValidate, period }: ExtractedInfoTableProps) => {
  console.log("Rendering table with extracted infos:", extractedInfos);
  
  return (
    <div className="w-full space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">N° Page</TableHead>
            <TableHead>Nom(s) & Prénom(s)</TableHead>
            <TableHead>Matricule</TableHead>
            <TableHead>Période</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extractedInfos.map((info) => (
            <TableRow key={info.pageNumber}>
              <TableCell>{info.pageNumber}</TableCell>
              <TableCell>{info.referenceText || "Non extrait"}</TableCell>
              <TableCell>{info.text}</TableCell>
              <TableCell>{period}</TableCell>
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