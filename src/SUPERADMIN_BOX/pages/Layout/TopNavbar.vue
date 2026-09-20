<template>
  <nav class="navbar navbar-expand-lg navbar-transparent navbar-absolute">
    <div class="container-fluid">
      <!-- Page title -->
      <div class="navbar-wrapper">
        <span class="page-title">
          {{ pageTitle }}
        </span>

        <div class="breadcrumb-text">
          Superadmin / {{ pageTitle }}
        </div>
      </div>

      <!-- Mobile sidebar toggle -->
      <button
        type="button"
        class="navbar-toggler"
        :class="{ toggled: proxy.$sidebar.showSidebar }"
        aria-label="Toggle sidebar"
        @click="toggleSidebar"
      >
        <span class="sr-only">
          Toggle navigation
        </span>

        <span class="icon-bar bar1" />
        <span class="icon-bar bar2" />
        <span class="icon-bar bar3" />
      </button>

      <!-- Right navigation -->
      <div class="navbar-actions">
        <!-- Dashboard -->
        <button
          type="button"
          class="navbar-action-button"
          title="Dashboard"
          @click="goToDashboard"
        >
          <md-icon>dashboard</md-icon>
        </button>

        <!-- Notifications -->
        <div class="notification-wrapper">
          <button
            type="button"
            class="navbar-action-button"
            title="Notifications"
            @click.stop="toggleNotifications"
          >
            <md-icon>notifications</md-icon>

            <span
              v-if="unreadNotifications > 0"
              class="notification-badge"
            >
              {{ unreadNotifications }}
            </span>
          </button>

          <div
            v-if="showNotifications"
            class="notification-menu"
          >
            <div class="notification-menu-header">
              <span>Notifications</span>

              <button
                type="button"
                class="mark-read-button"
                @click="markAllAsRead"
              >
                Mark all read
              </button>
            </div>

            <div
              v-if="notifications.length"
              class="notification-list"
            >
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{
                  unread: !notification.read
                }"
                @click="openNotification(notification)"
              >
                <div class="notification-icon">
                  <md-icon>
                    {{ notification.icon }}
                  </md-icon>
                </div>

                <div class="notification-content">
                  <div class="notification-title">
                    {{ notification.title }}
                  </div>

                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="notification-empty"
            >
              <md-icon>notifications_none</md-icon>

              <span>No notifications</span>
            </div>
          </div>
        </div>

        <!-- Account menu -->
        <div class="account-wrapper">
          <button
            type="button"
            class="account-button"
            @click.stop="toggleAccountMenu"
          >
            <div class="account-avatar">
              <img
                v-if="account.profilePictureUrl"
                :src="account.profilePictureUrl"
                :alt="accountName"
              />

              <span v-else>
                {{ accountInitials }}
              </span>
            </div>

            <div class="account-information">
              <span class="account-name">
                {{ accountName }}
              </span>

              <span class="account-role">
                Super Administrator
              </span>
            </div>

            <md-icon class="account-arrow">
              arrow_drop_down
            </md-icon>
          </button>

          <div
            v-if="showAccountMenu"
            class="account-menu"
          >
            <div class="account-menu-header">
              <div class="account-menu-avatar">
                {{ accountInitials }}
              </div>

              <div>
                <div class="account-menu-name">
                  {{ accountName }}
                </div>

                <div class="account-menu-id">
                  {{ account.userId || "Superadmin" }}
                </div>
              </div>
            </div>

            <div class="account-menu-divider" />

            <button
              type="button"
              class="account-menu-item"
              @click="goToProfile"
            >
              <md-icon>account_circle</md-icon>
              <span>My Profile</span>
            </button>

            <button
              type="button"
              class="account-menu-item"
              @click="goToChangePassword"
            >
              <md-icon>lock</md-icon>
              <span>Change Password</span>
            </button>

            <div class="account-menu-divider" />

            <button
              type="button"
              class="account-menu-item logout-item"
              @click="handleLogout"
            >
              <md-icon>logout</md-icon>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  ref,
  computed,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount
} from "vue";

import { useRouter } from "vue-router/composables";
import Swal from "sweetalert2";
import { logout } from "../../../services/api";

const { proxy } = getCurrentInstance();
const router = useRouter();

const showNotifications = ref(false);
const showAccountMenu = ref(false);

const account = ref({
  id: null,
  userId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  fullName: "",
  profilePictureUrl: null
});

const notifications = ref([
  {
    id: 1,
    title: "New account",
    message: "A new staff account was added.",
    icon: "person_add",
    read: false,
    path: "/superadmin/allusers"
  },
  {
    id: 2,
    title: "System update",
    message: "Review recent administrative activity.",
    icon: "history",
    read: false,
    path: "/superadmin/audit-activities"
  }
]);

const pageTitle = computed(() => {
  return (
    proxy.$route.meta.title ||
    proxy.$route.name ||
    "Superadmin"
  );
});

const accountName = computed(() => {
  if (
    account.value.fullName &&
    account.value.fullName.trim()
  ) {
    return account.value.fullName.trim();
  }

  const names = [
    account.value.firstName,
    account.value.middleName,
    account.value.lastName
  ].filter(name => {
    return name && name.trim();
  });

  return names.join(" ") || "Super Administrator";
});

const accountInitials = computed(() => {
  const names = [
    account.value.firstName,
    account.value.lastName
  ].filter(name => {
    return name && name.trim();
  });

  if (!names.length) {
    return "SA";
  }

  return names
    .map(name => {
      return name.charAt(0).toUpperCase();
    })
    .join("")
    .slice(0, 2);
});

const unreadNotifications = computed(() => {
  return notifications.value.filter(notification => {
    return !notification.read;
  }).length;
});

const loadAccount = () => {
  try {
    const storedAccount =
      localStorage.getItem("account") ||
      localStorage.getItem("user");

    if (!storedAccount) {
      return;
    }

    account.value = {
      ...account.value,
      ...JSON.parse(storedAccount)
    };
  } catch (error) {
    console.error(
      "Unable to load account information",
      error
    );
  }
};

const toggleSidebar = () => {
  proxy.$sidebar.displaySidebar(
    !proxy.$sidebar.showSidebar
  );
};

const toggleNotifications = () => {
  showNotifications.value =
    !showNotifications.value;

  showAccountMenu.value = false;
};

const toggleAccountMenu = () => {
  showAccountMenu.value =
    !showAccountMenu.value;

  showNotifications.value = false;
};

const markAllAsRead = () => {
  notifications.value = notifications.value.map(
    notification => {
      return {
        ...notification,
        read: true
      };
    }
  );
};

const openNotification = notification => {
  notification.read = true;
  showNotifications.value = false;

  if (notification.path) {
    router.push(notification.path);
  }
};

const goToDashboard = () => {
  router.push("/superadmin/dashboard");
};

const goToProfile = () => {
  showAccountMenu.value = false;
  router.push("/superadmin/user");
};

const goToChangePassword = () => {
  showAccountMenu.value = false;
  router.push("/superadmin/change-password");
};

const clearAuthenticationStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("account");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("user_id");
  localStorage.removeItem("role");
  localStorage.removeItem("isSuperuser");
  localStorage.removeItem("region");
  localStorage.removeItem("region_id");

  sessionStorage.clear();
};

const handleLogout = async () => {
  showAccountMenu.value = false;

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

const closeMenus = event => {
  const accountElement = event.target.closest(
    ".account-wrapper"
  );

  const notificationElement = event.target.closest(
    ".notification-wrapper"
  );

  if (!accountElement) {
    showAccountMenu.value = false;
  }

  if (!notificationElement) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  loadAccount();
  document.addEventListener("click", closeMenus);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenus);
});
</script>

<style scoped>
.navbar {
  min-height: 72px;
  padding: 0;
  border: 0;
  background: #ffffff !important;
  box-shadow:
    0 3px 16px rgba(15, 23, 42, 0.06);
}

.container-fluid {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 0 25px;
}

.navbar-wrapper {
  min-width: 0;
}

.navbar-brand {
  display: block;
  margin: 0;
  padding: 0;
  color: #111827 !important;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;
}

.breadcrumb-text {
  margin-top: 3px;
  color: #9ca3af;
  font-size: 10px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}

.navbar-action-button {
  position: relative;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  border: 0;
  border-radius: 12px;
  outline: 0;
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.navbar-action-button:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.navbar-action-button .md-icon {
  color: inherit !important;
  font-size: 22px !important;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 3px;
  min-width: 17px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  color: #ffffff;
  font-size: 8px;
  font-weight: 700;
  border: 2px solid #ffffff;
  border-radius: 10px;
  background: #dc2626;
}

.notification-wrapper,
.account-wrapper {
  position: relative;
}

.notification-menu,
.account-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 20px 45px rgba(15, 23, 42, 0.16);
}

.notification-menu {
  width: 350px;
}

.notification-menu-header {
  min-height: 58px;
  display: flex;
  align-items: center;
  padding: 13px 16px;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #edf2f7;
}

.mark-read-button {
  margin-left: auto;
  padding: 5px 8px;
  color: #16a34a;
  font-size: 9px;
  font-weight: 600;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 13px 15px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #f0fdf4;
  border-left: 3px solid #16a34a;
}

.notification-icon {
  min-width: 39px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  border-radius: 11px;
  background: #dcfce7;
}

.notification-icon .md-icon {
  color: #16a34a !important;
  font-size: 20px !important;
}

.notification-content {
  min-width: 0;
}

.notification-title {
  color: #1f2937;
  font-size: 11px;
  font-weight: 700;
}

.notification-message {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
  line-height: 1.45;
}

.notification-empty {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 10px;
}

.account-button {
  min-height: 50px;
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border: 0;
  border-radius: 14px;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.account-button:hover {
  background: #f8fafc;
}

.account-avatar,
.account-menu-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #ffffff;
  font-weight: 700;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #22c55e,
    #15803d
  );
}

.account-avatar {
  width: 38px;
  height: 38px;
  font-size: 11px;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 9px;
  text-align: left;
}

.account-name {
  max-width: 140px;
  color: #1f2937;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.account-role {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 8px;
}

.account-arrow {
  margin-left: 6px;
  color: #94a3b8 !important;
  font-size: 20px !important;
}

.account-menu {
  width: 260px;
}

.account-menu-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.account-menu-avatar {
  min-width: 43px;
  width: 43px;
  height: 43px;
  margin-right: 11px;
  font-size: 12px;
}

.account-menu-name {
  color: #1f2937;
  font-size: 12px;
  font-weight: 700;
}

.account-menu-id {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 9px;
}

.account-menu-divider {
  height: 1px;
  background: #edf2f7;
}

.account-menu-item {
  width: 100%;
  min-height: 45px;
  display: flex;
  align-items: center;
  padding: 8px 15px;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  border: 0;
  background: #ffffff;
  cursor: pointer;
}

.account-menu-item:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.account-menu-item .md-icon {
  margin-right: 11px;
  color: inherit !important;
  font-size: 19px !important;
}

.account-menu-item.logout-item {
  color: #dc2626;
}

.account-menu-item.logout-item:hover {
  background: #fef2f2;
}

.navbar-toggler {
  margin-left: auto;
}

@media (max-width: 991px) {
  .container-fluid {
    padding: 0 15px;
  }

  .navbar-actions {
    display: none;
  }

  .navbar-toggler {
    display: block;
  }
}

@media (max-width: 600px) {
  .navbar {
    min-height: 64px;
  }

  .container-fluid {
    min-height: 64px;
  }

  .navbar-brand {
    max-width: 210px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .breadcrumb-text {
    display: none;
  }
}
</style>