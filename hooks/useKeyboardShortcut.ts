import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  options: ShortcutOptions | ShortcutOptions[],
  handler: KeyHandler,
  deps: any[] = []
) {
  const shortcuts = Array.isArray(options) ? options : [options];

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Safety check: ignore if key is undefined
      if (!event.key) return;

      const matchesShortcut = shortcuts.some((shortcut) => {
        // Safety check for shortcut.key
        if (!shortcut.key) return false;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchesShortcut) {
        const shouldPreventDefault = shortcuts.some(s => s.preventDefault !== false);
        if (shouldPreventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [shortcuts, handler, ...deps]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}
