import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExtractedInfo {
  pageNumber: number;
  text: string;
}

interface ExtractedInfoTableProps {
  extractedInfos: ExtractedInfo[];
}

const ExtractedInfoTable = ({ extractedInfos }: ExtractedInfoTableProps) => {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">N° Page</TableHead>
            <TableHead>Information extraite</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extractedInfos.map((info) => (
            <TableRow key={info.pageNumber}>
              <TableCell>{info.pageNumber}</TableCell>
              <TableCell>{info.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExtractedInfoTable;