<template>
  <ul class="nav nav-mobile-menu">
    

    


    
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
