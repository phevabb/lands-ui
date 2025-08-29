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

        <!-- Account Dropdown -->
  <div  class="sidebar-link"
    :class="{ active: activeAccountItem === 'account' }"
    @mouseenter="setActive('account')"
    @mouseleave="setActive(null)"
    @click="toggleAccountDropdown"
    style="cursor:pointer;"
    >
    <span class="sidebar-item">
      <md-icon>account_circle</md-icon>
      <span class="sidebar-text">Account</span>
      <md-icon style="margin-left:auto;">arrow_drop_down</md-icon>
    </span>
  </div>
  <div v-if="showAccountDropdown" class="sidebar-dropdown">
    <div class="sidebar-link"
      :class="{ active: activeAccountItem === 'logout' }"
      @mouseenter="setActive('logout')"
      @mouseleave="setActive(null)"
      @click="handleLogout"
      style="cursor:pointer;"
        >
      <span class="sidebar-item">
        <md-icon>logout</md-icon>
        <span class="sidebar-text">Logout</span>
      </span>
    </div>
    <div class="sidebar-link"
      :class="{ active: activeAccountItem === 'change' }"
      @mouseenter="setActive('change')"
      @mouseleave="setActive(null)"
      @click="goToChangePassword"
      style="cursor:pointer;"
      >
      <span class="sidebar-item">
        <md-icon>lock</md-icon>
        <span class="sidebar-text">Change Password</span>
      </span>
    </div>
  </div>

        

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
import { useRouter } from "vue-router/composables";
import { logout } from "../../../services/api";


// Components
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/admin_BOX/pages/Layout/MobileMenu.vue";
import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import SidebarLink from "@/components/SidebarPlugin/SidebarLink.vue";
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

// Access global properties (like $sidebar and $route)

const router = useRouter();
const showAccountDropdown = ref(false);

const toggleAccountDropdown = () => {
  showAccountDropdown.value = !showAccountDropdown.value;
};

const goToChangePassword = () => {
  router.push("/change-password"); // Make sure this route exists
};

const handleLogout = async () => {
  try {
    await logout();
    localStorage.removeItem("token"); // Remove token before redirect
    localStorage.removeItem("user");
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};


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
  transition: background 0.2s;
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
.sidebar-dropdown {
  background: rgba(0,0,0,0.2);
  margin-left: 10px;
  border-radius: 5px;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: hwb(78 3% 7% / 0.15);
  color: #fff;
}

/* Ensure SidebarLink aligns content left */
:deep(.sidebar-link) {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px; /* spacing between icon and text */
}
</style>
