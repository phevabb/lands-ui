<script setup>
import { ref } from "vue";

const props = defineProps({
  tableHeaderColor: {
    type: String,
    default: "",
  },
});

const users = ref([
  { id: 1, name: "Dakota Rice", salary: "$36,738", country: "Niger", city: "Oud-Turnhout" },
  { id: 2, name: "Minerva Hooper", salary: "$23,738", country: "Curaçao", city: "Sinaai-Waas" },
  { id: 3, name: "Sage Rodriguez", salary: "$56,142", country: "Netherlands", city: "Overland Park" },
  { id: 4, name: "Philip Chaney", salary: "$38,735", country: "Korea, South", city: "Gloucester" },
]);

const selected = ref([]);
</script>

<template>
  <div>
    <md-table v-model="selected" :table-header-color="props.tableHeaderColor">
      <md-table-row
        v-for="user in users"
        :key="user.id"
        md-selectable="multiple"
      >
        <md-table-cell md-label="ID">{{ user.id }}</md-table-cell>
        <md-table-cell md-label="Name">{{ user.name }}</md-table-cell>
        <md-table-cell md-label="Salary">{{ user.salary }}</md-table-cell>
        <md-table-cell md-label="Country">{{ user.country }}</md-table-cell>
        <md-table-cell md-label="City">{{ user.city }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>
