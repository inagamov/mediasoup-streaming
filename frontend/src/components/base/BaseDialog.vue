<template>
  <dialog
    ref="dialogRef"
    class="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-8"
    @click="handleCloseOnEvent"
  >
    <slot />
  </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialogRef = ref<HTMLDialogElement | null>();

const openDialog = () => {
  dialogRef.value?.showModal();
};

const closeDialog = () => {
  dialogRef.value?.close();
};

defineExpose({ open: openDialog, close: closeDialog });

// handle click on dialog backdrop
const handleCloseOnEvent = (event: Event): void => {
  if (event.currentTarget === event.target) {
    closeDialog();
  }
};
</script>

<style scoped>
dialog::backdrop {
  backdrop-filter: blur(20px);
}

dialog {
  width: 500px;
  max-width: calc(100vw - 64px);
}
</style>
