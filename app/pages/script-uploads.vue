<template>
  <div class="container mx-auto py-10">
    <h1 class="text-2xl font-semibold mb-2">Script Uploads</h1>

    <div class="flex gap-28">
      <div class="flex-1">
        <div class="mb-2 h-10 flex items-center">
          <UButton
            :class="[
              'transition-opacity duration-300',
              selectedRowCount > 0
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none',
            ]"
            class="cursor-pointer"
            color="error"
            icon="eva:trash-2-outline"
            @click="bulkDelete"
          >
            Delete Selected ({{ selectedRowCount }})
          </UButton>
        </div>
        <UTable
          ref="table"
          v-model:row-selection="rowSelection"
          v-model:sorting="sorting"
          :columns="columns"
          :data="uploadedFiles"
          :loading="status === 'pending'"
          class="flex-1"
        />
      </div>

      <div class="w-1/3 mt-12">
        <FileUpload @filesUploaded="onFilesUploaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, resolveComponent } from "vue";
import { useAppToast } from "~/composables/useAppToast";
import { useTableUtils } from "~/composables/useTableUtils";
import { DeleteModal, FileUpload } from "#components";
import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";

const { showToast } = useAppToast();
const { useFileColumns } = useTableUtils();

const UButton = resolveComponent("UButton");
const UTooltip = resolveComponent("UTooltip");
const UCheckbox = resolveComponent("UCheckbox");

const overlay = useOverlay();
const rowSelection = ref({});
const uploadedFiles = ref<FileItem[]>([]);
const table = useTemplateRef<any>("table");
const selectedRows = computed(
  () => table.value?.tableApi?.getFilteredSelectedRowModel().rows ?? [],
);
const selectedRowCount = computed(() => selectedRows.value.length);
const sorting = ref([
  {
    id: "uploadedDate",
    desc: true,
  },
]);

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

const confirmDeleteModal = async (filename: string) => {
  const modal = overlay.create(DeleteModal, {
    props: {
      message: `Are you sure you want to delete the script: "${filename}"?`,
    },
  });
  const confirmed = await modal.open();

  if (confirmed) {
    await confirmDelete(filename);
  }
};

const columns = useFileColumns({
  UCheckbox,
  UTooltip,
  UButton,
  editScript,
  confirmDeleteModal,
});

const confirmDelete = async (filename: string) => {
  try {
    const encodedFilename = encodeURIComponent(filename);
    const { data } = await useFetch<FileOperationResponse>(
      `/api/files/${encodedFilename}`,
      { method: "DELETE" },
    );

    if (data.value?.success) {
      await refreshFiles();
      rowSelection.value = {};
      showToast("Success", "File deleted successfully", "success");
    } else {
      showToast("Error", data.value?.message || "Delete failed", "error");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

const bulkDelete = async () => {
  if (selectedRowCount.value === 0) return;

  const filenames = selectedRows.value.map((row: any) => row.original.name);

  const modal = overlay.create(DeleteModal, {
    props: {
      message: `Are you sure you want to delete ${filenames.length} selected script(s)?`,
    },
  });
  const confirmed = await modal.open();

  if (!confirmed) return;

  for (const name of filenames) {
    await confirmDelete(name);
  }
  await refreshFiles();
  rowSelection.value = {};
};

onMounted(async () => {
  await refreshFiles();
});
</script>
