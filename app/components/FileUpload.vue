<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload a File</h2>
    </template>

    <UFormField class="mb-6" label="Select File">
      <UInput type="file" @change="handleFileChange" />
    </UFormField>

    <UButton
      :loading="isLoading"
      icon="eva:upload-outline"
      @click="startUpload"
    >
      Upload
    </UButton>

    <div v-if="isLoading">Uploading...</div>
  </UCard>
</template>

<script lang="ts" setup>
import { useFileApi } from "~/composables/useFileApi";
import { useAppToast } from "~/composables/useAppToast";

const { uploadFile } = useFileApi();
const { showToast } = useAppToast();

const isLoading = ref(false);
const file = ref<File | null>(null);

const emit = defineEmits<{
  (e: "fileUploaded", newFile: string, uploadedDate: string): void;
}>();

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
};

const startUpload = async () => {
  if (!file.value) {
    showToast("Error", "Please select a file first!", "warning");
    return;
  }

  isLoading.value = true;
  const result = await uploadFile(file.value);
  isLoading.value = false;

  if (result) {
    emit("fileUploaded", result.filename, result.uploadedDate);
    file.value = null;
  }
};
</script>
