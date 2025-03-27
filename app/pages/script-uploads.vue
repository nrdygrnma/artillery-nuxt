<template>
  <div class="container mx-auto lg:py-10">
    <h1 class="text-2xl font-semibold mb-2">Script Uploads</h1>

    <div class="flex gap-20 flex-col lg:flex-row">
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

      <div v-if="!isMobileView" class="w-full lg:w-1/3 mt-12">
        <FileDropUpload @filesUploaded="onFilesUploaded" />
      </div>

      <div v-else class="fixed bottom-4 right-4 z-50">
        <UTooltip
          :content="{
            align: 'center',
            side: 'left',
            sideOffset: 8,
          }"
          arrow
          text="Upload scripts"
        >
          <UButton
            class="rounded-full shadow-lg"
            color="primary"
            icon="i-lucide-upload"
            size="lg"
            @click="isUploadOpen = true"
          />
        </UTooltip>
      </div>
    </div>

    <USlideover v-model:open="isUploadOpen">
      <template #content>
        <div class="mx-4 my-6">
          <FileDropUpload @filesUploaded="handleUploadedInMobile" />
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script lang="ts" setup>
import { ref, resolveComponent } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useAppToast } from "~/composables/useAppToast";
import { useTableUtils } from "~/composables/useTableUtils";
import { DeleteModal, FileEditorModal } from "#components";
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
const isUploadOpen = ref(false);
const uploadedFiles = ref<FileItem[]>([]);
const isMobileView = useMediaQuery("(max-width: 1024px)");

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

const editScript = async (fileItem: FileItem) => {
  const filename = encodeURIComponent(fileItem.name);

  const { data, error } = await useFetch<{ content: string }>(
    `/api/files/${filename}/content`,
    {
      method: "GET",
    },
  );

  if (error.value || !data.value?.content) {
    showToast("Error", `Could not load content for ${fileItem.name}`, "error");
    return;
  }

  const content = data.value.content;

  if (content) {
    await openEditorModal(fileItem.name, content);
  }
};

const openEditorModal = async (filename: string, content: string) => {
  const modal = overlay.create(FileEditorModal, {
    props: { filename, content },
  });

  const result = await modal.open();
  if (result?.confirm && result.content) {
    console.log(result.content);
    await saveEditedScript(filename, result.content);
  }
};

const saveEditedScript = async (filename: string, newContent: string) => {
  const { error } = await useFetch(
    `/api/files/${encodeURIComponent(filename)}/content`,
    {
      method: "PUT",
      body: { content: newContent },
    },
  );

  if (error.value) {
    showToast("Error", `Failed to save ${filename}`, "error");
  } else {
    showToast("Success", `${filename} updated successfully`, "success");
    await refreshFiles();
  }
};

const resetSelection = () => {
  rowSelection.value = {};
};

const handleUploadedInMobile = async () => {
  await refreshFiles();
  resetSelection();
  isUploadOpen.value = false;
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
