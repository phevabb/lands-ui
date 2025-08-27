<template>
  <div>
    <md-table :value="users" :table-header-color="tableHeaderColor">
      <template #md-table-row="{ item }">
        <md-table-row>
          <md-table-cell md-label="Name">{{ item.name }}</md-table-cell>
          <md-table-cell md-label="Country">{{ item.country }}</md-table-cell>
          <md-table-cell md-label="City">{{ item.city }}</md-table-cell>
          <md-table-cell md-label="Salary">{{ item.salary }}</md-table-cell>
        </md-table-row>
      </template>
    </md-table>
  </div>
</template>

<script>
export default {
  name: "SimpleTable",
  props: {
    tableHeaderColor: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      users: [
        {
          name: "Dakota Rice",
          salary: "$36,738",
          country: "Niger",
          city: "Oud-Turnhout",
        },
        {
          name: "Minerva Hooper",
          salary: "$23,738",
          country: "Curaçao",
          city: "Sinaai-Waas",
        },
        {
          name: "Sage Rodriguez",
          salary: "$56,142",
          country: "Netherlands",
          city: "Overland Park",
        },
        {
          name: "Philip Chaney",
          salary: "$38,735",
          country: "Korea, South",
          city: "Gloucester",
        },
        {
          name: "Doris Greene",
          salary: "$63,542",
          country: "Malawi",
          city: "Feldkirchen in Kārnten",
        },
        {
          name: "Mason Porter",
          salary: "$78,615",
          country: "Chile",
          city: "Gloucester",
        },
      ],
    }
  },
}
</script>
