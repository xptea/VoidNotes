import { useState, useCallback } from 'react';

export const useDebounce = (func: Function, delay: number) => {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const debouncedFunction = useCallback((...args: any[]) => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => func(...args), delay));
  }, [func, delay, timer]);
  return debouncedFunction;
};