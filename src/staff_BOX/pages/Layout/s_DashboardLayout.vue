<template>
  <div class="wrapper" :class="{ 'nav-open': proxy.$sidebar.showSidebar }">
    <Notifications />
    <SideBar
      title="GH Lands"
      :sidebar-item-color="sidebarBackground"
      :sidebar-background-image="sidebarBackgroundImage"
    >
      <MobileMenu />
      <template #content>
        <div
          class="sidebar-link"
          @click="goToDashboard"
          style="cursor: pointer;"
        >
          <span class="sidebar-item">
            <md-icon>dashboard</md-icon>
            <span style="font-size: small;" class="sidebar-text">Dashboard</span>
          </span>
        </div>

        <!-- Account Dropdown -->
        <div
          class="sidebar-link"
          :class="{ active: activeAccountItem === 'account' }"
          @mouseenter="setActive('account')"
          @mouseleave="setActive(null)"
          @click="toggleAccountDropdown"
          style="cursor: pointer;"
        >
          <span class="sidebar-item">
            <md-icon>account_circle</md-icon>
            <span class="sidebar-text">Account</span>
            <md-icon style="margin-left: auto;">arrow_drop_down</md-icon>
          </span>
        </div>
        <div v-if="showAccountDropdown" class="sidebar-dropdown">
          <div
            class="sidebar-link"
            :class="{ active: activeAccountItem === 'logout' }"
            @mouseenter="setActive('logout')"
            @mouseleave="setActive(null)"
            @click="handleLogout"
            style="cursor: pointer;"
          >
            <span class="sidebar-item">
              <md-icon>logout</md-icon>
              <span class="sidebar-text">Logout</span>
            </span>
          </div>
          <div
            class="sidebar-link"
            :class="{ active: activeAccountItem === 'change' }"
            @mouseenter="setActive('change')"
            @mouseleave="setActive(null)"
            @click="goToChangePassword"
            style="cursor: pointer;"
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
import { ref, getCurrentInstance, onMounted } from "vue";
import { useRouter } from "vue-router/composables";
import { logout } from "../../../services/api";

// Components
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/admin_BOX/pages/Layout/MobileMenu.vue";
import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

const router = useRouter();
const showAccountDropdown = ref(false);
const activeAccountItem = ref(null);
const userId = ref(localStorage.getItem("user_id") || "");
const { proxy } = getCurrentInstance();
const sidebarBackground = ref("green");
const sidebarBackgroundImage = ref(require("@/assets/img/new.jpg"));

onMounted(() => {

  if (!userId.value) {

    router.push("/login");
  }
});

const toggleAccountDropdown = () => {
  showAccountDropdown.value = !showAccountDropdown.value;
};

const setActive = (item) => {
  activeAccountItem.value = item;
};

const goToDashboard = () => {

  const targetRoute = `/staff/staff-details/${userId.value}`;
  if (router.currentRoute.path !== targetRoute) {
    router.push(targetRoute).catch((err) => {
      if (err.name !== "NavigationDuplicated") {

      }
    });
  }
};

const goToChangePassword = () => {
  if (router.currentRoute.path !== "/staff/change-password") {
    router.push("/staff/change-password");
    showAccountDropdown.value = false;
  }
};

const handleLogout = async () => {
  try {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("region");
    localStorage.removeItem("region_id");
    localStorage.removeItem("user_id");
    router.push("/login");
  } catch (error) {

  }
};
</script>

<style scoped>
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
  gap: 10px;
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
  background: rgba(0, 0, 0, 0.2);
  margin-left: 10px;
  border-radius: 5px;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: hwb(78 3% 7% / 0.15);
  color: #fff;
}

:deep(.sidebar-link) {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
}
</style>