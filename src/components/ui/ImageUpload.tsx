"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function ImageUpload({ onUpload, currentUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    onUpload(urlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {currentUrl ? (
        <img src={currentUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-border" />
      ) : (
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-muted border border-border">
          👤
        </div>
      )}
      <label className="cursor-pointer text-xs text-primary hover:underline flex items-center gap-1">
        <Upload size={14} />
        {uploading ? "Uploading..." : "Change Photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}
