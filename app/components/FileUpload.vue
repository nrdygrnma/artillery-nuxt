<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload Files</h2>
    </template>

    <UFormField class="mb-6" label="Select File(s)">
      <UInput
        ref="fileInput"
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

    <div v-if="files.length > 0" class="flex flex-wrap gap-2 mt-4 mb-4">
      <h3 class="text-sm text-gray-500 w-full">Selected files:</h3>

      <FileTag
        v-for="(file, index) in files"
        :key="index"
        :name="file.name"
        @remove="removeFile(index)"
      />
    </div>

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
import type { UInput } from "#components";
import { useFileApi } from "~/composables/useFileApi";
import { useAppToast } from "~/composables/useAppToast";

const { showToast } = useAppToast();
const { uploadFilesWithProgress, uploadProgress, isUploading } = useFileApi();

const files = ref<File[]>([]);
const fileInputValue = ref("");
const fileInput = ref<InstanceType<typeof UInput> | null>(null);

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

const removeFile = (index: number) => {
  files.value.splice(index, 1);

  if (fileInput.value?.inputRef) {
    fileInput.value.inputRef.value = "";

    if (files.value.length > 0) {
      const dataTransfer = new DataTransfer();
      files.value.forEach((file) => dataTransfer.items.add(file));
      fileInput.value.inputRef.files = dataTransfer.files;
    }
  }
};

const resetFileInput = () => {
  files.value = [];
  fileInputValue.value = "";
};
</script>
