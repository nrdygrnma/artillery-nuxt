<template>
  <div>
    <div
      class="flex justify-between items-center pb-3 border-b border-(--ui-border-accented)"
    >
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
        @click="emit('bulkDelete', selectedFilenames)"
      >
        Delete Selected ({{ selectedRowCount }})
      </UButton>

      <ScriptTableFilter :filter-value="nameFilter" @update:filter="onFilter" />
    </div>

    <UTable
      ref="table"
      v-model:row-selection="localRowSelection"
      v-model:sorting="sorting"
      :columns="columns"
      :data="uploadedFiles"
      :loading="status === 'pending'"
      class="flex-1"
      loading-animation="carousel"
      loading-color="primary"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FileItem } from "~~/types";
import { computed, ref, resolveComponent } from "vue";
import ScriptTableFilter from "./ScriptTableFilter.vue";
import { useTableUtils } from "~/composables/useTableUtils";
import type { TableColumn } from "#ui/components/Table.vue";

const props = defineProps<{
  uploadedFiles: FileItem[];
  columns: TableColumn<FileItem>[];
  status: "pending" | "idle" | "error";
  rowSelection: Record<string, boolean>;
  sorting: any;
  filterName: string;
}>();

const emit = defineEmits<{
  (e: "edit", file: FileItem): void;
  (e: "delete", file: FileItem): void;
  (e: "bulkDelete", filenames: string[]): void;
  (e: "update:rowSelection", value: Record<string, boolean>): void;
}>();

const { useFileColumns } = useTableUtils();
const UButton = resolveComponent("UButton");
const UTooltip = resolveComponent("UTooltip");
const UCheckbox = resolveComponent("UCheckbox");

const nameFilter = ref("");
const table = useTemplateRef<any>("table");
const sorting = ref([{ id: "uploadedDate", desc: true }]);

const selectedRows = computed(
  () => table.value?.tableApi?.getFilteredSelectedRowModel().rows ?? [],
);
const selectedRowCount = computed(() => selectedRows.value.length);
const selectedFilenames = computed(() =>
  selectedRows.value.map((row: any) => row.original.name),
);

const localRowSelection = computed({
  get: () => props.rowSelection,
  set: (val) => emit("update:rowSelection", val),
});

const columns = useFileColumns({
  UCheckbox,
  UTooltip,
  UButton,
  editScript: (file: FileItem) => emit("edit", file),
  confirmDeleteModal: (fileItem: FileItem) => emit("delete", fileItem),
});

const onFilter = (val: string) => {
  nameFilter.value = val;
  table.value?.tableApi?.getColumn("name")?.setFilterValue(val);
};

watch(
  () => props.filterName,
  (value) => {
    table.value?.tableApi?.getColumn("name")?.setFilterValue(value);
  },
);
</script>
