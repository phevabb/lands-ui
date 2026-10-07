<script setup>
import {
  computed,
  ref
} from "vue";

import {
  useRoute
} from "vue-router/composables";

const route =
  useRoute();

const search =
  ref("");

const normalizedSearch =
  computed(() => {
    return search.value
      .trim()
      .toLowerCase();
  });

const menuItems =
  computed(() => {
    const items = [
      {
        name:
          "Dashboard",

        path:
          "/manager/dashboard",

        icon:
          "dashboard"
      },

      {
        name:
          "All Users",

        path:
          "/manager/allusers",

        icon:
          "group"
      },

      {
        name:
          "New Entry",

        path:
          "/manager/new-entry",

        icon:
          "person_add"
      },

      {
        name:
          "Change Password",

        path:
          "/manager/change-password",

        icon:
          "lock"
      }
    ];

    if (
      !normalizedSearch.value
    ) {
      return items;
    }

    return items.filter(
      item => {
        return item.name
          .toLowerCase()
          .includes(
            normalizedSearch.value
          );
      }
    );
  });

function isRouteActive(
  path
) {
  const currentPath =
    route.path;

  if (
    path ===
    "/manager/dashboard"
  ) {
    return (
      currentPath ===
      path
    );
  }

  return (
    currentPath ===
      path ||
    currentPath.startsWith(
      `${path}/`
    )
  );
}

function clearSearch() {
  search.value =
    "";
}
</script>

<template>
  <ul class="nav nav-mobile-menu">
    <li class="mobile-search-item">
      <div class="mobile-search-control">
        <md-icon>
          search
        </md-icon>

        <input
          v-model.trim="search"
          type="search"
          placeholder="Search menu..."
          aria-label="Search Manager menu"
        />

        <button
          v-if="search"
          type="button"
          title="Clear search"
          aria-label="Clear menu search"
          @click="clearSearch"
        >
          <md-icon>
            close
          </md-icon>
        </button>
      </div>
    </li>

    <li
      v-for="item in menuItems"
      :key="item.path"
    >
      <router-link
        :to="item.path"
        class="mobile-menu-link"
        :class="{
          active:
            isRouteActive(
              item.path
            )
        }"
      >
        <md-icon>
          {{ item.icon }}
        </md-icon>

        <span class="mobile-menu-text">
          {{ item.name }}
        </span>
      </router-link>
    </li>

    <li
      v-if="menuItems.length === 0"
      class="no-menu-results"
    >
      <md-icon>
        search_off
      </md-icon>

      <span>
        No matching menu items
      </span>
    </li>
  </ul>
</template>

<style scoped>
.nav-mobile-menu {
  display: none;
  margin: 0;
  padding: 8px;
  list-style: none;
}

.nav-mobile-menu li {
  width: 100%;
  margin: 0 0 5px;
}

.mobile-search-item {
  padding: 7px 5px 12px;
}

.mobile-search-control {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.25
    );
  border-radius: 10px;
  background:
    rgba(
      255,
      255,
      255,
      0.12
    );
}

.mobile-search-control > .md-icon {
  width: 24px;
  min-width: 24px;
  margin: 0 8px 0 0;
  color: #ffffff !important;
  font-size: 21px !important;
}

.mobile-search-control input {
  min-width: 0;
  flex: 1;
  color: #ffffff;
  font-size: 15px;
  border: 0;
  outline: none;
  background: transparent;
}

.mobile-search-control input::placeholder {
  color:
    rgba(
      255,
      255,
      255,
      0.72
    );
}

.mobile-search-control button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #ffffff;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
}

.mobile-search-control button:hover {
  background:
    rgba(
      255,
      255,
      255,
      0.14
    );
}

.mobile-search-control button .md-icon {
  width: auto;
  min-width: 0;
  margin: 0;
  color: #ffffff !important;
  font-size: 20px !important;
}

.mobile-menu-link {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 13px;
  box-sizing: border-box;
  color: #ffffff;
  text-align: left;
  text-decoration: none;
  border-radius: 9px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.mobile-menu-link:hover {
  color: #ffffff;
  text-decoration: none;
  background:
    rgba(
      255,
      255,
      255,
      0.13
    );
}

.mobile-menu-link.active {
  color: #ffffff;
  background:
    rgba(
      255,
      255,
      255,
      0.2
    );
  box-shadow:
    inset 3px 0 0
    #ffffff;
}

.mobile-menu-link .md-icon {
  width: 25px;
  min-width: 25px;
  height: auto;
  margin: 0;
  color: #ffffff !important;
  font-size: 23px !important;
  line-height: 1;
}

.mobile-menu-text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-menu-results {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px;
  color:
    rgba(
      255,
      255,
      255,
      0.75
    );
  font-size: 14px;
}

.no-menu-results .md-icon {
  color:
    rgba(
      255,
      255,
      255,
      0.75
    ) !important;
}

@media (max-width: 991px) {
  .nav-mobile-menu {
    display: block;
  }
}
</style>