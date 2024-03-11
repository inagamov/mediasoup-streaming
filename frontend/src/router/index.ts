import { createRouter, createWebHistory } from "vue-router";
import { ROUTES } from "@/constants/routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.INDEX.path,
      name: "index",
      component: () => import("@/views/IndexView.vue"),
    },
    {
      path: ROUTES.STREAM.path,
      name: "stream",
      component: () => import("@/views/StreamView.vue"),
    },
  ],
});

export default router;
