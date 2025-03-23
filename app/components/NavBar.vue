<template>
  <div class="flex items-center justify-between w-full">
    <a class="text-md font-bold text-slate-700" href="/">
      artillery Load Testing
    </a>

    <div class="flex">
      <UNavigationMenu
        :items="items"
        color="primary"
        highlight
        variant="pill"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const items = ref([
  [
    {
      label: "Home",
      icon: "eva:home-outline",
      to: "/",
    },
    {
      label: "Script Uploads",
      icon: "eva:upload-outline",
      to: "/script-uploads",
    },
    {
      label: "Run Load Tests",
      icon: "eva:arrow-circle-right-outline",
      to: "/load-tests",
    },
  ],
]);
</script>
