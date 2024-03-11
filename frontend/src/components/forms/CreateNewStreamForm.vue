<template>
  <form class="w-full mx-lg" @submit.prevent="handleCreateNewStream()">
    <div class="text-3xl font-bold text-black dark:text-white mb-8">New Stream</div>

    <div class="flex flex-col gap-4">
      <!-- code -->
      <div>
        <div class="mb-2 text-sm text-black dark:text-white font-semibold">
          <span class="opacity-50">*</span> Code
        </div>
        <BaseInput v-model="newStream.id" placeholder="XXXXXXXX" class="px-4 py-2 uppercase" />
      </div>

      <!-- title -->
      <div>
        <div class="mb-2 text-sm text-black dark:text-white font-semibold">
          <span class="opacity-50">*</span> Title
        </div>

        <BaseInput
          v-model="newStream.title"
          placeholder="Building a house in 24h"
          class="px-4 py-2"
        />
      </div>

      <!-- is private -->
      <div class="flex items-center gap-4 mt-4">
        <BaseToggleSwitch v-model="newStream.isPrivate" />

        <div class="text-black dark:text-white text-sm">
          Is private?
          <span class="opacity-50">Stream won't show up in «Streams List»</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 w-full mt-8">
      <BaseButton type="button" @click.prevent="$emit('close')"> Close </BaseButton>

      <BaseButton
        :disabled="!isValid"
        type="submit"
        class="text-white bg-blue-600 hover:bg-blue-700 hover:dark:bg-blue-700 border-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseToggleSwitch from "@/components/base/BaseToggleSwitch.vue";
import { computed, onBeforeMount, ref } from "vue";
import { generateRandomString } from "@/helpers/functions";
import { mediaServer } from "@/main";
import { useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";
import { useUserStore } from "@/stores/user-store";
import { storeToRefs } from "pinia";

/*
 * general
 */
const router = useRouter();
defineEmits(["close"]);

/*
 * stores
 */
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

/*
 * form
 */
const newStream = ref({
  id: "",
  title: "",
  isPrivate: false,
});
onBeforeMount(() => {
  newStream.value.id = generateRandomString(8);
});

const isValid = computed(() => {
  return newStream.value.id.length && newStream.value.title.length;
});

const handleCreateNewStream = async () => {
  mediaServer
    .post("/stream", { ...newStream.value, user: user.value })
    .then((response) => {
      router.push(
        ROUTES.STREAM.path.replace(":" + ROUTES.STREAM.params.stream_id, response.data.id),
      );
    })
    .catch((error) => {
      alert(error.response.data.error);
    });
};
</script>
