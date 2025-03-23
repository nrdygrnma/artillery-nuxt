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
import { ref } from "vue";
import FileUploader from "~/components/FileUploader.vue";
import type { TableColumn } from "#ui/components/Table.vue";

type FileItem = {
  id: string;
  name: string;
  uploadedDate: Date;
};

interface ApiResponse {
  success: boolean;
  files: { name: string; uploadedDate: string }[];
}

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
];

const { data, status, refresh } = await useFetch("/api/files", {
  key: "script-files",
  transform: (data: ApiResponse) => {
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
  console.log(newFile, uploadedDate);
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

onMounted(async () => {
  await refreshFiles();
});
</script>
