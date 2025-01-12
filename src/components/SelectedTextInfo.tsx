import SelectedTextPreview from "./SelectedTextPreview";

interface TextInfo {
  text: string;
  position: { x: number; y: number };
}

interface SelectedTextInfoProps {
  selectedTextInfo: TextInfo | null;
  referenceTextInfo: TextInfo | null;
}

const SelectedTextInfo = ({ selectedTextInfo, referenceTextInfo }: SelectedTextInfoProps) => {
  return (
    <div className="space-y-4">
      {selectedTextInfo && (
        <div className="space-y-2">
          <h4 className="font-medium">Information cible sélectionnée :</h4>
          <SelectedTextPreview 
            text={selectedTextInfo.text} 
            position={selectedTextInfo.position} 
          />
        </div>
      )}

      {referenceTextInfo && (
        <div className="space-y-2">
          <h4 className="font-medium">Information de référence sélectionnée :</h4>
          <SelectedTextPreview 
            text={referenceTextInfo.text} 
            position={referenceTextInfo.position} 
          />
        </div>
      )}
    </div>
  );
};

export default SelectedTextInfo;