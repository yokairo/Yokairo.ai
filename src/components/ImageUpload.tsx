import React, { useState, useRef } from "react";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  folder: string;
  className?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete, folder, className, label }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file.");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5MB.");
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error("Upload Error:", error);
        toast.error("Upload failed. Please try again.");
        setUploading(false);
        setPreview(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadComplete(downloadURL);
        setUploading(false);
        toast.success("Image uploaded successfully!");
      }
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>}
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative h-48 w-full rounded-2xl border-2 border-dashed border-white/10 glass flex flex-col items-center justify-center cursor-pointer hover:border-neon-purple transition-all overflow-hidden",
          uploading && "cursor-not-allowed opacity-70"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 className="text-neon-purple animate-spin mb-2" size={32} />
                <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
              </div>
            )}
            {!uploading && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 text-white/40 group-hover:text-neon-purple transition-colors">
              <Upload size={24} />
            </div>
            <span className="text-sm font-medium text-white/40">Click to upload image</span>
            <span className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB)</span>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
    </div>
  );
};
