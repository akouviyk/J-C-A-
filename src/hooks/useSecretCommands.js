import { useEffect, useState, useCallback } from 'react';

export const useSecretCommands = () => {
  const [sequence, setSequence] = useState([]);
  const [unlockedSections, setUnlockedSections] = useState(() => {
    // Initialize from localStorage
    return JSON.parse(localStorage.getItem('unlocked_sections') || '[]');
  });

  const secretCodes = {
    'VAULT': ['v', 'a', 'u', 'l', 't'],
    'ARCHIVE': ['1', '9', '6', '8'],
    'INNER_CIRCLE': ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
  };

  const checkSequence = useCallback((newSeq) => {
    Object.entries(secretCodes).forEach(([section, code]) => {
      const recentKeys = newSeq.slice(-code.length);
      if (JSON.stringify(recentKeys) === JSON.stringify(code)) {
        setUnlockedSections(prev => {
          if (!prev.includes(section)) {
            const updated = [...prev, section];
            localStorage.setItem('unlocked_sections', JSON.stringify(updated));
            document.dispatchEvent(new CustomEvent('sectionUnlocked', { detail: section }));
            return updated;
          }
          return prev;
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      setSequence(prev => {
        const newSeq = [...prev, e.key].slice(-10);
        checkSequence(newSeq);
        return newSeq;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [checkSequence]);

  return { unlockedSections };
};