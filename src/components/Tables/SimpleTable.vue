<script setup>
import { defineProps,defineEmits, } from "vue";
import Pagination from "../Pagination.vue";


const props = defineProps({
  tableHeaderColor: {
    type: String,
    default: "",
  },
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
    default: 4
  },
  currentPage: {
    type: Number,
    required: true,
    default: 2
  },
  rows: {
    type: Array,
    default: () => [
      {
        staff_id: "1111",
        full_name: "None None",
        phone: null,
        staff_category: "JUNIOR STAFF",
      },
      {
        staff_id: "1293399",
        full_name: "Rachel Korang",
        phone: null,
        staff_category: null,
      },
      {
        staff_id: "892652",
        full_name: "Joyce Oppong",
        phone: null,
        staff_category: null,
      },
    ],
  },
});

const visibleEntries = (item) => {
  return Object.entries(item).filter(([key]) => key !== 'id')
}

const emit = defineEmits(["user-selected", "page-changed"]);

const selectUser = (userItem) => {


  emit("user-selected", userItem);
};
</script>

<template>
  <div>
    <md-table :value="rows" :table-header-color="tableHeaderColor">
      <template #md-table-row="{ item }">
        <md-table-row @click="selectUser(item.id)" style="cursor: pointer;">
    <md-table-cell
      v-for="[key, value] in visibleEntries(item)"
      :key="key"
      :md-label="key"
    >
      {{ value }}
    </md-table-cell>
  </md-table-row>

      </template>
    </md-table>
    <pagination :currentPage="currentPage" :totalPages="totalPages" @page-changed="(page) => emit('page-changed', page)"/>

    
  </div>
</template>
