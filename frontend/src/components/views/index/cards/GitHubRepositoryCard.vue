<template>
  <div
    class="border border-neutral-200 dark:border-neutral-800 rounded-2xl relative overflow-hidden aspect-square"
  >
    <Vue3Lottie :animation-data="spaceAnimationJSON" class="absolute" />

    <div class="absolute bottom-0 left-0 p-8 w-full">
      <a
        href="https://github.com/inagamov/webrtc-streaming-sfu"
        target="_blank"
        class="backdrop-blur-2xl bg-neutral-400 dark:bg-black bg-opacity-50 dark:bg-opacity-50 rounded-lg p-4 flex items-center justify-between active:outline outline-2 outline-blue-600"
      >
        <div>
          <div class="text-sm font-semibold text-black dark:text-white">GitHub Repository</div>
          <div class="text-sm">inagamov/webrtc-streaming-sfu</div>
        </div>
        <i class="icon icon-open_in_new text-xl h-[22px] text-black dark:text-white" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import spaceAnimationJSON from "@/assets/lottie/space.json";
import { Vue3Lottie } from "vue3-lottie";
</script>
