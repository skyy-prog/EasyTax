import { useState } from "react";

export default function ErrorBanner({ message }) {
  const [visible, setVisible] = useState(true);

  if (!message || !visible) return null;

  return (
    <div className="mb-4 border-2 border-primary bg-white p-3 shadow-brutal">
      <div className="flex items-start justify-between gap-4">
        <p className="data-mono text-sm">{message}</p>
        <button
          type="button"
          className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
          onClick={() => setVisible(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
