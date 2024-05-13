import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home.vue'),
    },
    {
      path: '/preview',
      name: 'home',
      component: () => import('@/views/Screen/index.vue'),
    },
    {
      path: '/',
      name: 'editor',
      component: () => import('@/views/Editor/index.vue'),
    },
  ],
})

export default router
