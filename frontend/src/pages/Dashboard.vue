<template>
  <div>
    <n-card :bordered="false">
      <h3>欢迎使用 CDN 管理系统</h3>
      <p>这是一个个人公共资源 CDN 收藏与管理系统。</p>
      <div style="margin-top: 24px;">
        <n-button type="primary" @click="$router.push('/search')">
          开始搜索资源
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
</script>
