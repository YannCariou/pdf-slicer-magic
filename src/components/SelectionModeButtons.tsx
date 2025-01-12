import { Button } from "./ui/button";

interface SelectionModeButtonsProps {
  selectionMode: 'target' | 'reference';
  onModeChange: (mode: 'target' | 'reference') => void;
}

const SelectionModeButtons = ({ selectionMode, onModeChange }: SelectionModeButtonsProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <Button 
        onClick={() => onModeChange('target')}
        variant={selectionMode === 'target' ? "default" : "outline"}
      >
        Sélectionner l'information cible
      </Button>
      <Button 
        onClick={() => onModeChange('reference')}
        variant={selectionMode === 'reference' ? "default" : "outline"}
      >
        Sélectionner l'information de référence
      </Button>
    </div>
  );
};

export default SelectionModeButtons;