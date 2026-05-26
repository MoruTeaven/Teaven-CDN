import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Search from '@/pages/Search.vue'
import Packages from '@/pages/Packages.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/packages',
    name: 'Packages',
    component: Packages
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
