<template>
  <main>
    <Vue3Lottie
      :animation-data="globeAnimationJSON"
      :speed="0.5"
      class="rounded-[50%] invert-0 dark:invert fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-lg -z-10 h-[100svh]"
    />

    <div class="flex items-center justify-center h-[100svh] w-[100svw]">
      <div
        class="flex flex-col justify-center w-full h-[svh]"
        style="max-width: calc((100svh) * 9 / 16)"
      >
        <div class="aspect-[9/16] w-full h-[100%] flex flex-col gap-4 relative overflow-hidden">
          <!-- video -->
          <video
            id="stream"
            autoplay
            muted
            playsinline
            :loop="!!mockStream"
            class="object-cover w-full h-full opacity-80"
          >
            <template v-if="mockStream">
              <source src="@/assets/video/hamster.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </template>
          </video>

          <div class="absolute top-0 left-0 w-full h-full p-6 flex flex-col">
            <!-- header -->
            <div
              class="flex items-center justify-between px-4 py-2 rounded-lg backdrop-blur-2xl bg-black dark:bg-white bg-opacity-5 dark:bg-opacity-10"
            >
              <!-- title -->
              <div class="flex items-center gap-2">
                <div
                  class="text-xl font-semibold drop-shadow-neutral-600 drop-shadow-sm text-black dark:text-white opacity-50"
                >
                  {{ mockStream?.title || stream.title }}
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- viewers count -->
                <div class="flex items-center gap-1 opacity-50">
                  <div>
                    {{ mockStream?.viewersCount || stream.viewersCount }}
                  </div>
                  <div class="h-[20px]">
                    <i class="icon icon-eye text-xl h-full" />
                  </div>
                </div>

                <!-- toggle mute -->
                <div
                  v-if="isHost"
                  class="h-[20px] cursor-pointer active:scale-90 transition-all"
                  :class="{ 'opacity-50': stream.isMuted }"
                  @click="streamStore.toggleMute()"
                >
                  <i class="icon icon-mic" />
                </div>

                <div
                  v-else
                  class="h-[20px] cursor-pointer active:scale-90 transition-all"
                  :class="{ 'opacity-50': isViewerVolumeMuted }"
                  @click="streamStore.toggleMute()"
                >
                  <i class="icon icon-volume" />
                </div>

                <!-- end stream -->
                <div
                  v-if="isHost"
                  class="h-[20px] cursor-pointer active:scale-90 transition-all"
                  @click="handleEndStream()"
                >
                  <i class="icon icon-stop text-xl" />
                </div>

                <!-- close -->
                <div
                  class="h-[20px] cursor-pointer active:scale-90 transition-all"
                  @click="handleCloseStream()"
                >
                  <i class="icon icon-close text-xl" />
                </div>
              </div>
            </div>

            <div class="h-full"></div>

            <!-- messages -->
            <div class="flex flex-col gap-4">
              <div
                v-for="(message, messageIndex) in lastSixMessages"
                :key="messageIndex"
                :style="{
                  opacity:
                    (messageIndex < 3 && lastSixMessages.length >= 6) ||
                    (messageIndex < 2 && lastSixMessages.length >= 5) ||
                    (messageIndex < 1 && lastSixMessages.length >= 4)
                      ? messageIndex * 0.33 + 0.1
                      : 1,
                }"
              >
                <div v-if="message.type !== 'system'" class="text-sm font-semibold">
                  {{ message.user.name }}
                </div>

                <div class="opacity-50 text-sm" :class="{ italic: message.type === 'system' }">
                  {{ message.text }}
                </div>
              </div>
            </div>

            <!-- footer -->
            <div v-if="!isHost" class="flex items-center gap-6 mt-4">
              <!-- message input -->
              <form class="w-full relative" @submit.prevent="handleSendMessage()">
                <BaseInput
                  v-model="text"
                  placeholder="Write a message..."
                  class="py-3 px-3 w-full"
                />
                <button type="submit">
                  <i
                    class="icon icon-send h-[20px] cursor-pointer absolute top-1/2 -translate-y-1/2 right-4 text-black text-opacity-20 dark:text-white dark:text-opacity-20"
                  />
                </button>
              </form>

              <!-- reaction -->
              <div
                class="flex items-center cursor-pointer active:scale-50 transition-all"
                @click="streamStore.newReaction()"
              >
                <i class="icon icon-heart text-red-600 text-3xl h-[30px]" />
              </div>
            </div>
          </div>

          <!-- hearts -->
          <Vue3Lottie
            :animation-data="heartsAnimationJSON"
            ref="hearts"
            :width="200"
            :height="200"
            :loop="false"
            :auto-play="false"
            class="absolute -right-8"
            :class="isHost ? 'bottom-0' : 'bottom-16'"
            @on-loop-complete="isHeartsAnimationInProgress = false"
            @on-complete="isHeartsAnimationInProgress = false"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeMount, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";
import BaseInput from "@/components/base/BaseInput.vue";
import heartsAnimationJSON from "@/assets/lottie/hearts.json";
import { Vue3Lottie } from "vue3-lottie";
import globeAnimationJSON from "@/assets/lottie/globe.json";
import { MOCK_STREAMS } from "@/constants/mock";
import { storeToRefs } from "pinia";
import { useStreamStore } from "@/stores/stream-store.js";

/*
 * general
 */
const router = useRouter();

/*
 * stores
 */
const streamStore = useStreamStore();
const { stream, mockStream, text, isHost, isViewerVolumeMuted } = storeToRefs(streamStore);

onBeforeMount(async () => {
  // get stream id from route params
  const stream_id = router.currentRoute.value.params[ROUTES.STREAM.params.stream_id];

  // check if mock stream
  mockStream.value = Object.values(MOCK_STREAMS).find((item) => item.id === stream_id);
  if (mockStream.value) return;

  // fetch stream data
  // redirect back to index page on error
  await streamStore.fetchStream(stream_id).catch(() => {
    router.push(ROUTES.INDEX.path);
  });

  // connect to websockets & listen to events
  streamStore.connectSocketIo();
  streamStore.listenSocketIo();

  // start streaming / watching
  if (isHost.value) {
    await streamStore.startStreaming();
  } else if (stream.value.isLive) {
    await streamStore.startWatching();
  }
});

onUnmounted(() => {
  if (mockStream.value) return;
  streamStore.disconnectSocketIo();
});

const handleCloseStream = async () => {
  if (isHost.value) {
    streamStore.stopVideo();
  }
  streamStore.disconnectSocketIo();
  await router.push(ROUTES.INDEX);
};

const handleEndStream = async () => {
  const isConfirmed = confirm("Do you want to end the stream?");

  if (isConfirmed) {
    await streamStore.endStream();
    streamStore.stopVideo();
    await router.push(ROUTES.INDEX);
  }
};

/*
 * hearts
 */
const hearts = ref();
const isHeartsAnimationInProgress = ref(false);

watch(
  () => stream.value.reactionsCount,
  (newValue, oldValue) => {
    if (oldValue) {
      if (!isHeartsAnimationInProgress.value) {
        hearts.value.goToAndPlay(0);
        isHeartsAnimationInProgress.value = true;
      }
    }
  },
);

/*
 * new message
 */
const lastSixMessages = computed(() => {
  return stream.value?.messages?.slice(-6);
});

const handleSendMessage = async () => {
  if (!text.value.trim().length) return;

  await streamStore.sendMessage();
  text.value = "";
};
</script>

<style scoped>
video {
  transform: scaleX(-1);
  background: var(--vt-c-black);
}
</style>
