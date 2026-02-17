import { useToastStore } from '@/stores/toastStore'

const TYPE_STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-indigo-600 text-white',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${TYPE_STYLES[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-slide-up`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white flex-shrink-0 text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
