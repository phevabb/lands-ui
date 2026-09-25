<template>
  <div class="sidebar-controller">
    <transition name="sidebar-slide">
      <div
        v-show="sidebarVisible"
        class="sidebar"
        :data-color="sidebarItemColor"
        :data-image="sidebarBackgroundImage"
        :style="sidebarStyle"
      >
        <div class="sidebar-top">
          <div class="logo welcome-text">
            <span>
              Welcome,
              <strong>
                {{ fullName || title }}
              </strong>
            </span>
          </div>

          <button
            type="button"
            class="sidebar-hide-button"
            title="Hide sidebar"
            aria-label="Hide sidebar"
            @click="hideSidebar"
          >
            <md-icon>chevron_left</md-icon>
          </button>
        </div>

        <div class="sidebar-wrapper">
          <slot name="content"></slot>
        </div>
      </div>
    </transition>

    <button
      v-show="!sidebarVisible"
      type="button"
      class="sidebar-show-button"
      title="Show sidebar"
      aria-label="Show sidebar"
      @click="showSidebar"
    >
      <md-icon>menu</md-icon>

      <span>Menu</span>
    </button>
  </div>
</template>


<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref
} from "vue";

import SidebarLink from "./SidebarLink.vue";

const props = defineProps({
  title: {
    type: String,
    default: "GH LANDS"
  },

  sidebarBackgroundImage: {
    type: String,
    default: () =>
      require(
        "@/assets/img/sidebar-2.jpg"
      )
  },

  imgLogo: {
    type: String,
    default: () =>
      require(
        "@/assets/img/vue-logo.png"
      )
  },

  sidebarItemColor: {
    type: String,
    default: "green",

    validator: value => {
      const acceptedValues = [
        "",
        "purple",
        "blue",
        "green",
        "orange",
        "red"
      ];

      return acceptedValues.includes(
        value
      );
    }
  },

  sidebarLinks: {
    type: Array,
    default: () => []
  },

  autoClose: {
    type: Boolean,
    default: true
  }
});

const fullName =
  ref("");

const userId =
  ref("");

const role =
  ref("");

const regionName =
  ref("");

const profilePictureUrl =
  ref("");

const sidebarVisible =
  ref(true);

provide(
  "autoClose",
  props.autoClose
);

const sidebarStyle =
  computed(() => {
    return {
      backgroundImage:
        `url(${props.sidebarBackgroundImage})`
    };
  });

const displayName =
  computed(() => {
    return (
      fullName.value ||
      userId.value ||
      "User"
    );
  });

const userSubtitle =
  computed(() => {
    const values = [
      role.value,
      regionName.value
    ].filter(value => {
      return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      );
    });

    return values.join(" • ");
  });

onMounted(() => {
  loadStoredUser();
  loadSidebarState();
  updateMainPanel();

  window.addEventListener(
    "storage",
    handleStorageChange
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "storage",
    handleStorageChange
  );
});

function loadStoredUser() {
  const storedUser =
    localStorage.getItem(
      "authenticatedUser"
    ) ||
    localStorage.getItem(
      "user"
    );

  const user =
    parseStoredUser(
      storedUser
    );

  fullName.value =
    user.fullName ||
    user.displayName ||
    "";

  userId.value =
    user.userId ||
    localStorage.getItem(
      "userId"
    ) ||
    "";

  role.value =
    user.role ||
    localStorage.getItem(
      "role"
    ) ||
    "";

  regionName.value =
    user.regionName ||
    localStorage.getItem(
      "regionName"
    ) ||
    localStorage.getItem(
      "region"
    ) ||
    "";

  profilePictureUrl.value =
    user.profilePictureUrl ||
    user.profilePicture ||
    "";

  printlnStoredUser();
}

function parseStoredUser(
  storedValue
) {
  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue =
      JSON.parse(
        storedValue
      );

    if (
      parsedValue &&
      typeof parsedValue ===
        "object" &&
      !Array.isArray(parsedValue)
    ) {
      return parsedValue;
    }

    if (
      typeof parsedValue ===
        "string"
    ) {
      return {
        fullName:
          parsedValue
      };
    }
  } catch (error) {
    /*
     * Legacy support:
     *
     * Older login code stored only the
     * full name in the "user" key instead
     * of storing a JSON object.
     */
    return {
      fullName:
        storedValue
    };
  }

  return {};
}

function printlnStoredUser() {
  console.log(
    "Sidebar authenticated user:",
    {
      fullName:
        fullName.value,

      userId:
        userId.value,

      role:
        role.value,

      regionName:
        regionName.value
    }
  );
}

function loadSidebarState() {
  const savedSidebarState =
    localStorage.getItem(
      "sidebarVisible"
    );

  if (
    savedSidebarState !== null
  ) {
    sidebarVisible.value =
      savedSidebarState ===
      "true";
  }
}

function handleStorageChange(
  event
) {
  const authenticationKeys = [
    "authenticatedUser",
    "user",
    "userId",
    "role",
    "region",
    "regionName"
  ];

  if (
    authenticationKeys.includes(
      event.key
    )
  ) {
    loadStoredUser();
  }

  if (
    event.key ===
    "sidebarVisible"
  ) {
    loadSidebarState();
    updateMainPanel();
  }
}

function hideSidebar() {
  sidebarVisible.value =
    false;

  localStorage.setItem(
    "sidebarVisible",
    "false"
  );

  updateMainPanel();
}

function showSidebar() {
  sidebarVisible.value =
    true;

  localStorage.setItem(
    "sidebarVisible",
    "true"
  );

  updateMainPanel();
}

function toggleSidebar() {
  if (sidebarVisible.value) {
    hideSidebar();
  } else {
    showSidebar();
  }
}

function updateMainPanel() {
  document.body.classList.toggle(
    "sidebar-hidden",
    !sidebarVisible.value
  );
}
</script>

<style scoped>
.sidebar-controller {
  position: relative;
  z-index: 1030;
}

.sidebar-top {
  position: relative;
  z-index: 5;
  min-height: 76px;
  display: flex;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.logo {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  text-decoration: none;
}

.welcome-text span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.welcome-text strong {
  display: block;
  overflow: hidden;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-hide-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-left: 9px;
  padding: 0;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 11px;
  outline: none;
  background: rgba(255, 255, 255, 0.13);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.sidebar-hide-button:hover {
  background: rgba(220, 38, 38, 0.9);
  transform: translateX(-2px);
}

.sidebar-hide-button:active {
  transform: translateX(0);
}

.sidebar-hide-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 27px !important;
  line-height: 1 !important;
}

.sidebar-show-button {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 1100;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-radius: 11px;
  outline: none;
  background: linear-gradient(
    135deg,
    #15803d,
    #16a34a
  );
  box-shadow: 0 9px 22px rgba(22, 163, 74, 0.3);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar-show-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 13px 27px rgba(22, 163, 74, 0.36);
}

.sidebar-show-button:active {
  transform: translateY(0);
}

.sidebar-show-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 23px !important;
  line-height: 1 !important;
}

.sidebar-wrapper {
  height: calc(100vh - 76px);
  overflow-x: hidden;
  overflow-y: auto;
}

.nav {
  text-align: left;
}

.nav .md-list-item,
.nav .sidebar-link {
  justify-content: flex-start !important;
  text-align: left !important;
}

.nav .md-list-item p,
.nav .sidebar-link p {
  margin-left: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-wrapper::-webkit-scrollbar {
  width: 8px;
}

.sidebar-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-wrapper::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.25);
}

.sidebar-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 991px) {
  .sidebar-show-button {
    top: 12px;
    left: 12px;
  }
}
</style>