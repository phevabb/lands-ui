import DashboardLayout from "@/admin_BOX/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/admin_BOX/pages/Dashboard.vue";
import UserProfile from "@/admin_BOX/pages/UserProfile.vue";
import TableList from "@/admin_BOX/pages/TableList.vue";
import Typography from "@/admin_BOX/pages/Typography.vue";
import Icons from "@/admin_BOX/pages/Icons.vue";
import Maps from "@/admin_BOX/pages/Maps.vue";
import Notifications from "@/admin_BOX/pages/Notifications.vue";
import UpgradeToPRO from "@/admin_BOX/pages/UpgradeToPRO.vue";
import Login from "@/registration/Login.vue";

const routes = [
  {
    path: "/",
    redirect: "/login"
  },

  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    component: DashboardLayout,
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: "user",
        name: "User Profile",
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: "table",
        name: "Table List",
        component: TableList,
        meta: { requiresAuth: true }
      },
      {
        path: "typography",
        name: "Typography",
        component: Typography,
        meta: { requiresAuth: true }
      },
      {
        path: "icons",
        name: "Icons",
        component: Icons,
        meta: { requiresAuth: true }
      },
      
    ],

  }

];

export default routes;
