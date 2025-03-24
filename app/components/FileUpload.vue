<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload a File</h2>
    </template>

    <UFormField class="mb-6" label="Select File">
      <UInput
        v-model="fileInputValue"
        aria-describedby="fileHelp"
        type="file"
        @change="handleFileChange"
      />
      <p id="fileHelp" class="text-xs text-gray-500 mt-1">
        Only .yaml or .yml files are allowed.
      </p>
    </UFormField>

    <UButton
      :disabled="!file"
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
      Uploading file...
    </div>

    <UProgress
      v-if="isUploading && uploadProgress > 0"
      :value="uploadProgress"
      class="mt-2"
    />
  </UCard>
</template>

<script lang="ts" setup>
const { uploadFileWithProgress, uploadProgress, isUploading } = useFileApi();
import { useAppToast } from "~/composables/useAppToast";

const { showToast } = useAppToast();

const allowedTypes = ["application/x-yaml", "text/yaml", "application/yaml"];
const file = ref<File | null>(null);
const fileInputValue = ref("");

const emit = defineEmits<{
  (e: "fileUploaded", newFile: string, uploadedDate: string): void;
}>();

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
};

const handleUpload = async () => {
  if (!file.value) {
    showToast("Error", "Please select a file first!", "warning");
    return;
  }

  if (!allowedTypes.includes(file.value.type)) {
    showToast("Error", "Only YAML files are allowed!", "warning");
    resetFileInput();
    return;
  }

  const result = await uploadFileWithProgress(file.value);

  if (result) {
    const { filename, uploadedDate } = result;
    emit("fileUploaded", filename, uploadedDate);
    resetFileInput();
  }
};

const resetFileInput = () => {
  file.value = null;
  fileInputValue.value = "";
};
</script>
