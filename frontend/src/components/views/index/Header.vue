<template>
  <header class="mx-auto w-full max-w-[700px] mt-8 mb-16">
    <div class="flex justify-center relative">
      <!-- logo -->
      <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -mt-2">
        <Vue3Lottie
          :animation-data="globeAnimationJSON"
          :height="80"
          :width="80"
          class="rounded-[50%] invert-0 dark:invert"
        />
      </div>

      <!-- search -->
      <form class="w-full relative" @submit.prevent="handleSearch">
        <BaseInput
          v-model="search"
          type="text"
          placeholder="Enter the Code to Join"
          class="text-center px-8"
          :error="isError"
          @input="isError = false"
        />

        <!-- submit button -->
        <i
          v-if="search"
          class="icon icon-link h-[20px] cursor-pointer absolute top-1/2 -translate-y-1/2 left-2 text-black text-opacity-20 dark:text-white dark:text-opacity-20"
          @click="handleSearch()"
        />

        <!-- clear search query-->
        <i
          v-if="search"
          class="icon icon-close h-[20px] cursor-pointer absolute top-1/2 -translate-y-1/2 right-2 text-black text-opacity-20 dark:text-white dark:text-opacity-20"
          @click="handleClearSearchQuery()"
        />
      </form>
    </div>
  </header>
</template>

<script setup lang="ts">
import globeAnimationJSON from "@/assets/lottie/globe.json";
import { Vue3Lottie } from "vue3-lottie";
import BaseInput from "@/components/base/BaseInput.vue";
import { ref } from "vue";
import { mediaServer } from "@/main";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "vue-router";

/*
 * genera;
 */
const router = useRouter();

/*
 * search
 */
const search = ref("");

const handleClearSearchQuery = () => {
  search.value = "";
};

const isError = ref<Boolean>(false);

const handleSearch = () => {
  mediaServer
    .get(`/stream/${search.value}`)
    .then((response) => {
      console.log(response.data);
      router.push(
        ROUTES.STREAM.path.replace(":" + ROUTES.STREAM.params.stream_id, response.data.id),
      );
    })
    .catch((error) => {
      isError.value = true;
      console.log(error.response.data.error);
    });
};
</script>
