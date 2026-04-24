import { useEffect, useState } from 'react'

type SetValue<T> = T | ((previousValue: T) => T)

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue
    } catch (error) {
      console.warn(`[Storage] Failed reading localStorage key "${key}".`, error)
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`[Storage] Failed writing localStorage key "${key}".`, error)
    }
  }, [key, value])

  const updateValue = (nextValue: SetValue<T>) => {
    setValue((previousValue) =>
      typeof nextValue === 'function'
        ? (nextValue as (previousValue: T) => T)(previousValue)
        : nextValue,
    )
  }

  return [value, updateValue] as const
}