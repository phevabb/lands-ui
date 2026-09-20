<template>
  <div
    class="wrapper superadmin-wrapper"
    :class="{
      'nav-open': proxy.$sidebar.showSidebar
    }"
  >
    <Notifications />

    <SideBar
      title="GH Lands"
      :sidebar-item-color="sidebarBackground"
      :sidebar-background-image="sidebarBackgroundImage"
    >
      <MobileMenu />

      <template #content>
        <!-- Superadmin badge -->
        <div class="superadmin-badge">
          <div class="superadmin-badge-icon">
            <md-icon>admin_panel_settings</md-icon>
          </div>

          <div class="superadmin-badge-content">
            <span class="superadmin-badge-title">
              Super Administrator
            </span>

            <span class="superadmin-badge-subtitle">
              System Management
            </span>
          </div>
        </div>

        <!-- Overview heading -->
        <div class="sidebar-section-heading">
          Overview
        </div>

        <!-- Dashboard -->
        <SidebarLink
          :link="{
            name: 'Superadmin Dashboard',
            path: '/superadmin/dashboard'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>dashboard</md-icon>

            <span class="sidebar-text">
              Dashboard
            </span>
          </span>
        </SidebarLink>

        <!-- Staff management heading -->
        <div class="sidebar-section-heading">
          Staff Management
        </div>

        <!-- All users -->
        <SidebarLink
          :link="{
            name: 'Superadmin All Users',
            path: '/superadmin/allusers'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>groups</md-icon>

            <span class="sidebar-text">
              All Users
            </span>
          </span>
        </SidebarLink>

        <!-- New entry -->
        <SidebarLink
          :link="{
            name: 'Superadmin New Entry',
            path: '/superadmin/new-entry'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>person_add</md-icon>

            <span class="sidebar-text">
              New Entry
            </span>
          </span>
        </SidebarLink>

        <!-- Staff per department -->
        <SidebarLink
          :link="{
            name: 'Superadmin Staff Per Department',
            path: '/superadmin/users-per-department'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>account_tree</md-icon>

            <span class="sidebar-text">
              Staff Per Department
            </span>
          </span>
        </SidebarLink>

        <!-- Configuration heading -->
        <div class="sidebar-section-heading">
          System Configuration
        </div>

        <!-- Configuration dropdown -->
        <div
          class="sidebar-link sidebar-dropdown-trigger"
          :class="{
            active: isConfigurationActive
          }"
          @click="toggleConfigurationDropdown"
        >
          <span class="sidebar-item">
            <md-icon>settings</md-icon>

            <span class="sidebar-text">
              Configuration Tables
            </span>

            <md-icon class="dropdown-arrow">
              {{
                showConfigurationDropdown
                  ? "expand_less"
                  : "expand_more"
              }}
            </md-icon>
          </span>
        </div>

        <transition name="dropdown">
          <div
            v-if="showConfigurationDropdown"
            class="sidebar-dropdown"
          >
            <SidebarLink
              :link="{
                name: 'Academic Qualifications',
                path: '/superadmin/academic-qualifications'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>school</md-icon>

                <span class="sidebar-text dropdown-text">
                  Academic Qualifications
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Staff Classes',
                path: '/superadmin/staff-classes'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>category</md-icon>

                <span class="sidebar-text dropdown-text">
                  Classes
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Current Grades',
                path: '/superadmin/current-grades'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>grade</md-icon>

                <span class="sidebar-text dropdown-text">
                  Current Grades
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Next Grades',
                path: '/superadmin/next-grades'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>trending_up</md-icon>

                <span class="sidebar-text dropdown-text">
                  Next Grades
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Change Of Grades',
                path: '/superadmin/change-of-grades'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>swap_vert</md-icon>

                <span class="sidebar-text dropdown-text">
                  Change Of Grades
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Departments',
                path: '/superadmin/departments'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>business</md-icon>

                <span class="sidebar-text dropdown-text">
                  Departments
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Districts',
                path: '/superadmin/districts'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>location_city</md-icon>

                <span class="sidebar-text dropdown-text">
                  Districts
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Regions',
                path: '/superadmin/regions'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>map</md-icon>

                <span class="sidebar-text dropdown-text">
                  Regions
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Management Units',
                path: '/superadmin/management-units'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>domain</md-icon>

                <span class="sidebar-text dropdown-text">
                  Management Units
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Titles',
                path: '/superadmin/titles'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>badge</md-icon>

                <span class="sidebar-text dropdown-text">
                  Titles
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Leave Types',
                path: '/superadmin/on-leave-types'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>event_busy</md-icon>

                <span class="sidebar-text dropdown-text">
                  Leave Types
                </span>
              </span>
            </SidebarLink>

            <SidebarLink
              :link="{
                name: 'Positions',
                path: '/superadmin/positions'
              }"
              class="sidebar-link dropdown-link"
            >
              <span class="sidebar-item">
                <md-icon>work</md-icon>

                <span class="sidebar-text dropdown-text">
                  Positions
                </span>
              </span>
            </SidebarLink>
          </div>
        </transition>

        <!-- Administration heading -->
        <div class="sidebar-section-heading">
          Administration
        </div>

        <!-- Reports -->
        <SidebarLink
          :link="{
            name: 'Superadmin Reports',
            path: '/superadmin/reports'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>analytics</md-icon>

            <span class="sidebar-text">
              Reports
            </span>
          </span>
        </SidebarLink>

        <!-- Audit activities -->
        <SidebarLink
          :link="{
            name: 'Superadmin Audit Activities',
            path: '/superadmin/audit-activities'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>history</md-icon>

            <span class="sidebar-text">
              Audit Activities
            </span>
          </span>
        </SidebarLink>

        <!-- Account heading -->
        <div class="sidebar-section-heading">
          My Account
        </div>

        <!-- User profile -->
        <SidebarLink
          :link="{
            name: 'Superadmin User Profile',
            path: '/superadmin/user'
          }"
          class="sidebar-link"
        >
          <span class="sidebar-item">
            <md-icon>account_circle</md-icon>

            <span class="sidebar-text">
              My Profile
            </span>
          </span>
        </SidebarLink>

        <!-- Account dropdown -->
        <div
          class="sidebar-link sidebar-dropdown-trigger"
          :class="{
            active: activeAccountItem === 'account'
          }"
          @mouseenter="setActive('account')"
          @mouseleave="setActive(null)"
          @click="toggleAccountDropdown"
        >
          <span class="sidebar-item">
            <md-icon>manage_accounts</md-icon>

            <span class="sidebar-text">
              Account Settings
            </span>

            <md-icon class="dropdown-arrow">
              {{
                showAccountDropdown
                  ? "expand_less"
                  : "expand_more"
              }}
            </md-icon>
          </span>
        </div>

        <transition name="dropdown">
          <div
            v-if="showAccountDropdown"
            class="sidebar-dropdown"
          >
            <div
              class="sidebar-link dropdown-link"
              :class="{
                active: activeAccountItem === 'change'
              }"
              @mouseenter="setActive('change')"
              @mouseleave="setActive(null)"
              @click="goToChangePassword"
            >
              <span class="sidebar-item">
                <md-icon>lock</md-icon>

                <span class="sidebar-text dropdown-text">
                  Change Password
                </span>
              </span>
            </div>

            <div
              class="sidebar-link dropdown-link logout-link"
              :class="{
                active: activeAccountItem === 'logout'
              }"
              @mouseenter="setActive('logout')"
              @mouseleave="setActive(null)"
              @click="handleLogout"
            >
              <span class="sidebar-item">
                <md-icon>logout</md-icon>

                <span class="sidebar-text dropdown-text">
                  Sign Out
                </span>
              </span>
            </div>
          </div>
        </transition>
      </template>
    </SideBar>

    <div class="main-panel">
      <TopNavbar />

      <DashboardContent />

      <ContentFooter
        v-if="!proxy.$route.meta.hideFooter"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  getCurrentInstance
} from "vue";

import { useRouter } from "vue-router/composables";
import Swal from "sweetalert2";

// Existing API service
import { logout } from "../../../services/api";

// Layout components
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";

// Reuse your existing Material Dashboard components
import MobileMenu from "@/admin_BOX/pages/Layout/MobileMenu.vue";
import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import SidebarLink from "@/components/SidebarPlugin/SidebarLink.vue";
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

const { proxy } = getCurrentInstance();
const router = useRouter();

const showAccountDropdown = ref(false);
const showConfigurationDropdown = ref(true);
const activeAccountItem = ref(null);

const sidebarBackground = ref("green");

const sidebarBackgroundImage = ref(
  require("@/assets/img/new.jpg")
);

const configurationPaths = [
  "/superadmin/academic-qualifications",
  "/superadmin/staff-classes",
  "/superadmin/current-grades",
  "/superadmin/next-grades",
  "/superadmin/change-of-grades",
  "/superadmin/departments",
  "/superadmin/districts",
  "/superadmin/regions",
  "/superadmin/management-units",
  "/superadmin/titles",
  "/superadmin/on-leave-types",
  "/superadmin/positions"
];

const isConfigurationActive = computed(() => {
  return configurationPaths.some(path => {
    return proxy.$route.path.startsWith(path);
  });
});

const setActive = item => {
  activeAccountItem.value = item;
};

const toggleAccountDropdown = () => {
  showAccountDropdown.value =
    !showAccountDropdown.value;
};

const toggleConfigurationDropdown = () => {
  showConfigurationDropdown.value =
    !showConfigurationDropdown.value;
};

const goToChangePassword = () => {
  router.push("/superadmin/change-password");
};

const clearAuthenticationStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("refresh_token");

  localStorage.removeItem("user");
  localStorage.removeItem("account");
  localStorage.removeItem("role");
  localStorage.removeItem("isSuperuser");

  localStorage.removeItem("region");
  localStorage.removeItem("region_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("userId");

  sessionStorage.clear();
};

const handleLogout = async () => {
  const result = await Swal.fire({
    title: "Sign out?",
    text: "Your current session will be closed.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, sign out",
    cancelButtonText: "Cancel",
    reverseButtons: true
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await logout();
  } catch (error) {
    console.error(
      "The server logout request was unsuccessful",
      error
    );
  } finally {
    clearAuthenticationStorage();
    router.push("/login");
  }
};
</script>

<style scoped>
/* =========================================================
   MAIN LAYOUT
   ========================================================= */

.superadmin-wrapper {
  min-height: 100vh;
  background: #f4f7fb;
}

.main-panel {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 90% 5%,
      rgba(34, 197, 94, 0.07),
      transparent 28%
    ),
    #f4f7fb;
}

/* =========================================================
   SUPERADMIN BADGE
   ========================================================= */

.superadmin-badge {
  display: flex;
  align-items: center;
  margin: 18px 14px 16px;
  padding: 13px;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background:
    linear-gradient(
      135deg,
      rgba(22, 163, 74, 0.92),
      rgba(21, 128, 61, 0.78)
    );
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.superadmin-badge-icon {
  min-width: 42px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.16);
}

.superadmin-badge-icon .md-icon {
  color: #ffffff !important;
  font-size: 24px !important;
}

.superadmin-badge-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 11px;
}

.superadmin-badge-title {
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.superadmin-badge-subtitle {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* =========================================================
   SECTION HEADINGS
   ========================================================= */

.sidebar-section-heading {
  margin: 21px 19px 8px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 1.15px;
  text-transform: uppercase;
}

/* =========================================================
   SIDEBAR LINKS
   ========================================================= */

.sidebar-link {
  display: block;
  margin: 4px 10px;
  padding: 0;
  color: #ffffff;
  text-decoration: none;
  border-radius: 9px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.11);
  transform: translateX(2px);
}

.sidebar-link.active {
  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.96),
      rgba(22, 163, 74, 0.88)
    );
  box-shadow: 0 7px 16px rgba(22, 163, 74, 0.24);
}

.sidebar-item {
  min-height: 45px;
  display: flex;
  align-items: center;
  padding: 9px 13px;
  gap: 12px;
}

.sidebar-item .md-icon {
  min-width: 24px;
  width: 24px;
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 21px !important;
  transition: color 0.2s ease;
}

.sidebar-link:hover .md-icon,
.sidebar-link.active .md-icon {
  color: #ffffff !important;
}

.sidebar-text {
  min-width: 0;
  flex: 1;
  margin: 0;
}
</style>