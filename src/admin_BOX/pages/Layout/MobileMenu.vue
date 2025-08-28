<template>
  <ul class="nav nav-mobile-menu">
    <li>
      <md-field>
        <label>Search</label>
        <md-input v-model="search" type="text"></md-input>
      </md-field>
    </li>

    <li>
      <router-link
        to="/dashboard"
        class="dropdown-toggle"
        :class="{ active: $route.path === '/dashboard' }"
      >
        <i class="material-icons">dashboard</i>
        <p>Dashboard</p>
      </router-link>
    </li>



    <li>
      <router-link
        to="/user"
        class="dropdown-toggle"
        :class="{ active: $route.path === '/user' }"
      >
        <i class="material-icons">person</i>
        <p>Profile</p>
      </router-link>
    </li>
  </ul>
</template>

<script setup>
import { ref } from "vue"

const search = ref(null)
const selectedEmployee = ref(null)

const employees = ref([
  "Jim Halpert",
  "Dwight Schrute",
  "Michael Scott",
  "Pam Beesly",
  "Angela Martin",
  "Kelly Kapoor",
  "Ryan Howard",
  "Kevin Malone",
])
</script>
