<template>
  <n-layout has-sider position="absolute">
    <n-layout-sider
      content-style="padding: 24px;"
      :native-scrollbar="false"
    >
      <n-menu
        :options="menuOptions"
        :value="activeMenu"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>
    <n-layout content-style="padding: 24px;">
      <n-layout-header
        content-style="padding: 0 24px; height: 64px; display: flex; align-items: center;"
      >
        <h2 style="margin: 0;">CDN 管理系统</h2>
      </n-layout-header>
      <n-layout-content>
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const activeMenu = ref(route.name as string)

const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'Dashboard',
  },
  {
    label: '搜索资源',
    key: 'Search',
  },
  {
    label: '我的资源',
    key: 'Packages',
  }
]

function handleMenuUpdate(key: string) {
  router.push({ name: key })
}

watch(() => route.name, (name) => {
  activeMenu.value = name as string
})
</script>
