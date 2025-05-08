import React from 'react';

export default function ImageModal({ src, alt, open, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="max-w-[75vw] max-h-[75vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <img
          src={src}
          alt={alt}
          className="object-contain max-w-[75vw] max-h-[75vh] rounded-xl shadow-2xl border-4 border-indigo-700 bg-[#23243a]"
        />
      </div>
    </div>
  );
}
