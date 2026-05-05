import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import useUpload from "@/utils/useUpload";

export function AddPDFModal({ isOpen, onAdd, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [uploadMethod, setUploadMethod] = useState("url"); // 'url' or 'upload'
  const [upload, { loading: uploading }] = useUpload();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    try {
      const result = await upload({ file });
      if (result.error) {
        alert(result.error);
        return;
      }
      setPdfUrl(result.url);
      setPdfName(file.name);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload PDF");
    }
  };

  const handleAdd = () => {
    if (uploadMethod === "url" && !pdfUrl.trim()) return;
    if (uploadMethod === "upload" && !pdfUrl) return;

    onAdd(pdfUrl, pdfName || "Document.pdf");
    setPdfUrl("");
    setPdfName("");
    setUploadMethod("url");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#262626] rounded-xl p-6 sm:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-jetbrains-mono">
          Add PDF
        </h2>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setUploadMethod("url")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === "url"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            From URL
          </button>
          <button
            onClick={() => setUploadMethod("upload")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMethod === "upload"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            Upload File
          </button>
        </div>

        {uploadMethod === "url" ? (
          <>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-jetbrains-mono mb-3"
              autoFocus
            />
            <input
              type="text"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Document name (optional)"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-jetbrains-mono mb-6"
            />
          </>
        ) : (
          <div className="mb-6">
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors">
                {uploading ? (
                  <div className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    Uploading...
                  </div>
                ) : pdfUrl ? (
                  <div className="text-green-600 dark:text-green-400 font-jetbrains-mono">
                    <FileText className="mx-auto mb-2" size={32} />
                    {pdfName || "PDF uploaded"}
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    <Upload className="mx-auto mb-2" size={32} />
                    Click to upload PDF
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => {
              onClose();
              setPdfUrl("");
              setPdfName("");
              setUploadMethod("url");
            }}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!pdfUrl.trim() || uploading}
            className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add PDF
          </button>
        </div>
      </div>
    </div>
  );
}
