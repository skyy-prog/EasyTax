import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ErrorBanner({ message }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="mb-4 border border-fog bg-white p-3">
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-quicksand italic text-ink">
          <X size={14} />
          {message}
        </p>
        <button
          type="button"
          className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
