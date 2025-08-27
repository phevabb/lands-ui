<script setup>
import { ref, toRefs } from "vue";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const selected = ref([]);

function onSelect(items) {
  selected.value = items;
}
</script>

<template>
  <div>
    <md-table v-model="selected" @md-selected="onSelect">
      <md-table-row
        v-for="user in users"
        :key="user.name"
        md-selectable="multiple"
        md-auto-select
        :item="user"
      >
        <md-table-cell>{{ user.name }}</md-table-cell>
        <md-table-cell>
          <md-button class="md-just-icon md-simple md-primary">
            <md-icon>edit</md-icon>
            <md-tooltip md-direction="top">Edit</md-tooltip>
          </md-button>
          <md-button class="md-just-icon md-simple md-danger">
            <md-icon>close</md-icon>
            <md-tooltip md-direction="top">Close</md-tooltip>
          </md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>
