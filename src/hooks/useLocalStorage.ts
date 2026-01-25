import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state from localStorage or fallback to initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const serializedValue = window.localStorage.getItem(key);
      return serializedValue ? JSON.parse(serializedValue) : initialValue;
    } catch (error) {
      console.error(
        `Failed to read from localStorage for key "${key}":`,
        error,
      );
      return initialValue;
    }
  });

  // Update both state and localStorage when value changes
  const updateValue = (newValue: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Failed to write to localStorage for key "${key}":`, error);
    }
  };

  return [value, updateValue] as const;
}

export default useLocalStorage;
