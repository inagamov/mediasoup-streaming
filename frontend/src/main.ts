import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import { useUserStore } from "@/stores/user-store";

/*
 * axios
 */
export const mediaServer = axios.create({
  baseURL: import.meta.env.VITE_MEDIA_SERVER_ENDPOINT,
  withCredentials: true,
});

/*
 * app
 */
const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount("#app");

/*
 * auth
 */
await useUserStore().auth();
