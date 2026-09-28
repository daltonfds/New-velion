"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const BUCKET = "product-photos";
const MAX_IMAGES = 8;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface ProductImageUploaderProps {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export default function ProductImageUploader({
  value,
  onChange,
  disabled = false,
}: ProductImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviews(value);
  }, [value]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");

    const selected = Array.from(files);

    if (value.length + selected.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} product images.`);
      return;
    }

    for (const file of selected) {
      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPG, PNG and WebP images are allowed.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        return;
      }
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload product images.");
      }

      const uploaded: string[] = [];

      for (const file of selected) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() ||
          (file.type === "image/png" ? "png" : "jpg");

        const path = `admin/${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Product image upload error:", uploadError);
        }

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);

        uploaded.push(data.publicUrl);
      }

      const next = [...value, ...uploaded];

      setPreviews(next);
      onChange(next);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload product images.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const next = value.filter((_, imageIndex) => imageIndex !== index);
    setPreviews(next);
    onChange(next);
  }

  function moveImage(index: number, direction: "left" | "right") {
    const next = [...value];
    const target = direction === "left" ? index - 1 : index + 1;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    setPreviews(next);
    onChange(next);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Product Images
        </label>

        <span className="text-xs text-slate-500">
          {value.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <label
          className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-6 text-center transition ${
            disabled || uploading
              ? "cursor-not-allowed opacity-60"
              : "hover:border-indigo-400 hover:bg-indigo-50/30"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={disabled || uploading || value.length >= MAX_IMAGES}
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <span className="text-sm font-semibold text-slate-900">
            {uploading ? "Uploading images..." : "Upload product images"}
          </span>

          <span className="mt-1 text-xs text-slate-500">
            JPG, PNG or WebP · up to 5 MB each · maximum 8 images
          </span>
        </label>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white">
                    Main
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-900/75 p-2 opacity-100">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveImage(index, "left")}
                    className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    disabled={index === previews.length - 1}
                    onClick={() => moveImage(index, "right")}
                    className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-40"
                  >
                    →
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        The first image is used as the main product image.
      </p>
    </div>
  );
}
