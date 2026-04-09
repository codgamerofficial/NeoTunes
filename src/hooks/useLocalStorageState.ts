import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue

    if (typeof window === 'undefined') {
      return fallback
    }

    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue ? (JSON.parse(storedValue) as T) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
