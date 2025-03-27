<template>
  <div class="container mx-auto py-10">
    <h1 class="text-2xl font-semibold mb-2">Script Uploads</h1>

    <div class="flex gap-28">
      <div class="flex-1">
        <ScriptTable
          ref="table"
          v-model:sorting="sorting"
          :columns="columns"
          :filter-name="nameFilter"
          :row-selection="rowSelection"
          :status="normalizedStatus"
          :uploaded-files="uploadedFiles"
          @bulkDelete="bulkDelete"
          @delete="confirmDeleteModal"
          @edit="editScript"
          @update:rowSelection="rowSelection = $event"
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

const table = ref();
const overlay = useOverlay();
const nameFilter = ref("");
const rowSelection = ref({});
const uploadedFiles = ref<FileItem[]>([]);

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
      data.files.map((file) => ({
        id: file.filename,
        name: file.filename,
        uploadedDate: new Date(file.uploadedDate),
      })) || []
    );
  },
  lazy: true,
});

const normalizedStatus = computed(() => {
  return status.value === "success" ? "idle" : status.value;
});

const onFilesUploaded = async () => {
  await refreshFiles();
  resetSelection();
};

const refreshFiles = async () => {
  await refresh();
  uploadedFiles.value = (filesData.value ?? []) as FileItem[];
};

const editScript = (fileItem: FileItem) => {
  console.log("Editing script:", fileItem);
};

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

const confirmDeleteModal = async (fileItem: FileItem) => {
  const modal = overlay.create(DeleteModal, {
    props: {
      message: `Are you sure you want to delete the script: "${fileItem.name}"?`,
    },
  });
  const confirmed = await modal.open();

  if (confirmed) {
    await confirmDelete(fileItem.name);
  }
};

const bulkDelete = async (filenames: string[]) => {
  if (filenames.length === 0) return;

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
  resetSelection();
};

const resetSelection = () => {
  rowSelection.value = {};
};

const columns = useFileColumns({
  UCheckbox,
  UTooltip,
  UButton,
  editScript,
  confirmDeleteModal,
});

onMounted(async () => {
  await refreshFiles();
});
</script>
