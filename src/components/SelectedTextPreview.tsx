import React from "react";

interface SelectedTextPreviewProps {
  text: string;
  position: { x: number; y: number };
}

const SelectedTextPreview = ({ text, position }: SelectedTextPreviewProps) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="font-medium mb-2">Texte sélectionné :</h4>
      <p className="text-sm text-gray-600">{text}</p>
      <p className="text-xs text-gray-500 mt-1">
        Position : x={position.x}, y={position.y}
      </p>
    </div>
  );
};

export default SelectedTextPreview;