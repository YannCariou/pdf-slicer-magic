import { useState } from 'react';

interface TextInfo {
  text: string;
  position: { x: number; y: number };
}

export const useTextSelection = () => {
  const [selectedTextInfo, setSelectedTextInfo] = useState<TextInfo | null>(null);
  const [referenceTextInfo, setReferenceTextInfo] = useState<TextInfo | null>(null);
  const [selectionMode, setSelectionMode] = useState<'target' | 'reference'>('target');

  const handleTextSelect = (text: string, position: { x: number; y: number }) => {
    console.log(`Text selected in ${selectionMode} mode:`, text);
    if (selectionMode === 'target') {
      setSelectedTextInfo({ text, position });
      setSelectionMode('reference');
      return { text, position };
    } else {
      setReferenceTextInfo({ text, position });
      setSelectionMode('target');
      return { text, position };
    }
  };

  return {
    selectedTextInfo,
    referenceTextInfo,
    selectionMode,
    handleTextSelect,
    setSelectionMode
  };
};