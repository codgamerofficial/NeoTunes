type ToastOptions = {
  title: string
  message?: string
  type?: 'success' | 'error' | 'info'
}

export type Toast = ToastOptions & { id: string }

let listeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

export const toast = (options: ToastOptions) => {
  const id = Math.random().toString(36).slice(2, 9)
  const newToast = { ...options, id }
  toasts = [...toasts, newToast]
  listeners.forEach((l) => l(toasts))
  
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((l) => l(toasts))
  }, 4000)
}

export const subscribeToasts = (listener: (toasts: Toast[]) => void) => {
  listeners.push(listener)
  listener(toasts)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
