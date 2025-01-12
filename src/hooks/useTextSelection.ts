import { useState } from 'react';

interface TextInfo {
  text: string;
  position: { x: number; y: number };
}

export const useTextSelection = () => {
  const [selectedTextInfo, setSelectedTextInfo] = useState<TextInfo | null>(null);
  const [referenceTextInfo, setReferenceTextInfo] = useState<TextInfo | null>(null);
  const [selectionMode, setSelectionMode] = useState<'target' | 'reference'>('target');

  const handleTextSelect = (text: string, position: { x: number; y: number }): TextInfo => {
    const newTextInfo = { text, position };
    
    if (selectionMode === 'target') {
      console.log('Setting target text:', newTextInfo);
      setSelectedTextInfo(newTextInfo);
      setSelectionMode('reference');
    } else {
      console.log('Setting reference text:', newTextInfo);
      setReferenceTextInfo(newTextInfo);
      setSelectionMode('target');
    }
    
    return newTextInfo;
  };

  return {
    selectedTextInfo,
    referenceTextInfo,
    selectionMode,
    handleTextSelect,
    setSelectionMode
  };
};