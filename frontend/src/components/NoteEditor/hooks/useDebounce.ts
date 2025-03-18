import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timerId, setTimerId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timerId]);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timerId) clearTimeout(timerId);
      
      const id = setTimeout(() => {
        func(...args);
      }, delay);
      
      setTimerId(id);
    },
    [func, delay, timerId]
  );

  return debouncedFunction;
}