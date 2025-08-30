<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


function exportExcel() {
  // 1. Convert data into worksheet
  const ws = XLSX.utils.json_to_sheet(props.users);

  // 2. Create a new workbook & append worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Departments");

  // 3. Save workbook as Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `${props.name_}.xlsx`);
}

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: false,
    default: 0,
  },
  name_:{
    type: String,
    required: true,
    default: "default"
  }
});

const selected = ref([]);

function onSelect(items) {
  selected.value = items;
}
</script>

<template>
  <div>
    <!-- Compact Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div style="font-size: 16px; font-weight: 500;">
        <span style="color: #34495e;">{{ name_ }}</span>
        <span style="color: #7f8c8d; margin-left: 8px;">({{ total }} items)</span>
      </div>
      <md-button class="md-dense md-primary" @click="exportExcel" 
                style="padding: 6px 12px; font-size: 13px; min-width: 120px;">
        <md-icon style="font-size: 16px; margin-right: 6px;">download</md-icon>
        Export
      </md-button>
    </div>

    <!-- Compact Table -->
    <md-table v-model="selected" @md-selected="onSelect" style="border: 1px solid #e0e0e0; border-radius: 4px;">
      <md-table-row>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">{{ name_ }}</md-table-head>
        <md-table-head style="padding: 12px; background: #fafafa; font-weight: 600;">Number of Staff</md-table-head>
      </md-table-row>

      <md-table-row
        v-for="user in users"
        :key="user.name"
        md-selectable="multiple"
        md-auto-select
        :item="user"
      >
        <md-table-cell style="padding: 12px; border-bottom: 1px solid #f0f0f0;">{{ user.name }}</md-table-cell>
        <md-table-cell style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: 500;">{{ user.count }}</md-table-cell>
      </md-table-row>

      <md-table-row v-if="users.length > 0" style="background: #f8f9fa;">
        <md-table-cell style="padding: 12px; font-weight: 600;">Pagination</md-table-cell>
        <md-table-cell style="padding: 12px; font-weight: 700; color: #2ecc71;">{{ totalCount }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>
