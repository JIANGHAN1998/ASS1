// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import WelcomeView     from '@/components/WelcomeView.vue'
import HomeView        from '@/components/HomeView.vue'
import MapView         from '@/components/MapView.vue'
import TrendsView      from '@/components/TrendsView.vue'
import LearnView       from '@/components/LearnView.vue'
import ContactView     from '@/components/ContactView.vue'
import RainWeatherView from '@/components/RainWeatherView.vue'   // ★ 正确导入页面组件

const routes = [
  // 默认首页：显示 Welcome
  { path: '/', name: 'welcome', component: WelcomeView },

  // 真实的 Home 页面
  { path: '/home', name: 'home', component: HomeView },

  { path: '/map', name: 'map', component: MapView },
  { path: '/trends', name: 'trends', component: TrendsView },
  { path: '/learn', name: 'learn', component: LearnView },
  { path: '/contact', name: 'contact', component: ContactView },

  // 新增 Rain & Weather 页面
  { path: '/rain-weather', name: 'rain-weather', component: RainWeatherView },

  // 兜底
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
