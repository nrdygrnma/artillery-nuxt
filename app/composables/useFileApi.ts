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

  const uploadFilesWithProgress = (
    files: File[],
  ): Promise<{ filename: string; uploadedDate: string }[]> => {
    return new Promise(async (resolve) => {
      if (files.length === 0) return resolve([]);

      const uploadedResults: { filename: string; uploadedDate: string }[] = [];
      let filesProcessed = 0;
      isUploading.value = true;
      uploadProgress.value = 0;

      const uploadSingleFile = (file: File): Promise<void> => {
        return new Promise((fileResolve) => {
          const formData = new FormData();
          formData.append("file", file);

          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const fileProgress = Math.round(
                (event.loaded / event.total) * 100,
              );
              uploadProgress.value = Math.round(
                ((filesProcessed + fileProgress / 100) / files.length) * 100,
              );
            }
          };

          xhr.onload = () => {
            filesProcessed++;
            if (xhr.status === 200) {
              const response: FileOperationResponse = JSON.parse(
                xhr.responseText,
              );
              if (response.success) {
                uploadedResults.push({
                  filename: response.filename!,
                  uploadedDate: response.uploadedDate!,
                });
                showToast(
                  "Success",
                  `${response.filename} uploaded!`,
                  "success",
                );
              } else {
                showToast(
                  "Error",
                  response.message || "Upload failed",
                  "error",
                );
              }
            } else {
              showToast("Error", "Server error during upload", "error");
            }
            fileResolve();
          };

          xhr.onerror = () => {
            filesProcessed++;
            showToast("Error", "Network error during upload", "error");
            fileResolve();
          };

          xhr.send(formData);
        });
      };

      const uploadSequentially = async () => {
        for (const file of files) {
          await uploadSingleFile(file);
        }
      };

      await uploadSequentially();
      isUploading.value = false;
      uploadProgress.value = 100;
      await fetchFiles();
      resolve(uploadedResults);
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
    uploadFilesWithProgress,
    deleteFile,
    status,
    uploadProgress,
    isUploading,
  };
};

export type UseFileApiReturn = ReturnType<typeof useFileApi>;
