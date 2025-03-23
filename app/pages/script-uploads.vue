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
        <FileUploader @fileUploaded="onFileUploaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, resolveComponent } from "vue";
import FileUploader from "~/components/FileUploader.vue";
import type { TableColumn } from "@nuxt/ui";
import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";

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
    cell: ({ row }) => {
      return h("div", { class: "flex space-x-2" }, [
        h(
          UTooltip,
          {
            arrow: true,
            content: {
              align: "center",
              side: "top",
              sideOffset: 5,
            },

            text: "Edit Script",
          },
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
          {
            arrow: true,
            content: {
              align: "center",
              side: "top",
              sideOffset: 5,
            },
            text: "Delete Script",
          },
          {
            default: () =>
              h(UButton, {
                variant: "outline",
                color: "error",
                icon: "eva:trash-2-outline",
                size: "md",
                class: "cursor-pointer",
                onClick: () => deleteScript(row.original.name),
              }),
          },
        ),
      ]);
    },
  },
];

const { data, status, refresh } = await useFetch("/api/files", {
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

const onFileUploaded = async (newFile: string, uploadedDate: string) => {
  const newFileItem: FileItem = {
    id: (uploadedFiles.value.length + 1).toString(),
    name: newFile,
    uploadedDate: new Date(uploadedDate),
  };
  uploadedFiles.value.push(newFileItem);
  await refreshFiles();
};

const refreshFiles = async () => {
  await refresh();
  uploadedFiles.value = (data.value ?? []) as FileItem[];
};

const editScript = (fileItem: FileItem) => {
  console.log("Editing script:", fileItem);
};

const deleteScript = async (filename: string | undefined) => {
  if (!filename) {
    console.error("Filename is missing or invalid");
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete the script ${filename}?`,
  );
  if (confirmed) {
    try {
      const encodedFilename = encodeURIComponent(filename);

      const { data, error } = await useFetch<FileOperationResponse>(
        `/api/files/${encodedFilename}`,
        {
          method: "DELETE",
        },
      );

      if (data.value && data.value.success) {
        console.log("File deleted successfully:", data.value);
        await refreshFiles();
      } else {
        console.error("Error deleting file:", error);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Unexpected error:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  }
};

onMounted(async () => {
  await refreshFiles();
});
</script>
