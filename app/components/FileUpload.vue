<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload Files</h2>
    </template>

    <UFormField class="mb-6" label="Select File(s)">
      <UInput
        v-model="fileInputValue"
        accept=".yaml,.yml"
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

    <div v-if="files.length > 0" class="mt-4">
      <p class="text-sm font-medium text-gray-700 mb-1">Selected Files:</p>
      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
        <li v-for="file in files" :key="file.name">
          {{ file.name }}
        </li>
      </ul>
    </div>

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

const { showToast } = useAppToast();
const { uploadFilesWithProgress, uploadProgress, isUploading } = useFileApi();

const files = ref<File[]>([]);
const fileInputValue = ref("");

const emit = defineEmits<{
  (
    e: "filesUploaded",
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

  const uploadedFiles = await uploadFilesWithProgress(files.value);

  if (uploadedFiles.length > 0) {
    emit("filesUploaded", uploadedFiles);
  }
  resetFileInput();
};

const resetFileInput = () => {
  files.value = [];
  fileInputValue.value = "";
};
</script>
