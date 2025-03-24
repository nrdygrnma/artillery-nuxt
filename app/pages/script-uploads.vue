<template>
  <div class="container mx-auto py-10">
    <h1 class="text-2xl font-semibold mb-6">Script Uploads</h1>

    <div class="flex gap-28">
      <div class="flex-1">
        <UTable
          :columns="columns"
          :data="uploadedFiles"
          :loading="status === 'pending'"
          class="flex-1"
        />
      </div>

      <div class="w-1/3">
        <FileUpload @filesUploaded="onFilesUploaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, resolveComponent } from "vue";
import { useAppToast } from "~/composables/useAppToast";
import FileUpload from "~/components/FileUpload.vue";
import type { TableColumn } from "@nuxt/ui";
import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";

const { showToast } = useAppToast();
const UButton = resolveComponent("UButton");
const UTooltip = resolveComponent("UTooltip");

const uploadedFiles = ref<FileItem[]>([]);

const columns: TableColumn<FileItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => row.getValue("id"),
  },
  {
    accessorKey: "name",
    header: "Script Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "uploadedDate",
    header: "Uploaded Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("uploadedDate");
      return dateValue instanceof Date
        ? dateValue.toLocaleString()
        : "Invalid Date";
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => renderActions(row),
  },
];

const {
  data: filesData,
  status,
  refresh,
} = await useFetch("/api/files", {
  key: "script-files",
  transform: (data: FileListResponse) => {
    return (
      data?.files?.map((file, index) => ({
        id: (index + 1).toString(),
        name: file.filename,
        uploadedDate: new Date(file.uploadedDate),
      })) || []
    );
  },
  lazy: true,
});

const onFilesUploaded = async () => {
  await refreshFiles();
};

const refreshFiles = async () => {
  await refresh();
  uploadedFiles.value = (filesData.value ?? []) as FileItem[];
};

const editScript = (fileItem: FileItem) => {
  console.log("Editing script:", fileItem);
};

const deleteScript = async (filename: string) => {
  if (!filename) {
    showToast("Error", "Filename is missing or invalid", "error");
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete the script ${filename}?`,
  );
  if (!confirmed) return;

  try {
    const encodedFilename = encodeURIComponent(filename);

    const { data } = await useFetch<FileOperationResponse>(
      `/api/files/${encodedFilename}`,
      {
        method: "DELETE",
      },
    );

    if (data.value?.success) {
      await refreshFiles();
      showToast("Success", `File deleted successfully: ${filename}`, "success");
    } else {
      showToast("Error", data.value?.message || "Delete failed", "error");
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Unexpected error:", errorMessage);
    showToast("Error", `Delete failed: ${errorMessage}`, "error");
  }
};

const renderActions = (row: any) =>
  h("div", { class: "flex space-x-2" }, [
    h(
      UTooltip,
      { arrow: true, content: "Edit Script" },
      {
        default: () =>
          h(UButton, {
            variant: "outline",
            color: "neutral",
            icon: "eva:edit-2-outline",
            size: "md",
            class: "cursor-pointer",
            onClick: () => editScript(row.original),
          }),
      },
    ),
    h(
      UTooltip,
      { arrow: true, content: "Delete Script" },
      {
        default: () =>
          h(UButton, {
            variant: "outline",
            color: "error",
            icon: "eva:trash-2-outline",
            size: "md",
            class: "cursor-pointer",
            onClick: () => row.original.name && deleteScript(row.original.name),
          }),
      },
    ),
  ]);

onMounted(async () => {
  await refreshFiles();
});
</script>
