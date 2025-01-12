import React, { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
  referenceText?: string;
}

interface ExtractedInfoTableProps {
  extractedInfos: ExtractedInfo[];
  onValidate: (selectedPages: number[]) => void;
  period?: string;
}

const ExtractedInfoTable = ({ extractedInfos, onValidate, period }: ExtractedInfoTableProps) => {
  const [selectionType, setSelectionType] = useState<string>("all");
  const [pageSelection, setPageSelection] = useState<string>("");
  
  const handleValidate = () => {
    let selectedPages: number[] = [];
    
    switch (selectionType) {
      case "all":
        selectedPages = extractedInfos.map(info => info.pageNumber);
        break;
      case "range":
        const [start, end] = pageSelection.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          selectedPages = Array.from(
            { length: end - start + 1 },
            (_, i) => start + i
          ).filter(page => extractedInfos.some(info => info.pageNumber === page));
        }
        break;
      case "specific":
        selectedPages = pageSelection
          .split(",")
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num) && extractedInfos.some(info => info.pageNumber === num));
        break;
    }
    
    onValidate(selectedPages);
  };

  return (
    <div className="w-full space-y-6">
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
      
      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Sélection des pages à générer</h3>
        
        <RadioGroup
          defaultValue="all"
          onValueChange={setSelectionType}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">Toutes les pages</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="range" id="range" />
            <Label htmlFor="range">Plage de pages</Label>
            {selectionType === "range" && (
              <Input
                placeholder="ex: 7-12"
                className="w-32 ml-2"
                value={pageSelection}
                onChange={(e) => setPageSelection(e.target.value)}
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific" />
            <Label htmlFor="specific">Pages spécifiques</Label>
            {selectionType === "specific" && (
              <Input
                placeholder="ex: 5,7,3,12"
                className="w-48 ml-2"
                value={pageSelection}
                onChange={(e) => setPageSelection(e.target.value)}
              />
            )}
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleValidate}
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