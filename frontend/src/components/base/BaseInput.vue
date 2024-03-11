<template>
  <input
    :value="modelValue"
    :class="[
      'w-full py-1',
      'backdrop-blur-2xl bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-10',
      'text-sm text-black dark:text-white',
      'placeholder-black dark:placeholder-white placeholder-opacity-50 dark:placeholder-opacity-50',
      'rounded-lg border border-black dark:border-white border-opacity-20 dark:border-opacity-20',
      'focus:border-100 focus:outline focus:outline-2',
      {
        'focus:border-blue-600 focus:outline-blue-600': !error,
        'focus:border-red-600 focus:outline-red-600': error,
      },
    ]"
    @input="$emit('update:modelValue', $event?.target?.value)"
  />
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: [String, Number], default: null },
  error: Boolean,
});
</script>
