<template>
  <main class="p-8">
    <!-- header -->
    <Header />

    <div class="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
      <!-- article -->
      <ArticleCard class="md:order-first" />

      <!-- streams -->
      <StreamsListCard class="md:order-first order-first" />

      <div class="flex flex-col gap-8">
        <!-- github repository -->
        <GitHubRepositoryCard />

        <!-- info -->
        <InfoCard />
      </div>

      <ContactUsCard class="xl:h-[300px] md:h-full h-[300px] xl:col-span-3 col-span-1" />
    </div>
  </main>
</template>

<script setup lang="ts">
import Header from "@/components/views/index/Header.vue";
import ArticleCard from "@/components/views/index/cards/ArticleCard.vue";
import InfoCard from "@/components/views/index/cards/InfoCard.vue";
import GitHubRepositoryCard from "@/components/views/index/cards/GitHubRepositoryCard.vue";
import StreamsListCard from "@/components/views/index/cards/StreamsListCard.vue";
import ContactUsCard from "@/components/views/index/cards/ContactUsCard.vue";
</script>
