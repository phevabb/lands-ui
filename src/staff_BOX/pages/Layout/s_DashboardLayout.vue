<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
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
import Notifications from "@/components/NotificationPlugin/Notifications.vue";

const MOBILE_BREAKPOINT =
  991;

const router =
  useRouter();

const route =
  useRoute();

const userId =
  ref(
    localStorage.getItem(
      "user_id"
    ) ||
    localStorage.getItem(
      "user_id"
    ) ||
    ""
  );

  

const isMobile =
  ref(
    window.innerWidth <=
      MOBILE_BREAKPOINT
  );

const sidebarVisible =
  ref(
    window.innerWidth >
      MOBILE_BREAKPOINT &&
    localStorage.getItem(
      "sidebarVisible"
    ) !== "false"
  );

const sidebarBackground =
  ref("green");

const sidebarBackgroundImage =
  ref(
    require(
      "@/assets/img/new.jpg"
    )
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

onMounted(async () => {
  window.addEventListener(
    "resize",
    handleWindowResize
  );

  window.addEventListener(
    "sidebar-visibility-changed",
    handleSidebarVisibilityEvent
  );

  if (!userId.value) {
    await redirectToLogin();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "resize",
    handleWindowResize
  );

  window.removeEventListener(
    "sidebar-visibility-changed",
    handleSidebarVisibilityEvent
  );
});

function handleSidebarVisibility(
  visible
) {
  sidebarVisible.value =
    Boolean(visible);

  console.log(
    "Staff dashboard sidebar visibility:",
    sidebarVisible.value
  );
}

function handleSidebarVisibilityEvent(
  event
) {
  const visible =
    event?.detail?.visible;

  if (
    typeof visible !==
    "boolean"
  ) {
    return;
  }

  sidebarVisible.value =
    visible;
}

function handleWindowResize() {
  const currentMobileState =
    window.innerWidth <=
    MOBILE_BREAKPOINT;

  if (
    isMobile.value ===
    currentMobileState
  ) {
    return;
  }

  isMobile.value =
    currentMobileState;

  if (currentMobileState) {
    sidebarVisible.value =
      false;

    return;
  }

  sidebarVisible.value =
    localStorage.getItem(
      "sidebarVisible"
    ) !== "false";
}

function requestSidebarClose() {
  if (!isMobile.value) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "sidebar-close-request"
    )
  );
}

function setActive(
  item
) {
  activeAccountItem.value =
    item;
}

function clearActiveItem() {
  if (
    !showAccountDropdown.value
  ) {
    activeAccountItem.value =
      null;
  }
}

function toggleAccountDropdown() {
  showAccountDropdown.value =
    !showAccountDropdown.value;

  activeAccountItem.value =
    showAccountDropdown.value
      ? "account"
      : null;
}

function closeAccountDropdown() {
  showAccountDropdown.value =
    false;

  activeAccountItem.value =
    null;
}

async function goToDashboard() {
  const normalizedUserId =
    String(
      userId.value ||
      ""
    ).trim();

  if (!normalizedUserId) {
    console.error(
      "Cannot open the Staff dashboard because the user ID is missing."
    );

    await redirectToLogin();

    return;
  }

  closeAccountDropdown();
  requestSidebarClose();

  const targetRoute =
    `/staff/staff-details/${encodeURIComponent(
      normalizedUserId
    )}`;

  if (
    route.path ===
    targetRoute
  ) {
    return;
  }

  try {
    await router.push({
      path:
        targetRoute
    });
  } catch (error) {
    if (
      !error ||
      error.name !==
        "NavigationDuplicated"
    ) {
      console.error(
        "Unable to open the Staff dashboard:",
        error
      );
    }
  }
}

async function goToChangePassword() {
  closeAccountDropdown();
  requestSidebarClose();

  const targetRoute =
    "/staff/change-password";

  if (
    route.path ===
    targetRoute
  ) {
    return;
  }

  try {
    await router.push({
      path:
        targetRoute
    });
  } catch (error) {
    if (
      !error ||
      error.name !==
        "NavigationDuplicated"
    ) {
      console.error(
        "Unable to open the Staff change-password page:",
        error
      );
    }
  }
}

async function handleLogout() {
  if (logoutLoading.value) {
    return;
  }

  logoutLoading.value =
    true;

  closeAccountDropdown();
  requestSidebarClose();

  try {
    await logout();

    console.log(
      "Staff backend logout completed successfully"
    );
  } catch (error) {
    console.error(
      "Staff backend logout request failed:",
      error.response?.data ||
      error.message ||
      error
    );
  } finally {
    clearAuthentication();

    logoutLoading.value =
      false;

    await redirectToLogin();
  }
}

function clearAuthentication() {
  if (
    typeof removeAuthentication ===
    "function"
  ) {
    removeAuthentication();
  }

  const authenticationKeys = [
    "token",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "authenticatedUser",
    "user",
    "userId",
    "user_id",
    "role",
    "region",
    "regionName",
    "region_id",
    "profilePictureUrl"
  ];

  authenticationKeys.forEach(
    key => {
      localStorage.removeItem(
        key
      );
    }
  );

  userId.value =
    "";
}

async function redirectToLogin() {
  if (
    route.path ===
    "/login"
  ) {
    return;
  }

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
</script>

<template>
  <div
    class="wrapper"
    :class="{
      'sidebar-visible':
        sidebarVisible,

      'sidebar-hidden':
        !sidebarVisible,

      'mobile-layout':
        isMobile,

      'nav-open':
        isMobile &&
        sidebarVisible
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
      :auto-close="true"
      @visibility-change="
        handleSidebarVisibility
      "
    >
      <template #content>
        <div class="sidebar-navigation">
          <MobileMenu />

          <button
            type="button"
            class="sidebar-menu-button"
            :class="{
              active:
                route.path.startsWith(
                  '/staff/staff-details/'
                )
            }"
            @click="goToDashboard"
          >
            <span class="sidebar-item">
              <md-icon>
                dashboard
              </md-icon>

              <span class="sidebar-text">
                Dashboard
              </span>
            </span>
          </button>

          <button
            type="button"
            class="sidebar-menu-button"
            :class="{
              active:
                activeAccountItem ===
                  'account' ||
                showAccountDropdown
            }"
            :aria-expanded="
              showAccountDropdown
            "
            aria-controls="staff-account-dropdown"
            @mouseenter="
              setActive(
                'account'
              )
            "
            @mouseleave="
              clearActiveItem
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
              id="staff-account-dropdown"
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
                  setActive(
                    'account'
                  )
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
                class="
                  dropdown-menu-button
                  logout-button
                "
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
                  setActive(
                    'account'
                  )
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

    <main class="main-panel">
      <TopNavbar />

      <DashboardContent />

      <ContentFooter
        v-if="!hideFooter"
      />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.main-panel {
  position: relative;
  min-height: 100vh;
  transition:
    width 0.26s ease,
    margin-left 0.26s ease;
}

.wrapper.sidebar-visible:not(
  .mobile-layout
) > .main-panel {
  width:
    calc(
      100% -
      260px
    );
  margin-left:
    260px;
}

.wrapper.sidebar-hidden:not(
  .mobile-layout
) > .main-panel {
  width: 100%;
  margin-left: 0;
}

.sidebar-navigation {
  padding:
    10px
    8px
    24px;
}

.sidebar-menu-button,
.dropdown-menu-button {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  padding:
    8px
    13px;
  color: #ffffff;
  text-align: left;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.sidebar-menu-button:hover,
.sidebar-menu-button.active,
.dropdown-menu-button:hover,
.dropdown-menu-button.active {
  color: #ffffff;
  background:
    rgba(
      255,
      255,
      255,
      0.16
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
  height: auto;
  margin: 0;
  color: #ffffff !important;
  font-size: 23px !important;
  line-height: 1;
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
  white-space: nowrap;
}

.dropdown-arrow {
  margin-left:
    auto !important;
  transition:
    transform 0.2s ease;
}

.dropdown-arrow.open {
  transform:
    rotate(
      180deg
    );
}

.sidebar-dropdown {
  margin:
    4px
    0
    8px
    17px;
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

.dropdown-menu-button:last-child {
  margin-bottom: 0;
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

/*
 * Vue 2 transition classes.
 */
.account-dropdown-enter,
.account-dropdown-leave-to {
  opacity: 0;
  transform:
    translateY(
      -8px
    );
}

@media (max-width: 991px) {
  .wrapper.sidebar-visible
  > .main-panel,
  .wrapper.sidebar-hidden
  > .main-panel {
    width: 100% !important;
    margin-left: 0 !important;
    float: none !important;
  }
}
</style>