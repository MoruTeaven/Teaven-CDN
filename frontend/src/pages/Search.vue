<template>
  <div>
    <n-card :bordered="false">
      <n-space vertical>
        <n-input
        v-model:value="searchQuery"
        placeholder="输入 npm 包名，如：jquery、vue、axios"
        style="width: 500px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <n-icon><component :is="Search" /></n-icon>
        </template>
      </n-input>
      <n-button type="primary" @click="handleSearch" :loading="searching">搜索</n-button>
    </n-space>

    <div v-if="searchResult" style="margin-top: 24px;">
      <n-card title="搜索结果">
        <h4>{{ searchResult.name }}</h4>
        <n-space vertical style="margin-top: 16px;">
          <div>
          <n-select
            v-model:value="selectedVersion"
            :options="searchResult.versions.map(v => ({ label: v, value: v }))"
            placeholder="选择版本"
            style="width: 300px"
          />
          <n-button type="primary" style="margin-left: 12px;" @click="handleFavorite" :loading="favoriting">
            收藏到我的 CDN
          </n-button>
        </div>
      </n-space>
      </n-card>
    </div>

    <n-notification-provider />
    <n-message-provider />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { api } from '@/api'
import type { SearchResult } from '@/api'
import { Search as SearchIcon } from '@vicons/ionicons5'

const Search = h(SearchIcon)
const message = useMessage()
const notification = useNotification()

const searchQuery = ref('')
const searching = ref(false)
const favoriting = ref(false)
const searchResult = ref<SearchResult | null>(null)
const selectedVersion = ref('')

async function handleSearch() {
  if (!searchQuery.value) {
    message.warning('请输入搜索关键词')
    return
  }
  searching.value = true
  try {
    searchResult.value = await api.search(searchQuery.value)
    selectedVersion.value = searchResult.value.latest
  } catch (e) {
    message.error('搜索失败，请检查包名是否正确')
  } finally {
    searching.value = false
  }
}

async function handleFavorite() {
  if (!searchResult.value || !selectedVersion.value) {
    return
  }
  favoriting.value = true
  try {
    const result = await api.favorite(searchResult.value.name, selectedVersion.value)
    notification.success({
      title: '收藏成功',
      content: `已成功收藏 ${result.package.name}@${result.package.version}`,
      duration: 3000
    })
  } catch (e: any) {
    if (e.message.includes('409')) {
      notification.warning({
        title: '已收藏',
        content: '该资源已在您的 CDN 中',
        duration: 3000
      })
    } else {
      message.error('收藏失败')
    }
  } finally {
    favoriting.value = false
  }
}
</script>
