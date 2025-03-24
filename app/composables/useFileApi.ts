import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";
import { useAppToast } from "./useAppToast";

export const useFileApi = () => {
  const uploadedFiles = ref<FileItem[]>([]);
  const status = ref<"pending" | "idle" | "error">("idle");
  const { showToast } = useAppToast();

  const fetchFiles = async () => {
    status.value = "pending";
    try {
      const { data } = await useFetch("/api/files", {
        transform: (data: FileListResponse) =>
          data.files.map((file, index) => ({
            id: (index + 1).toString(),
            name: file.filename,
            uploadedDate: new Date(file.uploadedDate),
          })),
      });
      uploadedFiles.value = data.value ?? [];
      status.value = "idle";
    } catch (err) {
      console.error("Failed fetching files:", err);
      status.value = "error";
      showToast("Error", "Failed fetching files", "error");
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data, error } = await useFetch<FileOperationResponse>(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (error.value || !data.value?.success) {
      showToast("Error", data.value?.message || "Upload failed", "error");
      return null;
    }

    showToast("Success", "File uploaded successfully!", "success");
    await fetchFiles();
    return {
      filename: data.value.filename!,
      uploadedDate: data.value.uploadedDate!,
    };
  };

  const deleteFile = async (filename: string) => {
    const { data } = await useFetch<FileOperationResponse>(
      `/api/files/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      },
    );
    if (data.value?.success) {
      showToast("Deleted", `${filename} removed`, "success");
      await fetchFiles();
    } else {
      showToast("Error", data.value?.message || "Delete failed", "error");
    }
  };

  return { uploadedFiles, fetchFiles, uploadFile, deleteFile, status };
};

export type UseFileApiReturn = ReturnType<typeof useFileApi>;
