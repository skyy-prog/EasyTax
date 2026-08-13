import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const allowedTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const maxSize = 5 * 1024 * 1024;

function InlineConfirmButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <button
        type="button"
        className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
        onClick={onConfirm}
      >
        Confirm?
      </button>
    );
  }
  return (
    <button
      type="button"
      className="border-2 border-primary bg-white px-2 py-1 text-xs font-bold"
      onClick={() => setConfirming(true)}
    >
      Delete
    </button>
  );
}

export default function Documents() {
  const inputRef = useRef(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/documents");
      const list = Array.isArray(data) ? data : data?.documents || [];
      setDocs(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const validateFile = (file) => {
    if (!file) return "No file selected";
    if (!allowedTypes.includes(file.type)) {
      return "Unsupported file type. Use PDF, PNG, JPG, or WEBP.";
    }
    if (file.size > maxSize) {
      return "File too large. Max 5MB allowed.";
    }
    return "";
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <h2 className="border-b-2 border-primary pb-3 font-quicksand text-2xl font-bold">Documents</h2>

      <ErrorBanner message={error} />

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
      />

      <div
        className={`cursor-pointer border-2 border-dashed p-8 text-center shadow-brutal ${
          dragActive ? "border-accent bg-white" : "border-primary bg-base"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <p className="font-quicksand text-lg font-bold">Click to upload or drag & drop</p>
        <p className="data-mono mt-2 text-sm">
          PDF, PNG, JPG, WEBP up to 5MB {uploading ? " - Uploading..." : ""}
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : docs.length === 0 ? (
        <div className="border-2 border-primary bg-white p-4 shadow-brutal">
          <p className="data-mono text-sm">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <div key={doc._id} className="border-2 border-primary bg-white p-4 shadow-brutal">
              <div className="mb-2 flex items-center justify-between">
                <span className="border border-primary bg-accent px-2 py-0.5 text-xs font-bold">
                  {(doc.fileType || doc.mimetype || "FILE").toUpperCase()}
                </span>
                <span className="data-mono text-xs">
                  {new Date(doc.createdAt || doc.uploadedAt || Date.now()).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mb-4 break-all text-sm font-bold">{doc.fileName || doc.name || "Document"}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={doc.fileUrl || doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-primary bg-accent px-2 py-1 text-xs font-bold"
                >
                  Download
                </a>
                <InlineConfirmButton onConfirm={() => handleDelete(doc._id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
