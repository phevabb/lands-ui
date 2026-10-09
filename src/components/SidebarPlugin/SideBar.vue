<template>
  <div
    class="sidebar-controller"
    :class="{
      'sidebar-is-visible':
        sidebarVisible,

      'sidebar-is-hidden':
        !sidebarVisible,

      'sidebar-is-mobile':
        isMobile
    }"
  >
    <aside
      id="application-sidebar"
      class="
        sidebar
        application-sidebar
      "
      :data-color="sidebarItemColor"
      :data-image="sidebarBackgroundImage"
      :style="sidebarStyle"
      aria-label="Main navigation"
      :aria-hidden="
        !sidebarVisible
      "
    >
      <div class="sidebar-top">
        <div class="logo welcome-text">
          <span>
        

            <strong>
              {{ displayName }}
            </strong>

            <!-- <small
              v-if="userSubtitle"
              class="user-subtitle"
            >
              {{ userSubtitle }}
            </small> -->
          </span>
        </div>

        <button
          type="button"
          class="sidebar-hide-button"
          title="Close sidebar"
          aria-label="Close sidebar"
          @click="hideSidebar"
        >
          <md-icon>
            close
          </md-icon>
        </button>
      </div>

      <div
        class="sidebar-wrapper"
        @click="handleSidebarContentClick"
      >
        <slot name="content"></slot>
      </div>
    </aside>

    <button
      v-if="
        isMobile &&
        sidebarVisible
      "
      type="button"
      class="sidebar-backdrop"
      aria-label="Close navigation menu"
      @click="hideSidebar"
    ></button>

    <button
      v-if="
        isMobile &&
        !sidebarVisible
      "
      type="button"
      class="mobile-sidebar-open-button"
      title="Open menu"
      aria-label="Open navigation menu"
      aria-controls="application-sidebar"
      :aria-expanded="
        sidebarVisible
      "
      @click="showSidebar"
    >
      <md-icon>
        menu
      </md-icon>
    </button>

    <button
      v-if="
        !isMobile &&
        !sidebarVisible
      "
      type="button"
      class="desktop-sidebar-open-button"
      title="Show sidebar"
      aria-label="Show sidebar"
      aria-controls="application-sidebar"
      :aria-expanded="
        sidebarVisible
      "
      @click="showSidebar"
    >
      <md-icon>
        menu
      </md-icon>

      <span>
        Menu
      </span>
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

const MOBILE_BREAKPOINT =
  991;

const props =
  defineProps({
    title: {
      type: String,
      default: "GH LANDS"
    },

    sidebarBackgroundImage: {
      type: String,

      default: () => {
        return require(
          "@/assets/img/sidebar-2.jpg"
        );
      }
    },

    imgLogo: {
      type: String,

      default: () => {
        return require(
          "@/assets/img/vue-logo.png"
        );
      }
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

const emit =
  defineEmits([
    "visibility-change"
  ]);

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

const isMobile =
  ref(false);

const sidebarVisible =
  ref(false);

provide(
  "autoClose",
  props.autoClose
);

const sidebarStyle =
  computed(() => {
    if (
      !props.sidebarBackgroundImage
    ) {
      return {
        backgroundImage:
          "none"
      };
    }

    return {
      backgroundImage:
        `linear-gradient(
          rgba(15, 23, 42, 0.52),
          rgba(15, 23, 42, 0.7)
        ),
        url(${props.sidebarBackgroundImage})`
    };
  });

const displayName =
  computed(() => {
    return (
      fullName.value ||
      userId.value ||
      props.title ||
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
        String(value).trim() !==
          ""
      );
    });

    return values.join(
      " • "
    );
  });

onMounted(() => {
  loadStoredUser();
  initializeSidebar();

  window.addEventListener(
    "resize",
    handleWindowResize
  );

  window.addEventListener(
    "storage",
    handleStorageChange
  );

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  window.addEventListener(
    "sidebar-toggle-request",
    handleSidebarToggleRequest
  );

  window.addEventListener(
    "sidebar-visibility-request",
    handleSidebarVisibilityRequest
  );

  window.addEventListener(
    "sidebar-close-request",
    handleSidebarCloseRequest
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "resize",
    handleWindowResize
  );

  window.removeEventListener(
    "storage",
    handleStorageChange
  );

  window.removeEventListener(
    "keydown",
    handleKeyDown
  );

  window.removeEventListener(
    "sidebar-toggle-request",
    handleSidebarToggleRequest
  );

  window.removeEventListener(
    "sidebar-visibility-request",
    handleSidebarVisibilityRequest
  );

  window.removeEventListener(
    "sidebar-close-request",
    handleSidebarCloseRequest
  );

  document.body.classList.remove(
    "sidebar-visible"
  );

  document.body.classList.remove(
    "sidebar-hidden"
  );

  document.body.classList.remove(
    "mobile-sidebar-open"
  );
});

function initializeSidebar() {
  isMobile.value =
    checkIsMobile();

  if (isMobile.value) {
    /*
     * The mobile sidebar starts closed.
     * It can be opened by either the navbar
     * button or this component's fallback
     * mobile menu button.
     */
    sidebarVisible.value =
      false;
  } else {
    sidebarVisible.value =
      getStoredDesktopVisibility();
  }

  applySidebarState();

  notifySidebarVisibility(
    "initialization"
  );
}

function checkIsMobile() {
  return (
    window.innerWidth <=
    MOBILE_BREAKPOINT
  );
}

function getStoredDesktopVisibility() {
  const storedVisibility =
    localStorage.getItem(
      "sidebarVisible"
    );

  if (
    storedVisibility ===
    null
  ) {
    return true;
  }

  return (
    storedVisibility ===
    "true"
  );
}

function handleWindowResize() {
  const previousMobileState =
    isMobile.value;

  const newMobileState =
    checkIsMobile();

  if (
    previousMobileState ===
    newMobileState
  ) {
    return;
  }

  isMobile.value =
    newMobileState;

  if (newMobileState) {
    setSidebarVisibility(
      false,
      {
        persist:
          false,

        source:
          "resize-mobile"
      }
    );

    return;
  }

  setSidebarVisibility(
    getStoredDesktopVisibility(),
    {
      persist:
        false,

      source:
        "resize-desktop"
    }
  );
}

function handleSidebarToggleRequest() {
  toggleSidebar();
}

function handleSidebarVisibilityRequest(
  event
) {
  const requestedVisibility =
    event &&
    event.detail
      ? event.detail.visible
      : undefined;

  if (
    typeof requestedVisibility ===
    "boolean"
  ) {
    setSidebarVisibility(
      requestedVisibility,
      {
        persist:
          !isMobile.value,

        source:
          "visibility-request"
      }
    );

    return;
  }

  toggleSidebar();
}

function handleSidebarCloseRequest() {
  if (
    isMobile.value
  ) {
    hideSidebar();
  }
}

function handleKeyDown(
  event
) {
  if (
    event.key !==
    "Escape"
  ) {
    return;
  }

  if (
    isMobile.value &&
    sidebarVisible.value
  ) {
    hideSidebar();
  }
}

function handleSidebarContentClick(
  event
) {
  if (
    !isMobile.value ||
    !props.autoClose
  ) {
    return;
  }

  const target =
    event.target;

  if (
    !target ||
    typeof target.closest !==
      "function"
  ) {
    return;
  }

  const navigationElement =
    target.closest(
      "a, .router-link-active, [data-sidebar-close]"
    );

  if (!navigationElement) {
    return;
  }

  window.setTimeout(
    () => {
      hideSidebar();
    },
    80
  );
}

function handleStorageChange(
  event
) {
  const authenticationKeys = [
    "authenticatedUser",
    "user",
    "userId",
    "user_id",
    "role",
    "region",
    "regionName",
    "profilePictureUrl"
  ];

  if (
    event.key &&
    authenticationKeys.includes(
      event.key
    )
  ) {
    loadStoredUser();
  }

  /*
   * Storage events are mainly useful when
   * another browser tab changes the state.
   */
  if (
    event.key ===
      "sidebarVisible" &&
    !isMobile.value
  ) {
    setSidebarVisibility(
      event.newValue !==
        "false",
      {
        persist:
          false,

        source:
          "storage"
      }
    );
  }
}

function setSidebarVisibility(
  visible,
  options = {}
) {
  const persist =
    options.persist !==
    undefined
      ? options.persist
      : !isMobile.value;

  const source =
    options.source ||
    "internal";

  sidebarVisible.value =
    Boolean(visible);

  if (persist) {
    localStorage.setItem(
      "sidebarVisible",
      String(
        sidebarVisible.value
      )
    );
  }

  applySidebarState();

  notifySidebarVisibility(
    source
  );
}

function toggleSidebar() {
  setSidebarVisibility(
    !sidebarVisible.value,
    {
      persist:
        !isMobile.value,

      source:
        "toggle"
    }
  );
}

function hideSidebar() {
  setSidebarVisibility(
    false,
    {
      persist:
        !isMobile.value,

      source:
        "hide"
    }
  );
}

function showSidebar() {
  setSidebarVisibility(
    true,
    {
      persist:
        !isMobile.value,

      source:
        "show"
    }
  );
}

function applySidebarState() {
  const mobileSidebarOpen =
    isMobile.value &&
    sidebarVisible.value;

  document.body.classList.toggle(
    "sidebar-visible",
    sidebarVisible.value
  );

  document.body.classList.toggle(
    "sidebar-hidden",
    !sidebarVisible.value
  );

  document.body.classList.toggle(
    "mobile-sidebar-open",
    mobileSidebarOpen
  );
}

function notifySidebarVisibility(
  source
) {
  const detail = {
    visible:
      sidebarVisible.value,

    isMobile:
      isMobile.value,

    source
  };

  emit(
    "visibility-change",
    sidebarVisible.value
  );

  window.dispatchEvent(
    new CustomEvent(
      "sidebar-visibility-changed",
      {
        detail
      }
    )
  );

  console.log(
    "Sidebar state:",
    detail
  );
}

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
    firstNonEmptyValue(
      user.fullName,
      user.full_name,
      user.displayName,
      user.display_name
    );

  userId.value =
    firstNonEmptyValue(
      user.userId,
      user.user_id,
      localStorage.getItem(
        "userId"
      ),
      localStorage.getItem(
        "user_id"
      )
    );

  role.value =
    firstNonEmptyValue(
      user.role,
      localStorage.getItem(
        "role"
      )
    );

  regionName.value =
    firstNonEmptyValue(
      user.regionName,
      user.region_name,
      user.region,
      localStorage.getItem(
        "regionName"
      ),
      localStorage.getItem(
        "region"
      )
    );

  profilePictureUrl.value =
    firstNonEmptyValue(
      user.profilePictureUrl,
      user.profile_picture_url,
      user.profilePicture,
      user.profile_picture,
      localStorage.getItem(
        "profilePictureUrl"
      )
    );
}

function firstNonEmptyValue(
  ...values
) {
  const value =
    values.find(item => {
      return (
        item !== null &&
        item !== undefined &&
        String(item).trim() !==
          ""
      );
    });

  if (
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
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
      !Array.isArray(
        parsedValue
      )
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
    return {
      fullName:
        String(
          storedValue
        ).trim()
    };
  }

  return {};
}

defineExpose({
  isMobile,
  sidebarVisible,
  displayName,
  userSubtitle,
  profilePictureUrl,
  showSidebar,
  hideSidebar,
  toggleSidebar
});
</script>

<style scoped>
.sidebar-controller {
  position: relative;
  z-index: 1030;
}

.application-sidebar {
  z-index: 1060 !important;
  transition:
    left 0.26s ease,
    transform 0.26s ease,
    visibility 0.26s ease,
    opacity 0.26s ease;
}

.sidebar-top {
  position: relative;
  z-index: 5;
  min-height: 76px;
  display: flex;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom:
    1px solid
    rgba(255, 255, 255, 0.16);
}

.logo {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0;
}

.welcome-text {
  color:
    rgba(
      255,
      255,
      255,
      0.9
    );
  font-size: 16px;
  font-weight: 500;
  line-height: 1.45;
  text-align: left;
}

.welcome-text span {
  min-width: 0;
  display: block;
  overflow: hidden;
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

.user-subtitle {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color:
    rgba(
      255,
      255,
      255,
      0.72
    );
  font-size: 12px;
  font-weight: 600;
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
  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.22
    );
  border-radius: 11px;
  outline: none;
  background:
    rgba(
      255,
      255,
      255,
      0.13
    );
  cursor: pointer;
}

.sidebar-hide-button:hover {
  background:
    rgba(
      220,
      38,
      38,
      0.9
    );
}

.sidebar-hide-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 25px !important;
  line-height: 1 !important;
}

.sidebar-wrapper {
  height:
    calc(
      100vh -
      76px
    );
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background:
    rgba(
      15,
      23,
      42,
      0.66
    );
  backdrop-filter:
    blur(2px);
  cursor: pointer;
}

.mobile-sidebar-open-button {
  position: fixed;
  top:
    calc(
      12px +
      env(
        safe-area-inset-top
      )
    );
  left: 12px;
  z-index: 1200;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #ffffff;
  border: 0;
  border-radius: 11px;
  outline: none;
  background:
    linear-gradient(
      135deg,
      #15803d,
      #16a34a
    );
  box-shadow:
    0 9px 22px
    rgba(
      22,
      163,
      74,
      0.35
    );
  cursor: pointer;
}

.mobile-sidebar-open-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  color: #ffffff !important;
  font-size: 26px !important;
}

.desktop-sidebar-open-button {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 1100;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-radius: 11px;
  background:
    linear-gradient(
      135deg,
      #15803d,
      #16a34a
    );
  box-shadow:
    0 9px 22px
    rgba(
      22,
      163,
      74,
      0.3
    );
  cursor: pointer;
}

.desktop-sidebar-open-button .md-icon {
  color: #ffffff !important;
}

@media (min-width: 992px) {
  .sidebar-is-visible
  .application-sidebar {
    left: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform:
      translate3d(
        0,
        0,
        0
      ) !important;
  }

  .sidebar-is-hidden
  .application-sidebar {
    left: -300px !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none;
    transform:
      translate3d(
        -100%,
        0,
        0
      ) !important;
  }
}

@media (max-width: 991px) {
  .sidebar-controller {
    position: static;
  }

  .application-sidebar {
    position: fixed !important;
    top: 0 !important;
    bottom: 0 !important;
    right: auto !important;
    z-index: 1060 !important;
    width: min(86vw, 300px) !important;
    max-width: 300px !important;
    height: 100vh !important;
    height: 100dvh !important;
    margin: 0 !important;
    float: none !important;
    overflow: hidden !important;
    background-position: center !important;
    background-size: cover !important;
    box-shadow:
      14px 0 38px
      rgba(
        15,
        23,
        42,
        0.42
      );
  }

  .sidebar-is-visible
  .application-sidebar {
    left: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform:
      translate3d(
        0,
        0,
        0
      ) !important;
  }

  .sidebar-is-hidden
  .application-sidebar {
    left: -310px !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    transform:
      translate3d(
        -100%,
        0,
        0
      ) !important;
  }

  .sidebar-wrapper {
    height:
      calc(
        100dvh -
        76px
      );
    padding-bottom:
      env(
        safe-area-inset-bottom
      );
  }

  .sidebar-hide-button {
    display:
      inline-flex !important;
  }
}
</style>