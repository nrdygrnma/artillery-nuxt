<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload Files</h2>
    </template>

    <UFormField class="mb-6" label="Select File(s)">
      <UInput
        v-model="fileInputValue"
        aria-describedby="fileHelp"
        multiple
        type="file"
        @change="handleFileChange"
      />
      <p id="fileHelp" class="text-xs text-gray-500 mt-1">
        Only .yaml or .yml files are allowed.
      </p>
    </UFormField>

    <UButton
      :disabled="files.length === 0"
      :loading="isUploading"
      icon="eva:upload-outline"
      @click="handleUpload"
    >
      Upload
    </UButton>

    <div
      v-if="isUploading"
      class="mt-4 text-sm text-slate-600 font-light italic"
    >
      Uploading file(s)...
    </div>

    <UProgress
      v-if="isUploading && uploadProgress > 0"
      :value="uploadProgress"
      class="mt-2"
    />
  </UCard>
</template>

<script lang="ts" setup>
import { useFileApi } from "~/composables/useFileApi";
import { useAppToast } from "~/composables/useAppToast";

const { uploadFilesWithProgress, uploadProgress, isUploading } = useFileApi();
const { showToast } = useAppToast();

const allowedExtensions = [".yaml", ".yml"];
const files = ref<File[]>([]);
const fileInputValue = ref("");

const emit = defineEmits<{
  (
    e: "filesUploaded",
    newFiles: { filename: string; uploadedDate: string }[],
  ): void;
}>();

const validateFiles = (files: File[]) => {
  const validFiles: File[] = [];
  const invalidFiles: string[] = [];

  for (const file of files) {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file.name);
    }
  }
  return { validFiles, invalidFiles };
};

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    files.value = Array.from(input.files);
  }
};

const handleUpload = async () => {
  if (files.value.length === 0) {
    showToast("Error", "Please select files first!", "warning");
    return;
  }

  const { validFiles, invalidFiles } = validateFiles(files.value);

  if (validFiles.length === 0) {
    showToast("Error", "No valid YAML files to upload.", "warning");
    resetFileInput();
    return;
  }

  if (invalidFiles.length > 0) {
    showToast(
      "Warning",
      `Skipped non-YAML files: ${invalidFiles.join(", ")}`,
      "warning",
    );
  }

  const uploadedFiles = await uploadFilesWithProgress(validFiles);

  if (uploadedFiles.length > 0) {
    emit("filesUploaded", uploadedFiles);
    resetFileInput();
  }
};

const resetFileInput = () => {
  files.value = [];
  fileInputValue.value = "";
};
</script>
