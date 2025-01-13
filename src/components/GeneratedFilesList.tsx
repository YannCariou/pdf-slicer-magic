import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useZipDownload } from "@/hooks/useZipDownload";

interface GeneratedFilesListProps {
  files: string[];
  month?: string;
  year?: string;
}

const GeneratedFilesList = ({ files, month, year }: GeneratedFilesListProps) => {
  const { downloadSingleFile, downloadAllFiles, isDownloading } = useZipDownload(month, year);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fichiers générés</h2>
        {files.length > 0 && (
          <Button
            onClick={() => downloadAllFiles(files)}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Téléchargement..." : "Tout télécharger"}
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span>{file}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => downloadSingleFile(file)}
              className="text-primary hover:text-primary-hover transition-colors"
              disabled={isDownloading}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedFilesList;