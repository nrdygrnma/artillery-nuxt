import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";
import { useAppToast } from "./useAppToast";

export const useFileApi = () => {
  const uploadedFiles = ref<FileItem[]>([]);
  const status = ref<"pending" | "idle" | "error">("idle");
  const uploadProgress = ref(0);
  const isUploading = ref(false);
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

  const uploadFileWithProgress = (
    file: File,
  ): Promise<{ filename: string; uploadedDate: string } | null> => {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      isUploading.value = true;
      uploadProgress.value = 0;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = async () => {
        isUploading.value = false;
        uploadProgress.value = 100;

        if (xhr.status === 200) {
          const response: FileOperationResponse = JSON.parse(xhr.responseText);
          if (response.success) {
            showToast("Success", "File uploaded!", "success");
            await fetchFiles(); // Optionally refresh list
            resolve({
              filename: response.filename!,
              uploadedDate: response.uploadedDate!,
            });
          } else {
            showToast("Error", response.message || "Upload failed", "error");
            resolve(null);
          }
        } else {
          showToast("Error", "Server error", "error");
          resolve(null);
        }
      };

      xhr.onerror = () => {
        isUploading.value = false;
        showToast("Error", "Network error", "error");
        resolve(null);
      };

      xhr.send(formData);
    });
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

  return {
    uploadedFiles,
    fetchFiles,
    uploadFileWithProgress,
    deleteFile,
    status,
    uploadProgress,
    isUploading,
  };
};

export type UseFileApiReturn = ReturnType<typeof useFileApi>;
