"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import {
  useUploadProductMutation,
  useUploadProductsMultipleMutation,
  useListImagesQuery,
  useDeleteImageMutation,
} from "@/store/features/upload/uploadApiService";

interface ImageUploadProProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// interface MediaItem {
//   id: number;
//   url: string;
// }

export default function ImageUploaderPro({
  value = "",
  onChange,
  multiple = false,
}: ImageUploadProProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [page, setPage] = useState(1);

  // Redux API hooks
  const [uploadSingle] = useUploadProductMutation();
  const [uploadMultiple] = useUploadProductsMultipleMutation();
  const { data: libraryData, refetch: refetchLibrary } = useListImagesQuery(
    { page, limit: 12 },
    { skip: !open }
  );
  const [deleteImageApi] = useDeleteImageMutation();

  const mediaLibrary = libraryData?.data || [];
  const totalPages = libraryData?.meta?.total ? Math.ceil(libraryData.meta.total / 12) : 1;

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value as string]
      : [];

  // ---------------- FETCH MEDIA LIBRARY ----------------
  useEffect(() => {
    if (open) {
      refetchLibrary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  // ---------------- HELPER ----------------
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  // ---------------- HANDLE FILE SELECTION AND UPLOAD ----------------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    try {
      let uploadedUrls: string[] = [];

      if (fileArray.length === 1 && !multiple) {
        // Single upload
        const formData = new FormData();
        formData.append("file", fileArray[0]);
        const res = await uploadSingle(formData).unwrap();
        if (res?.url) {
          uploadedUrls = [getFullUrl(res.url)];
        }
      } else {
        // Multiple upload
        const formData = new FormData();
        fileArray.forEach((file) => formData.append("files", file));
        const res = await uploadMultiple(formData).unwrap();
        if (res?.files) {
          uploadedUrls = res.files.map((f) => getFullUrl(f.url));
        }
      }

      if (uploadedUrls.length) {
        if (multiple) {
          onChange([...(Array.isArray(value) ? value : []), ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
          setOpen(false);
        }
        refetchLibrary();
        toast.success("Image(s) uploaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ---------------- SELECT / UNSELECT ----------------
  const toggleSelect = (url: string) => {
    if (multiple) {
      if (selectedValues.includes(url)) {
        onChange(selectedValues.filter((v) => v !== url));
      } else {
        onChange([...selectedValues, url]);
      }
    } else {
      onChange(url);
      setOpen(false);
    }
  };

  // ---------------- REMOVE ----------------
  const removeSelected = (url: string) => {
    if (multiple) {
      onChange(selectedValues.filter((v) => v !== url));
    } else {
      onChange("");
    }
  };

  // ---------------- DELETE ----------------
  const deleteImage = async (url: string) => {
    // Determine filename - logic might need adjustment for DO URLs if they don't end cleanly or contain query params
    const filename = url.split("/").pop()?.split("?")[0];
    if (!filename) return;
    if (!confirm("Delete this image permanently?")) return;

    try {
      await deleteImageApi(filename).unwrap();
      toast.success("Image deleted");
      refetchLibrary();

      if (multiple) {
        onChange(selectedValues.filter((v) => v !== url));
      } else if (value === url) {
        onChange("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      {/* Selected Images */}
      <div className="flex flex-wrap gap-3 mb-3">
        {selectedValues.map((fullUrl) => (
          <div key={fullUrl} className="relative w-28 h-28">
            <img
              src={fullUrl}
              className="w-full h-full object-cover rounded-xl border"
              onClick={() => !multiple && setOpen(true)}
            />
            <button
              onClick={() => removeSelected(fullUrl)}
              className="absolute -top-2 -right-2 bg-white p-1 rounded-full border shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add Button */}
        {(multiple || selectedValues.length === 0) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="w-28 h-28 border border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100">
                +
              </div>
            </DialogTrigger>
            <DialogTitle className="hidden sr-only">Select Images</DialogTitle>
            <DialogContent className="sm:max-w-[800px]">
              <h2 className="text-lg font-semibold mb-4">Select Images</h2>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab as (v: string) => void}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="library">Media Library</TabsTrigger>
                </TabsList>

                {/* UPLOAD */}
                <TabsContent value="upload">
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-40 border border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100"
                  >
                    Click to select {multiple ? "images" : "image"}
                    <input
                      type="file"
                      ref={inputRef}
                      multiple={multiple}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                </TabsContent>

                {/* MEDIA LIBRARY */}
                <TabsContent value="library">
                  <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                    {mediaLibrary.map((item) => {
                      const fullUrl = getFullUrl(item.url);
                      const isSelected = selectedValues.includes(fullUrl);
                      return (
                        <div
                          key={item.id || item.url}
                          className={`relative border rounded-xl overflow-hidden cursor-pointer ${isSelected ? "ring-2 ring-blue-500" : ""
                            }`}
                        >
                          <img
                            src={fullUrl}
                            className="w-full h-24 object-cover"
                            onClick={() => toggleSelect(fullUrl)}
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                              <Check size={12} />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImage(fullUrl);
                            }}
                            className="absolute bottom-1 right-1 bg-red-600 p-1 text-white rounded-full"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex justify-end">
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
