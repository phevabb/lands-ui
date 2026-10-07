<template>
  <md-toolbar md-elevation="0" class="md-transparent">
    <div class="md-toolbar-row">
      <div >
        <!-- Prepend region before route name -->
        <h3 class="md-title">{{ region }} {{ $route.name }}</h3>
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
       localStorage.removeItem("user_id");
      

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
