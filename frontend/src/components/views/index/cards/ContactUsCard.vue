<template>
  <div
    class="border border-neutral-200 dark:border-neutral-800 rounded-2xl relative overflow-hidden w-full"
  >
    <!-- background -->
    <img
      src="@/assets/images/banner.png"
      class="absolute w-full h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 invert dark:invert-0 object-cover"
      alt="Contact Us Banner"
    />

    <!-- contact us -->
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="flex flex-col justify-center items-center">
        <a href="https://nomadicsoft.io" target="_blank">
          <img
            src="@/assets/images/nomadi_soft_logo.png"
            alt="Nomadic Soft Logo"
            class="rounded-xl transition-all w-[60px] h-[60px] active:scale-90"
          />
        </a>

        <a href="https://nomadicsoft.io" target="_blank">
          <div class="text-xl font-semibold mt-2">Nomadic soft</div>
        </a>

        <div class="text-center hover:underline">
          <a href="mailto:hello@nomadicsoft.io" target="_blank" class="text-sm opacity-50">
            hello@nomadicsoft.io
          </a>
        </div>
      </div>

      <a href="https://nomadicsoft.io" target="_blank">
        <BaseButton
          class="bg-black dark:bg-white border-neutral-800 dark:border-neutral-200 hover:bg-opacity-80 backdrop-blur-2xl min-w-[200px] mt-4"
        >
          <span class="text-white dark:text-black">Contact Us</span>
        </BaseButton>
      </a>
    </div>

    <!-- team -->
    <div class="absolute left-16 top-1/2 -translate-y-1/2 flex-col gap-4 xl:flex hidden">
      <div class="flex gap-4 justify-center" v-for="(row, index) in team.left" :key="index">
        <img
          v-for="image in row"
          :src="image.src"
          :key="image.src"
          :alt="image.src"
          class="w-[60px] aspect-square rounded-xl hover:scale-90 hover:grayscale grayscale-0 transition-all object-cover shadow-neutral-200 shadow-2xl"
        />
      </div>
    </div>

    <div class="absolute right-16 top-1/2 -translate-y-1/2 flex-col gap-4 xl:flex hidden">
      <div class="flex gap-4 justify-center" v-for="(row, index) in team.right" :key="index">
        <img
          v-for="image in row"
          :src="image.src"
          :key="image.src"
          :alt="image.src"
          class="w-[60px] aspect-square rounded-xl hover:scale-90 hover:grayscale grayscale-0 transition-all object-cover shadow-neutral-200 shadow-2xl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import artyom_inagamov from "@/assets/images/team/artyom_inagamov.jpeg";
import gregory_shein from "@/assets/images/team/gregory_shein.webp";
import denis_asylbaev from "@/assets/images/team/denis_asylbaev.webp";
import ivar_leksa from "@/assets/images/team/ivar_leksa.webp";
import viktoriia_zhivagina from "@/assets/images/team/viktoriia_zhivagina.webp";
import alexander_romanenko from "@/assets/images/team/alexander_romanenko.webp";
import alexey_surovtsev from "@/assets/images/team/alexey_surovtsev.webp";

import alexandr_rulev from "@/assets/images/team/alexandr_rulev.webp";
import evgeniy_mozgovoy from "@/assets/images/team/evgeniy_mozgovoy.webp";
import ivan_tereshchencko from "@/assets/images/team/ivan_tereshchencko.webp";
import kirill_korolev from "@/assets/images/team/kirill_korolev.webp";
import nikita_dementev from "@/assets/images/team/nikita_dementev.webp";
import sergei_khlopov from "@/assets/images/team/sergei_khlopov.webp";
import vlad_litvinenko from "@/assets/images/team/vlad_litvinenko.webp";

const team = {
  left: [
    [{ src: artyom_inagamov }, { src: gregory_shein }],
    [{ src: denis_asylbaev }, { src: ivar_leksa }, { src: viktoriia_zhivagina }],
    [{ src: alexander_romanenko }, { src: alexey_surovtsev }],
  ],
  right: [
    [{ src: alexandr_rulev }, { src: evgeniy_mozgovoy }],
    [{ src: ivan_tereshchencko }, { src: kirill_korolev }, { src: nikita_dementev }],
    [{ src: sergei_khlopov }, { src: vlad_litvinenko }],
  ],
};
</script>
