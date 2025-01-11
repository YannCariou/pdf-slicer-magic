import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  onTextSelect: (text: string, position: { x: number; y: number }, pageNumber: number) => void;
}

const PDFViewer = ({ file, onTextSelect }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { toast } = useToast();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    toast({
      title: "PDF chargé",
      description: `${numPages} pages détectées`,
    });
  }

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onTextSelect(selection.toString(), {
        x: rect.x,
        y: rect.y
      }, pageNumber);
      toast({
        title: "Texte sélectionné",
        description: `"${selection.toString()}" sera utilisé comme modèle pour la page ${pageNumber}`,
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="border rounded-lg p-4 bg-white shadow-sm"
        onMouseUp={handleTextSelection}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => {
            toast({
              title: "Erreur",
              description: "Impossible de charger le PDF",
              variant: "destructive",
            });
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            className="max-w-full"
            renderTextLayer={true}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => setPageNumber(page => Math.max(1, page - 1))}
          disabled={pageNumber <= 1}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="text-sm">
          Page {pageNumber} sur {numPages}
        </span>

        <Button
          onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
          disabled={pageNumber >= numPages}
          variant="outline"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;