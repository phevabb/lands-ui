import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App";

// Router setup
import routes from "./routes/routes";

// Vuetify
import vuetify from "./plugins/vuetify";

// Plugins
import GlobalComponents from "./globalComponents";
import GlobalDirectives from "./globalDirectives";
import Notifications from "./components/NotificationPlugin";

// Material Dashboard plugin
import MaterialDashboard from "./material-dashboard";

Vue.use(VueRouter);
Vue.use(MaterialDashboard);
Vue.use(GlobalComponents);
Vue.use(GlobalDirectives);
Vue.use(Notifications);

// Configure router
const router = new VueRouter({
  routes,
  linkExactActiveClass: "nav-item active",
  mode: "history"
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(
    record => record.meta.requiresAuth
  );

  const requiresSuperuser = to.matched.some(
    record => record.meta.requiresSuperuser
  );

  const allowedRoles = to.matched
    .filter(record => record.meta.allowedRoles)
    .reduce((roles, record) => {
      return roles.concat(record.meta.allowedRoles);
    }, []);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  let account = null;

  try {
    const storedAccount =
      localStorage.getItem("account") ||
      localStorage.getItem("user");

    account = storedAccount
      ? JSON.parse(storedAccount)
      : null;
  } catch (error) {
    console.error(
      "Unable to read account information",
      error
    );

    account = null;
  }

  if (requiresAuth && !token) {
    return next("/login");
  }

  if (requiresSuperuser) {
    const hasSuperuserAccess =
      account &&
      account.role === "Admin" &&
      account.isSuperuser === true;

    if (!hasSuperuserAccess) {
      return next("/login");
    }
  }

  if (allowedRoles.length > 0) {
    const hasAllowedRole =
      account &&
      allowedRoles.includes(account.role);

    if (!hasAllowedRole) {
      return next("/login");
    }
  }

  next();
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  vuetify,

  render: h => h(App)
});
