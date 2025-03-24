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
import { h, ref, resolveComponent } from "vue";
import { useAppToast } from "~/composables/useAppToast";
import type { TableColumn } from "@nuxt/ui";
import { DeleteModal, FileUpload } from "#components";
import type {
  FileItem,
  FileListResponse,
  FileOperationResponse,
} from "~~/types";
import type { Column } from "@tanstack/vue-table";

const { showToast } = useAppToast();
const UButton = resolveComponent("UButton");
const UTooltip = resolveComponent("UTooltip");
const UCheckbox = resolveComponent("UCheckbox");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const overlay = useOverlay();
const uploadedFiles = ref<FileItem[]>([]);
const table = useTemplateRef<any>("table");
const rowSelection = ref({});
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

const columns: TableColumn<FileItem>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
  },
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => row.getValue("id"),
  },
  {
    accessorKey: "name",
    header: ({ column }) => getHeader(column, "Script Name"),
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "uploadedDate",
    header: ({ column }) => getHeader(column, "Uploaded Date"),
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

const renderActions = (row: any) =>
  h("div", { class: "flex space-x-2" }, [
    h(
      UTooltip,
      {
        arrow: true,
        text: "Edit Script",
        content: { side: "top", sideOffset: 5 },
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
        text: "Delete Script",
        content: { side: "top", sideOffset: 5 },
      },

      {
        default: () =>
          h(UButton, {
            variant: "outline",
            color: "error",
            icon: "eva:trash-2-outline",
            size: "md",
            class: "cursor-pointer",
            onClick: () =>
              row.original.name && confirmDeleteModal(row.original.name),
          }),
      },
    ),
  ]);

const getHeader = (column: Column<FileItem>, label: string) => {
  const isSorted = column.getIsSorted();

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(isSorted === "asc"), // Toggles direction
  });
};

onMounted(async () => {
  await refreshFiles();
});
</script>
