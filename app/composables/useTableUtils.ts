import { h } from "vue";
import type { Column } from "@tanstack/vue-table";

export const useTableUtils = () => {
  const useSortableHeader = (
    column: Column<any>,
    label: string,
    UButton: any,
  ) => {
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
      onClick: () => column.toggleSorting(isSorted === "asc"),
    });
  };

  const useFileColumns = ({
    UCheckbox,
    UTooltip,
    UButton,
    editScript,
    confirmDeleteModal,
  }: any) => [
    useSelectionColumn(UCheckbox),
    {
      accessorKey: "name",
      header: ({ column }: any) =>
        useSortableHeader(column, "Script Name", UButton),
      cell: ({ row }: any) => row.getValue("name"),
    },
    {
      accessorKey: "uploadedDate",
      header: ({ column }: any) =>
        useSortableHeader(column, "Uploaded Date", UButton),
      cell: ({ row }: any) => formatDateCell(row),
    },
    {
      header: "Actions",
      cell: ({ row }: any) =>
        h("div", { class: "flex space-x-2" }, [
          createActionButton(
            "Edit Script",
            "eva:edit-2-outline",
            "neutral",
            UTooltip,
            UButton,
            () => editScript(row.original),
          ),
          createActionButton(
            "Delete Script",
            "eva:trash-2-outline",
            "error",
            UTooltip,
            UButton,
            () => confirmDeleteModal(row.original),
          ),
        ]),
    },
  ];

  const formatDateCell = (row: any) => {
    const date = row.getValue("uploadedDate");
    return date ? new Date(date).toLocaleString() : "Invalid Date";
  };

  const createActionButton = (
    text: string,
    icon: string,
    color: string,
    UTooltip: any,
    UButton: any,
    onClick: () => void,
  ) =>
    h(
      UTooltip,
      { arrow: true, text, content: { side: "top", sideOffset: 5 } },
      {
        default: () =>
          h(UButton, {
            variant: "outline",
            color,
            icon,
            size: "md",
            class: "cursor-pointer",
            onClick,
          }),
      },
    );

  const useSelectionColumn = (UCheckbox: any) => ({
    id: "select",
    header: ({ table }: any) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }: any) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      }),
  });

  return {
    useSortableHeader,
    useSelectionColumn,
    useFileColumns,
  };
};
