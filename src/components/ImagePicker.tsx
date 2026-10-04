import React, { useRef } from "react";
import { useT } from "../i18n";
import { Button } from "./Button";

export interface ImagePickerProps {
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  imageError: string | null;
  setImageError: (err: string | null) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  imageFile,
  onImageChange,
  imageError,
  setImageError,
}) => {
  const { t } = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = (file: File) => {
    setImageError(null);
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return;
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const MAX_SIDE = 1280;
      let width = img.width;
      let height = img.height;

      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width > height) {
          height = Math.round((height * MAX_SIDE) / width);
          width = MAX_SIDE;
        } else {
          width = Math.round((width * MAX_SIDE) / height);
          height = MAX_SIDE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          if (blob.size > 1.2 * 1024 * 1024) {
            setImageError("Image size exceeds 1.2 MB limit even after resizing.");
            return;
          }
          const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
          });
          onImageChange(resizedFile);
        },
        "image/jpeg",
        0.8
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
          }
        }}
      />

      {!imageFile ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          style={{ minHeight: "44px", alignSelf: "flex-start" }}
        >
          {t("image.add")}
        </Button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px",
            backgroundColor: "var(--sunken)",
            borderRadius: "4px",
            border: "1px solid var(--line)",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{imageFile.name}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onImageChange(null);
              setImageError(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.875rem" }}
          >
            {t("image.remove")}
          </Button>
        </div>
      )}

      {imageFile && (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--amber-ink)" }}>
          {t("image.warn")}
        </p>
      )}

      {imageError && (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--red-ink)" }}>{imageError}</p>
      )}
    </div>
  );
};
