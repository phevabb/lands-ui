<template>
  <li class="md-list-item">
    <router-link
      :to="link.path"
      class="md-list-item-router md-list-item-container md-button-clean"
      @click="() => { hideSidebar(); setActiveLink(link.name) }"
      :class="{ active: $route.path === link.path }"
      v-bind="$attrs"
    >
      <div class="md-list-item-content md-ripple">
        <slot>
          <md-icon>{{ link.icon }}</md-icon>
          <p>{{ link.name }}</p>
        </slot>
      </div>
    </router-link>
  </li>
</template>

<script setup>
import { inject, ref } from "vue"

const activeLink = ref(null)

const setActiveLink = (linkName) => {
  activeLink.value = linkName
}

const props = defineProps({
  link: {
    type: [String, Object],
    default: () => ({
      name: "",
      path: "",
      icon: "",
    }),
  },
  tag: {
    type: String,
    default: "router-link",
  },
})

const autoClose = inject("autoClose", true)

const hideSidebar = () => {
  if (
    autoClose &&
    typeof window !== "undefined" &&
    window.$sidebar &&
    window.$sidebar.showSidebar === true
  ) {
    window.$sidebar.displaySidebar(false)
  }
}
</script>

<style scoped>
/* This single rule now applies the highlight for both hover and active states */
.md-list-item-router.active,
.md-list-item-router:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 6px;
  transition: background 0.2s;
}

.md-list-item-router.active .md-icon,
.md-list-item-router.active p,
.md-list-item-router:hover .md-icon,
.md-list-item-router:hover p {
  color: #fff;
}
</style>