<template>
  <div
    class="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 relative overflow-hidden min-h-[538px]"
  >
    <!-- grid -->
    <div class="absolute -top-0 -right-0">
      <img src="@/assets/images/grid.png" alt="Grid" />
    </div>

    <!-- nomadic soft -->
    <div class="absolute top-0 -left-1">
      <a href="https://nomadicsoft.io" target="_blank">
        <div class="relative w-[200px] h-[200px] group cursor-pointer">
          <img
            src="@/assets/images/nomadic_soft_circular_text.png"
            alt="Nomadic Soft Circular Text"
            class="animate-spin-slow invert dark:invert-0 w-[200px] h-[200px]"
          />

          <img
            src="@/assets/images/nomadi_soft_logo.png"
            alt="Nomadic Soft Logo"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all w-[60px] h-[60px] group-active:w-[50px] group-active:h-[50px]"
          />
        </div>
      </a>
    </div>

    <div class="absolute bottom-0 left-0 p-8 w-full">
      <!-- article title -->
      <h1 class="text-3xl font-bold text-black dark:text-white mb-8">
        Building Streaming Service with Professional Media Server (WebRTC, mediasoup, SFU)
      </h1>

      <!-- article link -->
      <a
        href="https://github.com/inagamov/webrtc-streaming-sfu"
        target="_blank"
        class="backdrop-blur-2xl bg-neutral-200 dark:bg-neutral-900 rounded-lg p-4 flex items-center justify-between active:outline outline-2 outline-blue-600"
      >
        <div>
          <div class="text-sm font-semibold text-black dark:text-white">Read the Article</div>
          <div class="text-sm">Nomadic Soft</div>
        </div>
        <i class="icon icon-open_in_new text-xl h-[22px] text-black dark:text-white" />
      </a>
    </div>
  </div>
</template>
