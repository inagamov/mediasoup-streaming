<template>
  <div
    class="border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden max-h-[538px]"
  >
    <!-- streams list -->
    <div class="flex items-center justify-between px-8 pt-8 pb-4">
      <div class="text-3xl text-black dark:text-white font-bold">Streams List</div>

      <!--      <i-->
      <!--        class="icon icon-refresh text-xl cursor-pointer active:scale-90 transition-all h-[24px] opacity-50"-->
      <!--        @click="fetchStreams()"-->
      <!--      />-->
    </div>

    <div class="h-full overflow-y-scroll scrollbar-hide relative">
      <div class="flex flex-col gap-4 pb-8 h-full overflow-y-scroll scrollbar-hide px-8 py-4">
        <!-- mock stream -->
        <router-link
          :to="
            ROUTES.STREAM.path.replace(
              ':' + ROUTES.STREAM.params.stream_id,
              MOCK_STREAMS.HAMSTER.id,
            )
          "
        >
          <div class="overflow-hidden rounded-lg active:outline outline-blue-600 outline-2">
            <video
              autoplay
              muted
              playsinline
              class="object-cover w-full h-[150px] bg-white dark:bg-black"
            >
              <source src="@/assets/video/hamster.mp4" />
            </video>

            <div class="flex items-center justify-between p-4 relative overflow-hidden">
              <img
                src="@/assets/images/hamster.png"
                alt="Mr. Hamster"
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-fit h-fit blur-2xl opacity-40"
              />

              <div class="flex items-center gap-2">
                <l-ripples size="30" speed="3" color="black" class="invert-0 dark:invert" />

                <div class="text-nowrap text-black dark:text-white text-sm">
                  {{ MOCK_STREAMS.HAMSTER.title }}
                </div>
              </div>

              <div class="flex items-center gap-1">
                <div class="text-xs">{{ MOCK_STREAMS.HAMSTER.viewersCount }}</div>
                <i class="icon icon-eye text-sm h-[14px]" />
              </div>
            </div>
          </div>
        </router-link>

        <!-- streams -->
        <div v-for="stream in streams" :key="stream.id">
          <router-link
            :to="ROUTES.STREAM.path.replace(':' + ROUTES.STREAM.params.stream_id, stream.id)"
          >
            <div
              class="overflow-hidden bg-neutral-200 dark:bg-neutral-900 rounded-lg active:outline outline-blue-600 outline-2"
            >
              <div class="flex items-center justify-between p-4 relative overflow-hidden">
                <div class="flex items-center gap-2">
                  <l-ripples
                    v-if="stream.isLive"
                    size="30"
                    speed="3"
                    color="black"
                    class="invert-0 dark:invert"
                  />

                  <l-pinwheel
                    v-else
                    size="22"
                    stroke="3"
                    speed="2"
                    color="black"
                    class="mx-1 invert-0 dark:invert"
                  ></l-pinwheel>

                  <div class="text-nowrap text-black dark:text-white text-sm">
                    {{ stream.title }}
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <div class="text-xs">{{ stream.viewersCount }}</div>
                  <i class="icon icon-eye text-sm h-[14px]" />
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- overlay -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none overlay"></div>
    </div>

    <!-- create new stream -->
    <div class="px-8 pb-8 pt-4">
      <Button
        @click="openCreateNewStreamDialog()"
        class="bg-white dark:bg-black hover:bg-neutral-100 hover:dark:bg-neutral-900 w-full"
      >
        <i class="icon icon-add h-[16px]" />
        <span>Create new Stream</span>
      </Button>
    </div>

    <!-- create new stream dialog -->
    <BaseDialog ref="createNewStreamDialog">
      <CreateNewStreamForm @close="closeCreateNewStreamDialog()" />
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/base/BaseButton.vue";
import CreateNewStreamForm from "@/components/forms/CreateNewStreamForm.vue";
import BaseDialog from "@/components/base/BaseDialog.vue";
import { onBeforeMount, ref } from "vue";
import { mediaServer } from "@/main";
import { ROUTES } from "@/constants/routes";
import { MOCK_STREAMS } from "@/constants/mock";
import { ripples, pinwheel } from "ldrs";

/*
 * ldrs
 */
ripples.register("l-ripples");
pinwheel.register("l-pinwheel");

/*
 * streams
 */
const streams = ref<Array<Object>>([]);

const fetchStreams = () => {
  mediaServer
    .get("/streams")
    .then((response) => {
      streams.value = response.data;
    })
    .catch((error) => {
      console.log(error.response.data.message);
    });
};

onBeforeMount(() => {
  fetchStreams();
});

/*
 * create new stream
 */
const createNewStreamDialog = ref<InstanceType<typeof BaseDialog> | null>();
const openCreateNewStreamDialog = () => {
  createNewStreamDialog.value?.open();
};
const closeCreateNewStreamDialog = () => {
  createNewStreamDialog.value?.close();
};
</script>

<style>
/*
 * overlay
 */
.overlay {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.5) 75%,
    rgba(255, 255, 255, 1) 100%
  );
}

@media (prefers-color-scheme: dark) {
  .overlay {
    background: linear-gradient(
      to bottom,
      rgba(2, 2, 2, 0) 0%,
      rgba(2, 2, 2, 0) 50%,
      rgba(2, 2, 2, 0.5) 75%,
      rgba(2, 2, 2, 1) 100%
    );
  }
}
</style>
