
import { useState, useEffect } from "react";

export function useTypewriter(
  words: string[],
  speed: number = 80,
  delay: number = 2000
): string {
  const [index, setIndex] = useState<number>(0);
  const [subIndex, setSubIndex] = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Cuando termina de escribir una palabra → espera → empieza a borrar
      if (!deleting && subIndex === words[index].length) {
        setTimeout(() => setDeleting(true), delay);
        return;
      }

      // Cuando termina de borrar → pasa a la siguiente palabra
      if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
        return;
      }

      // Escribir o borrar
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, words, speed, delay]);

  return words[index].substring(0, subIndex);
}
