<template>
  <md-toolbar md-elevation="0" class="md-transparent">
    <div class="md-toolbar-row">
      <div class="md-toolbar-section-start">
        <!-- Prepend region before route name -->
        <h3 class="md-title">{{ region }} {{ $route.name }}</h3>
      </div>
      <div class="md-toolbar-section-end">
        <md-button
          class="md-just-icon md-simple md-toolbar-toggle"
          :class="{ toggled: $sidebar.showSidebar }"
          @click="toggleSidebar"
        >
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </md-button>

        <div class="md-collapse">
          

          <md-list>
            <md-list-item href="/dashboard">
              <i class="material-icons">dashboard</i>
              <p class="hidden-lg hidden-md">Dashboard</p>
            </md-list-item>

            <!-- Profile Dropdown -->
            <div>
              <md-menu>
                <!-- Trigger list-item styled like your Dashboard link -->
                <md-list-item md-menu-trigger class="profile-trigger">
                  <i class="material-icons">person</i>
                  <p class="hidden-lg hidden-md">Profile</p>
                </md-list-item>

                <!-- Dropdown content -->
                <md-menu-content>
                  <md-menu-item @click="$router.push('/manager/change-password')">
                    <i class="material-icons">lock</i>
                    Change Password
                  </md-menu-item>

                  <md-menu-item @click="logout">
                    <i class="material-icons">exit_to_app</i>
                    Logout
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
            </div>
          </md-list>
        </div>
      </div>
    </div>
  </md-toolbar>
</template>

<script>
export default {
  data() {
    return {
      region: localStorage.getItem("region") || "", // load region once
      selectedEmployee: null,
      employees: []
    };
  },
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("region");
      localStorage.removeItem("region_id");
      window.location.href = "/login"; // or use router.push
    }
  }
};
</script>


<style scoped>  
.dropdown-menu {
  display: block;
  min-width: 150px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
}

.dropdown-menu li {
  list-style: none;
}

.dropdown-menu li a,
.dropdown-menu li router-link {
  display: block;
  padding: 8px 12px;
  color: #333;
  text-decoration: none;
}

.dropdown-menu li a:hover {
  background: #eee;
}
.profile-trigger {
  cursor: pointer; /* show pointer on hover */
}

.profile-trigger:hover {
  background-color: rgba(0,0,0,0.1); /* subtle hover effect */
  border-radius: 4px;
}

</style>
