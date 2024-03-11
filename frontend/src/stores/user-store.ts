import { defineStore } from "pinia";
import { generateRandomName, generateRandomString } from "@/helpers/functions";

class User {
  id: string;
  name: string;

  constructor(id?: string, name?: string) {
    this.id = id || generateRandomString(64);
    this.name = name || generateRandomName();
  }
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: {},
  }),

  actions: {
    async auth() {
      return await new Promise((resolve) => {
        const savedUserData = localStorage.getItem("user");
        if (!savedUserData) {
          this.user = new User();
          localStorage.setItem("user", JSON.stringify(this.user));
        } else {
          this.user = JSON.parse(savedUserData);
        }

        return resolve(this.user);
      });
    },
  },
});
