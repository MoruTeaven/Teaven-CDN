<template>
  <div>
    <n-card :bordered="false">
      <n-space vertical>
        <n-button type="primary" @click="loadPackages" :loading="loading">刷新</n-button>
        <n-data-table
          :columns="columns"
          :data="packages"
          :loading="loading"
          :pagination="pagination"
        />
      </n-space>
    </n-card>
    <n-message-provider />
    <n-notification-provider />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, useNotification, NTag, NButton } from 'naive-ui'
import { Copy as CopyIcon, Trash as TrashIcon } from '@vicons/ionicons5'
import { api } from '@/api'
import type { PackageItem } from '@/api'

const message = useMessage()
const notification = useNotification()

const loading = ref(false)
const packages = ref<PackageItem[]>([])
const pagination = ref({ page: 1, pageSize: 10 })

const columns = [
  {
    title: '名称',
    key: 'name'
  },
  {
    title: '版本',
    key: 'version',
    render(row: PackageItem) {
      return h(NTag, { size: 'small', type: 'info' }, { default: () => row.version })
    }
  },
  {
    title: '文件名',
    key: 'file_name'
  },
  {
    title: '大小',
    key: 'file_size',
    render(row: PackageItem) {
      return row.file_size ? `${(row.file_size / 1024).toFixed(2)} KB` : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row: PackageItem) {
      return h('div', { style: { display: 'flex', gap: '8px' } }, [
        h(NButton, {
          size: 'small',
          onClick: () => copyToClipboard(row.cdn_url || ''),
          type: 'primary',
          ghost: true
        }, {
          default: () => h(CopyIcon, { style: { width: '14px', height: '14px' } })
        }),
        h(NButton, {
          size: 'small',
          onClick: () => handleDelete(row),
          type: 'error',
          ghost: true
        }, {
          default: () => h(TrashIcon, { style: { width: '14px', height: '14px' } })
        })
      ])
    }
  }
]

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

async function loadPackages() {
  loading.value = true
  try {
    const result = await api.getPackages()
    packages.value = result.packages
  } catch (e) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(pkg: PackageItem) {
  if (!confirm(`确定要删除 ${pkg.name}@${pkg.version} 吗？`)) {
    return
  }
  try {
    await api.deletePackage(pkg.id)
    notification.success({
      title: '删除成功',
      content: `已删除 ${pkg.name}@${pkg.version}`,
      duration: 3000
    })
    await loadPackages()
  } catch (e) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadPackages()
})
</script>
