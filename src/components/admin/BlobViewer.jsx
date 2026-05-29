import { useAuthBlob, downloadBlob } from "../../hooks/useAuthBlob";

/**
 * Drop-in replacement for <img> / <iframe> that loads blobs securely.
 * Token goes in the Authorization header — never in the URL.
 *
 * Props:
 *   blobId    — the blob ID from the activity
 *   fileType  — MIME type string e.g. "image/png", "application/pdf"
 *   filename  — used as the download filename
 *   className — optional CSS class for the img/iframe element
 */
export default function BlobViewer({ blobId, fileType, filename = "file", className }) {
  const { src, loading, error } = useAuthBlob(blobId);

  const isImage = fileType?.startsWith("image/");

  if (!blobId) {
    return <p className="detail-no-file">No file attached to this activity.</p>;
  }

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "0.88rem" }}>
        Loading file...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px", color: "#ef4444", fontSize: "0.88rem" }}>
        Failed to load file: {error}
      </div>
    );
  }

  return (
    <div>
      {isImage
        ? <img  src={src} alt={filename} className={className || "detail-file-img"} />
        : <iframe src={src} title={filename} className={className || "detail-file-iframe"} />
      }
      {/* Secure download — no token in URL */}
      <div style={{ marginTop: 10 }}>
        <button
          className="detail-download-btn"
          onClick={() => downloadBlob(blobId, filename).catch((e) => alert(e.message))}
        >
          ⬇ Download
        </button>
      </div>
    </div>
  );
}
