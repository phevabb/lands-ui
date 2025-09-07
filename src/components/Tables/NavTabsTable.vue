<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import Pagination from '../Pagination.vue'
import { useRouter } from "vue-router/composables"

const router = useRouter()

const props = defineProps({
  next: { type: String, default: null },
  previous: { type: String, default: null },
  totalPages: { type: Number, default: 1 },
  currentPage: { type: Number, default: 1 },
  users: { type: Array, default: () => [] },
  total: { type: [Number, String], default: 0 },
  name_: { type: String, default: 'Data' },
  pageSize: { type: Number, default: 10 } // page size from API
})

const selected = ref([])
const tableVisible = ref(true)
const emit = defineEmits(["page-changed"])

function onSelect(items) {
  if (items && items.length > 0) {
    const deptName = items[0].name
    router.push({ name: "Users Per Department", query: { dept: deptName } })
  }
}

function handleRowClick(user) {
  selected.value = [user]
  onSelect([user])
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(props.users)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Departments')
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(data, `${props.name_}.xlsx`)
}

function toggleTable() {
  tableVisible.value = !tableVisible.value
}

// Compute "showing X–Y of Z"
const showingRange = computed(() => {
  if (props.total === 0) return `Showing 0 of 0`
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `Showing ${start}–${end} of ${props.total}`
})
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div style="font-size: 16px; font-weight: 500;">
        <span style="color: #34495e;">{{ name_ }}</span>
        <span style="color: #7f8c8d; margin-left: 8px;">({{ total }} items)</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <md-button class="md-dense md-primary" @click="exportExcel">
          <md-icon style="font-size: 16px; margin-right: 6px;">download</md-icon>
          Export
        </md-button>
        <md-button class="md-dense md-accent" @click="toggleTable">
          <md-icon style="font-size: 16px;">{{ tableVisible ? 'expand_less' : 'expand_more' }}</md-icon>
        </md-button>
      </div>
    </div>

    <!-- Table -->
    <md-table
      v-if="tableVisible"
      v-model="selected"
      @md-selected="onSelect"
      style="border: 1px solid #e0e0e0; border-radius: 4px;"
    >
      <md-table-row>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">
          {{ name_ }}
        </md-table-head>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">
          Number of Staff
        </md-table-head>
      </md-table-row>

      <md-table-row
        v-for="user in props.users"
        :key="user.name"
        md-selectable="multiple"
        :md-item="user"
        @click="handleRowClick(user)"
        style="cursor: pointer;"
      >
        <md-table-cell>{{ user.name }}</md-table-cell>
        <md-table-cell style="font-weight: 500;">{{ user.count }}</md-table-cell>
      </md-table-row>
    </md-table>

    <!-- Pagination + Range -->
    <div
      v-if="tableVisible"
      style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;"
    >
      <pagination
        :current-page="props.currentPage"
        :total-pages="props.totalPages"
        @page-changed="page => emit('page-changed', page, props.name_)"
      />
      <div style="font-size: 14px; color: #7f8c8d;">
        {{ showingRange }}
      </div>
    </div>
  </div>
</template>
