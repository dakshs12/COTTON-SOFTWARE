import { CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: { text: string; type: 'success' | 'error' } | string | null;
}

export const Toast = ({ message }: ToastProps) => {
  if (!message) return null;

  const isObject = typeof message === 'object';
  const text = isObject ? message.text : message;
  const type = isObject ? message.type : 'success';

  return (
    <div className="fixed bottom-10 right-10 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div 
        className="px-6 py-4 flex items-center gap-3 bg-white shadow-2xl" 
        style={{ 
          borderRadius: "12px", 
          boxShadow: "20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff",
          borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}` 
        }}
      >
        {type === 'success' ? (
          <CheckCircle size={20} className="text-green-500" />
        ) : (
          <AlertCircle size={20} className="text-red-500" />
        )}
        <span className="font-semibold text-gray-700">{text}</span>
      </div>
    </div>
  );
};
