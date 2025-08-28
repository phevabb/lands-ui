<template>
  <div class="wrapper" :class="{ 'nav-open': proxy.$sidebar.showSidebar }">
    <Notifications />

    <SideBar title="GH Lands"
      :sidebar-item-color="sidebarBackground"
      :sidebar-background-image="sidebarBackgroundImage"
    >
      <MobileMenu />
      <template #content>


        <SidebarLink
          :link="{
          name: 'Dashboard',
          path: '/dashboard',
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>dashboard</md-icon>
            <span class="sidebar-text">Dashboard</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'User Profile',
          path: '/user',
          }"
          class="sidebar-link">
          <span class="sidebar-item">
            <md-icon>person</md-icon>
            <span class="sidebar-text">User Profile</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'Table list',
          path: '/table',
          }"
           class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>content_paste</md-icon>
            <span class="sidebar-text">Table list</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'Dashboard',
          path: '/typography',
          }"
          class="sidebar-link">
          <span class="sidebar-item">
            <md-icon>library_books</md-icon>
            <span class="sidebar-text">Typography</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'Dashboard',
          path: '/icons',
          }"
           class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>bubble_chart</md-icon>
            <span class="sidebar-text">Icons</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'Dashboard',
          path: '/maps',
          }"
          class="sidebar-link">
          <span class="sidebar-item">
            <md-icon>location_on</md-icon>
            <span class="sidebar-text">Maps</span>
          </span>
        </SidebarLink>

        <SidebarLink
          :link="{
          name: 'Dashboard',
          path: '/notifications',
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>notifications</md-icon>
            <span class="sidebar-text">Notifications</span>
          </span>
        </SidebarLink>

      </template>
    </SideBar>

    <div class="main-panel">
      <TopNavbar />



      <DashboardContent />

      <ContentFooter v-if="!proxy.$route.meta.hideFooter" />
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";

// Components
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/admin_BOX/pages/Layout/MobileMenu.vue";
import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import SidebarLink from "@/components/SidebarPlugin/SidebarLink.vue";
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

// Access global properties (like $sidebar and $route)
const { proxy } = getCurrentInstance();

// Sidebar state
const sidebarBackground = ref("green");
const sidebarBackgroundImage = ref(require("@/assets/img/new.jpg"));
</script>

<style scoped>
/* Style for all sidebar text */
.sidebar-link {
  display: block;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px; /* spacing between icon and text */
}

.sidebar-text {
  color: white;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  padding: 0;
  text-align: left;
}

/* Ensure SidebarLink aligns content left */
:deep(.sidebar-link) {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px; /* spacing between icon and text */
}
</style>
