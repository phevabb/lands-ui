<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


import { useRouter } from "vue-router/composables";

const router = useRouter();





const props = defineProps({

  next: {
    type: String,
    default: "iik",
  },
  previous: {
    type: String,
    default: "fatts",
  },
  totalPages: {
    type: Number,
    required: true,
    default: 4,
  },
  currentPage: {
    type: Number,
    required: true,
    default: 2,
  },

  
  // same as rows
  users: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: false,
    default: 0,
  },
  name_: {
    type: String,
    required: true,
    default: 'default',
  },
});

const selected = ref([]);
const ans = ref([]);
const tableVisible = ref(true);

function onSelect(items) {
  if (items && items.length > 0) {
    const deptName = items[0].name;
    router.push({
      name: "Users Per Department",
      query: { dept: deptName }
    });
  }
}


function handleRowClick(user) {

  // Manually handle selection since the built-in selection might be interfering
  selected.value = [user];
  onSelect([user]);
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(props.users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Departments');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, `${props.name_}.xlsx`);
}

function toggleTable() {
  tableVisible.value = !tableVisible.value;
}
</script>

<template>
  <div>
    <!-- Header with Export & Toggle -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div style="font-size: 16px; font-weight: 500;">
        <span style="color: #34495e;">{{ name_ }}</span>
        <span style="color: #7f8c8d; margin-left: 8px;">({{ total }} items)</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <md-button class="md-dense md-primary" @click="exportExcel" style="padding: 6px 12px; font-size: 13px; min-width: 120px;">
          <md-icon style="font-size: 16px; margin-right: 6px;">download</md-icon>
          Export
        </md-button>
        <md-button class="md-dense md-accent" @click="toggleTable" style="padding: 6px 12px; font-size: 13px; min-width: 40px;">
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
      <!-- Table Header -->
      <md-table-row>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">
          {{ name_ }}
        </md-table-head>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">
          Number of Staff
        </md-table-head>
      </md-table-row>

      <!-- Data Rows -->
      <md-table-row
        v-for="user in props.users"
        :key="user.name"
        md-selectable="multiple"
        :md-item="user"
        @click="handleRowClick(user)"
        style="cursor: pointer;"
      >
        <md-table-cell style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
          {{ user.name }}
        </md-table-cell>
        <md-table-cell style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: 500;">
          {{ user.count }}
        </md-table-cell>
      </md-table-row>

      <!-- Footer Row (Pagination placeholder) -->
      <md-table-row v-if="props.users.length > 0" style="background: #f8f9fa;">
        <md-table-cell style="padding: 12px; font-weight: 600;">
          Pagination
        </md-table-cell>
        <md-table-cell style="padding: 12px; font-weight: 700; color: #2ecc71;"></md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>