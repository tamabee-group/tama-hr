import { useEffect } from "react";

interface UseKeyDownOptions {
  onEnter?: () => void;
  disabled?: boolean;
}

export function useKeyDown({ onEnter, disabled = false }: UseKeyDownOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEnter, disabled]);
}
