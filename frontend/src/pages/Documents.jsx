import { FileText, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";
import Loader from "../components/Loader";

const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
const maxSize = 5 * 1024 * 1024;

export default function Documents() {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/documents");
      setDocuments(Array.isArray(data) ? data : data?.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const validateFile = (file) => {
    if (!file) return "No file selected";
    if (!allowedTypes.includes(file.type)) return "Only PDF, JPG and PNG are accepted";
    if (file.size > maxSize) return "File size must be under 5 MB";
    return "";
  };

  const uploadFile = async (file) => {
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    uploadFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete document");
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / DOCUMENTS</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Documents</h1>
        </div>
      </div>

      {loading && <Loader />}
      <ErrorBanner message={error} />

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mb-8 w-full rounded-sm border-2 border-dashed p-14 text-center transition-colors ${
          dragOver ? "border-ink bg-ghost/50" : "border-fog bg-white hover:border-silver"
        }`}
      >
        <Upload size={24} className="mx-auto mb-3 text-silver" />
        <p className="text-sm font-quicksand font-semibold text-ink">Drop files here</p>
        <p className="text-sm font-quicksand text-ash">or click to browse</p>
        <p className="mt-4 text-xs font-mono text-ash">PDF, JPG, PNG accepted {uploading ? "- Uploading..." : ""}</p>
      </button>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-fog bg-white py-20 text-center">
          <FileText size={32} className="mb-4 text-silver" />
          <p className="mb-1 text-sm font-quicksand font-semibold text-ink">No records found</p>
          <p className="text-xs font-quicksand text-ash">Upload documents to keep invoices and proofs organized</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => {
            const fileType = (doc.fileType || doc.mimetype || "file").split("/").pop();
            return (
              <article key={doc._id} className="border border-fog bg-white p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-ash">{fileType}</p>
                <p className="mt-2 truncate text-sm font-quicksand font-semibold text-ink">{doc.fileName || doc.name || "Document"}</p>
                <p className="mt-1 text-xs font-mono text-ash">
                  {new Date(doc.createdAt || doc.updatedAt || Date.now()).toLocaleDateString("en-IN")}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <a
                    href={doc.fileUrl || doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc._id)}
                    className="text-sm font-quicksand text-ash underline underline-offset-2 transition-colors hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
