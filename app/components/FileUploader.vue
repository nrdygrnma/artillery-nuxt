<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <h2 class="text-xl font-semibold">Upload a File</h2>
    </template>

    <UFormField class="mb-6" label="Select File">
      <UInput type="file" @change="handleFileChange" />
    </UFormField>

    <UButton icon="eva:upload-outline" @click="uploadFile"> Upload </UButton>

    <UProgress v-if="uploadProgress > 0" :value="uploadProgress" max="100" />
    <div v-if="isLoading">Loading...</div>
  </UCard>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface ApiResponse {
  success: boolean;
  message?: string;
  files?: string[];
  filename?: string;
  uploadedDate?: string;
}

const file = ref<File | null>(null);
const toast = useToast();
const isLoading = ref(false);
const uploadProgress = ref(0);

const emit = defineEmits<{
  (e: "fileUploaded", newFile: string, uploadedDate: string): void;
}>();

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  file.value = input.files?.[0] || null;
};

const uploadFile = async () => {
  if (!file.value) {
    showToast("Error", "Please select a file first!", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  isLoading.value = true;
  uploadProgress.value = 0;

  const { data, error } = await useFetch<ApiResponse>("/api/upload", {
    method: "POST",
    body: formData,
  });

  isLoading.value = false;
  uploadProgress.value = 0;

  if (error.value) {
    showToast("Error", "Error uploading file", "warning");
    return;
  }

  if (data.value?.success) {
    showToast("Success", "File uploaded successfully!", "success");
    if (data.value.filename && data.value.uploadedDate) {
      emit("fileUploaded", data.value.filename, data.value.uploadedDate);
    }
    file.value = null;
  } else {
    showToast("Error", data.value?.message || "Upload failed", "warning");
  }
};

const showToast = (
  title: string,
  description: string,
  color:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | undefined,
) => {
  toast.add({
    title,
    description,
    color,
  });
};
</script>
