import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/home.vue"),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/Editor/index.vue'),
    },
  ],
});

export default router;
