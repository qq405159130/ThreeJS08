// src/components/Uploader.tsx
import React, { useState } from "react";

const Uploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("API Response:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload">Upload File:</label>
      <input
        id="file-upload"
        type="file"
        title="Choose a file to upload"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Uploader;
