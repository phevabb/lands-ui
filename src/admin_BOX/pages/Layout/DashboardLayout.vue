<script setup>
import {
  computed,
  ref
} from "vue";

import {
  useRoute,
  useRouter
} from "vue-router/composables";

import {
  logout,
  removeAuthentication
} from "@/services/api";

import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "@/admin_BOX/pages/Layout/MobileMenu.vue";

import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import SidebarLink from "@/components/SidebarPlugin/SidebarLink.vue";
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

const router =
  useRouter();

const route =
  useRoute();

const sidebarBackground =
  ref("green");

const sidebarBackgroundImage =
  ref(
    require(
      "@/assets/img/new.jpg"
    )
  );

const sidebarVisible =
  ref(
    localStorage.getItem(
      "sidebarVisible"
    ) !==
      "false"
  );

const showAccountDropdown =
  ref(false);

const activeAccountItem =
  ref(null);

const logoutLoading =
  ref(false);

const hideFooter =
  computed(() => {
    return Boolean(
      route.meta?.hideFooter
    );
  });

function handleSidebarVisibility(
  visible
) {
  sidebarVisible.value =
    Boolean(visible);

  console.log(
    "Dashboard sidebar visible:",
    sidebarVisible.value
  );
}

function toggleAccountDropdown() {
  showAccountDropdown.value =
    !showAccountDropdown.value;

  activeAccountItem.value =
    showAccountDropdown.value
      ? "account"
      : null;
}

function setActive(
  item
) {
  activeAccountItem.value =
    item;
}

function closeAccountDropdown() {
  showAccountDropdown.value =
    false;

  activeAccountItem.value =
    null;
}

async function goToChangePassword() {
  closeAccountDropdown();

  try {
    await router.push({
      path:
        "/change-password"
    });
  } catch (error) {
    if (
      !error ||
      error.name !==
        "NavigationDuplicated"
    ) {
      console.error(
        "Unable to open change password page:",
        error
      );
    }
  }
}

function clearAuthentication() {
  removeAuthentication();
}

async function handleLogout() {
  if (logoutLoading.value) {
    return;
  }

  logoutLoading.value =
    true;

  closeAccountDropdown();

  try {
    await logout();

    console.log(
      "Backend logout completed successfully"
    );
  } catch (error) {
    console.error(
      "Backend logout request failed:",
      error.response?.data ||
      error
    );
  } finally {
    clearAuthentication();

    logoutLoading.value =
      false;

    try {
      await router.replace({
        path:
          "/login"
      });
    } catch (error) {
      if (
        !error ||
        error.name !==
          "NavigationDuplicated"
      ) {
        console.error(
          "Unable to redirect to login:",
          error
        );
      }
    }
  }
}
</script>

<template>
  <div
    class="wrapper"
    :class="{
      'sidebar-visible':
        sidebarVisible,

      'sidebar-hidden':
        !sidebarVisible
    }"
  >
    <Notifications />

    <SideBar
      title="GH Lands"
      :sidebar-item-color="
        sidebarBackground
      "
      :sidebar-background-image="
        sidebarBackgroundImage
      "
      @visibility-change="
        handleSidebarVisibility
      "
    >
      <template #content>
        <div class="sidebar-navigation">
          

          <SidebarLink
            :link="{
              name:
                'Dashboard',

              path:
                '/dashboard'
            }"
            class="sidebar-link"
          >
            <span class="sidebar-item">
              <md-icon>
                dashboard
              </md-icon>

              <span class="sidebar-text">
                Staff Distribution Analysis
              </span>
            </span>
          </SidebarLink>

          <SidebarLink
            :link="{
              name:
                'All Users',

              path:
                '/allusers'
            }"
            class="sidebar-link"
          >
            <span class="sidebar-item">
              <md-icon>
                group
              </md-icon>

              <span class="sidebar-text">
                All Users
              </span>
            </span>
          </SidebarLink>

          <SidebarLink
            :link="{
              name:
                'New Entry',

              path:
                '/new-entry'
            }"
            class="sidebar-link"
          >
            <span class="sidebar-item">
              <md-icon>
                person_add
              </md-icon>

              <span class="sidebar-text">
                New Entry
              </span>
            </span>
          </SidebarLink>

          <button
            type="button"
            class="account-menu-button"
            :class="{
              active:
                activeAccountItem ===
                'account'
            }"
            :aria-expanded="
              showAccountDropdown
            "
            @mouseenter="
              setActive(
                'account'
              )
            "
            @mouseleave="
              setActive(null)
            "
            @click="
              toggleAccountDropdown
            "
          >
            <span class="sidebar-item">
              <md-icon>
                account_circle
              </md-icon>

              <span class="sidebar-text">
                Account
              </span>

              <md-icon
                class="dropdown-arrow"
                :class="{
                  open:
                    showAccountDropdown
                }"
              >
                arrow_drop_down
              </md-icon>
            </span>
          </button>

          <transition name="account-dropdown">
            <div
              v-if="showAccountDropdown"
              class="sidebar-dropdown"
            >
              <button
                type="button"
                class="dropdown-menu-button"
                :class="{
                  active:
                    activeAccountItem ===
                    'change'
                }"
                @mouseenter="
                  setActive(
                    'change'
                  )
                "
                @mouseleave="
                  setActive(null)
                "
                @click="
                  goToChangePassword
                "
              >
                <span class="sidebar-item">
                  <md-icon>
                    lock
                  </md-icon>

                  <span class="sidebar-text">
                    Change Password
                  </span>
                </span>
              </button>

              <button
                type="button"
                class="dropdown-menu-button logout-button"
                :class="{
                  active:
                    activeAccountItem ===
                    'logout'
                }"
                :disabled="
                  logoutLoading
                "
                @mouseenter="
                  setActive(
                    'logout'
                  )
                "
                @mouseleave="
                  setActive(null)
                "
                @click="
                  handleLogout
                "
              >
                <span class="sidebar-item">
                  <md-icon>
                    {{
                      logoutLoading
                        ? "hourglass_top"
                        : "logout"
                    }}
                  </md-icon>

                  <span class="sidebar-text">
                    {{
                      logoutLoading
                        ? "Logging out..."
                        : "Logout"
                    }}
                  </span>
                </span>
              </button>
            </div>
          </transition>
        </div>
      </template>
    </SideBar>

    <div class="main-panel">
      <TopNavbar />

      <DashboardContent />

      <ContentFooter
        v-if="!hideFooter"
      />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  min-height: 100vh;
}

.main-panel {
  min-height: 100vh;
  transition:
    width 0.25s ease,
    margin-left 0.25s ease;
}

.wrapper.sidebar-visible
.main-panel {
  width: calc(100% - 260px);
  margin-left: 260px;
}

.wrapper.sidebar-hidden
.main-panel {
  width: 100%;
  margin-left: 0;
}

.sidebar-navigation {
  padding: 10px 8px 24px;
}

.sidebar-link,
.account-menu-button,
.dropdown-menu-button {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  padding: 8px 13px;
  color: #ffffff;
  text-align: left;
  text-decoration: none;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.sidebar-link:hover,
.account-menu-button:hover,
.account-menu-button.active,
.dropdown-menu-button:hover,
.dropdown-menu-button.active {
  color: #ffffff;
  background:
    rgba(
      255,
      255,
      255,
      0.14
    );
}

.sidebar-item {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.sidebar-item .md-icon {
  width: 26px;
  min-width: 26px;
  margin: 0;
  color: #ffffff !important;
  font-size: 23px !important;
}

.sidebar-text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  text-align: left;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  margin-left: auto !important;
  transition:
    transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.sidebar-dropdown {
  margin: 4px 0 8px 17px;
  padding: 5px;
  border-left:
    2px solid
    rgba(
      255,
      255,
      255,
      0.25
    );
  border-radius: 7px;
  background:
    rgba(
      0,
      0,
      0,
      0.18
    );
}

.dropdown-menu-button {
  min-height: 45px;
  margin-bottom: 3px;
}

.logout-button:hover,
.logout-button.active {
  background:
    rgba(
      220,
      38,
      38,
      0.78
    );
}

.dropdown-menu-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.account-dropdown-enter-active,
.account-dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.account-dropdown-enter,
.account-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

:deep(.sidebar-link) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

:deep(.sidebar-link .sidebar-item) {
  width: 100%;
}

@media (max-width: 991px) {
  .wrapper.sidebar-visible
  .main-panel,
  .wrapper.sidebar-hidden
  .main-panel {
    width: 100%;
    margin-left: 0;
  }
}
</style>