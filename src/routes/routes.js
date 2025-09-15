import DashboardLayout from "@/admin_BOX/pages/Layout/DashboardLayout.vue";

import Dashboard from "@/admin_BOX/pages/Dashboard.vue";
import UserProfile from "@/admin_BOX/pages/UserProfile.vue";
import TableList from "@/admin_BOX/pages/TableList.vue";
import Typography from "@/admin_BOX/pages/Typography.vue";
import Icons from "@/admin_BOX/pages/Icons.vue";
import Login from "@/registration/Login.vue";
import ChangePassword from "../registration/ChangePassword.vue";
import ChangePasswordComplete from "../registration/ChangePasswordComplete.vue";
import ResetPasswordSuccess from "../registration/ResetPasswordSuccess.vue";
import ResetPassword from "../registration/ResetPassword.vue";
import ResetPasswordDone from "../registration/ResetPasswordDone.vue";
import ResetPasswordConfirm from "../registration/ResetPasswordConfirm.vue"; 
import AllUsers from "../admin_BOX/pages/AllUsers.vue";
import NewEntry from "../admin_BOX/pages/NewEntry.vue";
import StaffDetails from "../admin_BOX/pages/StaffDetails.vue"; 
import StaffUpdate from "../admin_BOX/pages/StaffUpdate.vue"; 
import UserByUnit from "../admin_BOX/pages/UserByUnit.vue"; 
import m_DashboardLayout from "../manager_BOX/pages/Layout/m_DashboardLayout.vue";
import m_Dashboard from "../manager_BOX/pages/m_Dashboard.vue"
import m_UserByUnit from "../manager_BOX/pages/m_UserByUnit.vue"
import m_StaffDetails from "../manager_BOX/pages/m_StaffDetails.vue"

import m_StaffUpdate from "../manager_BOX/pages/m_StaffUpdate.vue"
import m_UserProfile from "../manager_BOX/pages/m_UserProfile.vue"
import m_NewEntry from "../manager_BOX/pages/m_NewEntry.vue"
import m_AllUsers from "../manager_BOX/pages/m_AllUsers.vue"
import m_ChangePassword from "../registration/ChangePassword.vue";




const routes = [
  {
  path: "/",
  redirect: "/login",
},
{
  path: "/password-reset-confirm/:uid/:token",
  name: "password-reset-confirm",
  component: ResetPasswordConfirm,
},

  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: ResetPassword,
  },
  
  {
    path: "/password-reset-success",
    name: "password-reset-success",
    component: ResetPasswordSuccess,
  },
  {
    path: "/change-password-complete",
    name: "change-password-complete",
    component: ChangePasswordComplete,
  },
  {
    path: "/password-reset-done",
    name: "password-reset-done",
    component: ResetPasswordDone,
  },
  {
    path: "/",
    component: DashboardLayout,
    children: [

      {
        path: "dashboard",
        name: "Admin Dashboard",
        component: Dashboard,
        meta: { requiresAuth: true }
      },

      {
        path: "users-per-department",
        name: "Staff Per Department",
        component: UserByUnit,
        meta: { requiresAuth: true }
      },

      {
        path: "staff-details/:id",
        name: "Staff Details",
        component: StaffDetails,
        meta: { requiresAuth: true }
      },

      {
        path: "staff-update/:id",
        name: "Staff Update",
        component: StaffUpdate,
        meta: { requiresAuth: true }
      },


      
      {
        path: "user",
        name: "User Profile",
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: "new-entry",
        name: "New Entry",
        component: NewEntry,
        meta: { requiresAuth: true }
      },
      {
        path: "table",
        name: "Table List",
        component: TableList,
        meta: { requiresAuth: true }
      },
      {
        path: "allusers",
        name: "All Users",
        component: AllUsers,
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
      {
        path: "change-password",
        name: "change-password",
        component: ChangePassword,
        meta: { requiresAuth: true }
      },
      
    ],

  },




  {
    path: "/manager/",
    component: m_DashboardLayout,
    children: [

      {
        path: "dashboard",
        name: " Manager Dashboard",
        component: m_Dashboard,
        meta: { requiresAuth: true }
      },

      {
        path: "users-per-department",
        name: "Staff Per Department In Region",
        component: m_UserByUnit,
        meta: { requiresAuth: true }
      },

      {
        path: "staff-details/:id",
        name: "Manager Staff Details",
        component: m_StaffDetails,
        meta: { requiresAuth: true }
      },

      {
        path: "staff-update/:id",
        name: "Manager Staff Update",
        component: m_StaffUpdate,
        meta: { requiresAuth: true }
      },

      

      
      {
        path: "user",
        name: "m_User Profile",
        component: m_UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: "new-entry",
        name: "New Entry",
        component: m_NewEntry,
        meta: { requiresAuth: true }
      },
      {
        path: "table",
        name: "m_Table List",
        component: TableList,
        meta: { requiresAuth: true }
      },
      {
        path: "allusers",
        name: "All Users",
        component: m_AllUsers,
        meta: { requiresAuth: true }
      },
      {
        path: "typography",
        name: "m_Typography",
        component: Typography,
        meta: { requiresAuth: true }
      },
      {
        path: "icons",
        name: "m_Icons",
        component: Icons,
        meta: { requiresAuth: true }
      },
      {
        path: "change-password",
        name: "change-password",
        component: m_ChangePassword,
        meta: { requiresAuth: true }
      },
      
    ],

  }


];

export default routes;
