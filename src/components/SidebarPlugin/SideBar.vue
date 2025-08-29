<template>
  <div
    class="sidebar"
    :data-color="sidebarItemColor"
    :data-image="sidebarBackgroundImage"
    :style="sidebarStyle"
  >
    <div class="logo">
      <a href="#" class="simple-text logo-mini">
        <div class="logo-img">
          <img :src="imgLogo" alt="" />
        </div>
      </a>

      <router-link
  to="/dashboard"
  class="simple-text logo-normal"
  style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.9);"
>
  Welcome, <strong style="color: #fff;">{{ fullName || title }}</strong>
</router-link>
    </div>

    <div class="sidebar-wrapper">
      <slot name="content"></slot>

    </div>


  </div>
</template>

<script setup>
import { computed, provide } from "vue"
import SidebarLink from "./SidebarLink.vue"
import { onMounted, ref } from "vue";
const fullName = ref(null);


onMounted(() => {
  fullName.value = localStorage.getItem("user");
  console.log("Retrieved user from localStorage:", fullName.value);
});

const props = defineProps({
  title: {
    type: String,
    default: "GH LANDS ",
  },
  sidebarBackgroundImage: {
    type: String,
    default: () => require("@/assets/img/sidebar-2.jpg"),
  },
  imgLogo: {
    type: String,
    default: () => require("@/assets/img/vue-logo.png"),
  },
  sidebarItemColor: {
    type: String,
    default: "green",
    validator: (value) => {
      let acceptedValues = ["", "purple", "blue", "green", "orange", "red"]
      return acceptedValues.includes(value)
    },
  },
  sidebarLinks: {
    type: Array,
    default: () => [],
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
})

provide("autoClose", props.autoClose)

// Sidebar background style
const sidebarStyle = computed(() => ({
  backgroundImage: `url(${props.sidebarBackgroundImage})`,
}))
</script>

<style scoped>
/* Ensure words move left */


.nav {
  text-align: left; /* text aligned left */
}

.nav .md-list-item,
.nav .sidebar-link {
  justify-content: flex-start !important; /* push items to left */
  text-align: left !important;
}

.nav .md-list-item p,
.nav .sidebar-link p {
  color: white;
  font-weight: bold;
  margin-left: 10px; /* space between icon and text */
}



</style>
