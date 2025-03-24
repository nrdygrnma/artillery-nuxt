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
    e: "fileUploaded",
    newFiles: { filename: string; uploadedDate: string }[],
  ): void;
}>();

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

  const invalidFile = files.value.find((file) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    return !allowedExtensions.includes(ext);
  });

  if (invalidFile) {
    showToast("Error", "Only YAML (.yaml, .yml) files are allowed!", "warning");
    resetFileInput();
    return;
  }

  const uploadedFiles = await uploadFilesWithProgress(files.value);

  if (uploadedFiles.length > 0) {
    emit("fileUploaded", uploadedFiles);
    resetFileInput();
  }
};

const resetFileInput = () => {
  files.value = [];
  fileInputValue.value = "";
};
</script>
