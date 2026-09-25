<template>
  <div class="login-wrapper">
    <div class="login-left">
      <div class="login-hero-content">
        <h1 class="hero-title"></h1>
        <p class="hero-subtitle"></p>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <img
            src="@/assets/img/landss2.jpg"
            alt="Office of the Administrator of Stool Lands"
            class="login-logo"
          />
          <h2 class="login-title">Staff Login</h2>
          <p class="login-subtitle">Enter your credentials to access your account.</p>
        </div>

<div
  v-for="(message, index) in messages"
  :key="index"
  class="alert-message"
  role="alert"
>
  <p>{{ message }}</p>

  <button
    type="button"
    class="close-alert"
    aria-label="Close message"
    @click="closeAlert(index)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-x"
    >
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
      ></line>

      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
      ></line>
    </svg>
  </button>
</div>
       <form
  class="login-form"
  novalidate
  @submit.prevent="handleLogin"
>


          <div class="form-group">
  <label for="department">
    Choose Portal
  </label>

  <div class="input-wrapper select-wrapper">
    <select
      id="department"
      v-model="form.selectedRole"
      :disabled="loading"
      @change="clearMessages"
    >
      <option
        value=""
        disabled
      >
        Select Portal
      </option>

      <option
        v-for="department in departments"
        :key="department.id"
        :value="department.name"
      >
        {{ department.name }}
      </option>
    </select>

    <span class="dropdown-icon">
      ▼
    </span>
  </div>

  <span
    v-if="
      formSubmitted &&
      selectedRoleError
    "
    class="field-error"
  >
    {{ selectedRoleError }}
  </span>
</div>

       <div class="form-group">
  <label for="userID">
    Staff ID
  </label>

  <div class="input-wrapper">
    <input
      id="userID"
      v-model.trim="form.userId"
      type="text"
      name="userId"
      autocomplete="username"
      placeholder="Enter your staff ID"
      :disabled="loading"
      @input="clearMessages"
    />
  </div>

  <span
    v-if="
      formSubmitted &&
      userIdError
    "
    class="field-error"
  >
    {{ userIdError }}
  </span>
</div>

         <div class="form-group">
  <label for="password">
    Password
  </label>

  <div class="input-wrapper password-input-group">
    <input
      id="password"
      v-model="form.password"
      :type="
        showPassword
          ? 'text'
          : 'password'
      "
      name="password"
      autocomplete="current-password"
      placeholder="Enter your password"
      :disabled="loading"
      @input="clearMessages"
    />

    <button
      type="button"
      class="toggle-password"
      :disabled="loading"
      @click="togglePassword"
    >
      <i
        :class="
          showPassword
            ? 'mdi mdi-eye-off'
            : 'mdi mdi-eye'
        "
      ></i>
    </button>
  </div>

  <span
    v-if="
      formSubmitted &&
      passwordError
    "
    class="field-error"
  >
    {{ passwordError }}
  </span>
</div>
         <!-- Loading spinner OR button -->
      <md-progress-bar
  v-if="loading"
  md-mode="indeterminate"
></md-progress-bar>

<button
  v-else
  type="submit"
  class="login-btn"
>
  Log in
</button>

          <div class="forgot-password">
            <router-link to="/reset-password">Forgot password?</router-link>
          </div>
        </form>


      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref
} from "vue";

import {
  useRoute,
  useRouter
} from "vue-router/composables";

import {
  login
} from "@/services/api";

const router =
  useRouter();

const route =
  useRoute();

const loading =
  ref(false);

const showPassword =
  ref(false);

const formSubmitted =
  ref(false);

const messages =
  ref([]);

const form =
  reactive({
    selectedRole: "",
    userId: "",
    password: ""
  });

const departments =
  ref([
    {
      id: 1,
      name: "Admin"
    },
    {
      id: 2,
      name: "Manager"
    },
    {
      id: 3,
      name: "Staff"
    }
  ]);

const selectedRoleError =
  computed(() => {
    if (!form.selectedRole) {
      return "Choose the portal you want to access.";
    }

    return "";
  });

const userIdError =
  computed(() => {
    const userId =
      form.userId
        ? form.userId.trim()
        : "";

    if (!userId) {
      return "Staff ID is required.";
    }

    return "";
  });

const passwordError =
  computed(() => {
    if (!form.password) {
      return "Password is required.";
    }

    return "";
  });

onMounted(() => {
  clearExistingAuthentication();
});

const insertMessage =
  message => {
    if (!message) {
      return;
    }

    messages.value = [
      message
    ];
  };

const closeAlert =
  index => {
    messages.value.splice(
      index,
      1
    );
  };

const clearMessages =
  () => {
    messages.value = [];
  };

const togglePassword =
  () => {
    showPassword.value =
      !showPassword.value;
  };

const normalizeBoolean =
  (
    value,
    fallback = false
  ) => {
    if (
      typeof value ===
      "boolean"
    ) {
      return value;
    }

    if (
      value === 1 ||
      value === "1" ||
      value === "true"
    ) {
      return true;
    }

    if (
      value === 0 ||
      value === "0" ||
      value === "false"
    ) {
      return false;
    }

    return fallback;
  };

const normalizeRole =
  role => {
    return role
      ? String(role)
          .trim()
          .toLowerCase()
      : "";
  };

const clearExistingAuthentication =
  () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "tokenType"
    );

    localStorage.removeItem(
      "tokenExpiresAt"
    );

    localStorage.removeItem(
      "authenticatedUser"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "region"
    );

    localStorage.removeItem(
      "region_id"
    );

    localStorage.removeItem(
      "regionName"
    );

    localStorage.removeItem(
      "regionId"
    );

    localStorage.removeItem(
      "isSuperuser"
    );
  };

const validateForm =
  () => {
    clearMessages();

    if (
      selectedRoleError.value
    ) {
      insertMessage(
        selectedRoleError.value
      );

      return false;
    }

    if (userIdError.value) {
      insertMessage(
        userIdError.value
      );

      return false;
    }

    if (passwordError.value) {
      insertMessage(
        passwordError.value
      );

      return false;
    }

    return true;
  };

const validateSelectedPortal =
  user => {
    const selectedRole =
      normalizeRole(
        form.selectedRole
      );

    const authenticatedRole =
      normalizeRole(
        user.role
      );

    if (
      selectedRole !==
      authenticatedRole
    ) {
      const actualRole =
        user.role ||
        "Unknown";

      insertMessage(
        `Role Mismatch`
      );

      return false;
    }

    return true;
  };

const saveAuthentication =
  responseData => {
    const token =
      responseData.token;

    const user =
      responseData.user;

    const normalizedUser = {
      ...user,

      id:
        Number(user.id),

      userId:
        user.userId || "",

      fullName:
        user.fullName || "",

      displayName:
        user.displayName ||
        user.fullName ||
        user.userId ||
        "",

      role:
        user.role || "",

      isActive:
        normalizeBoolean(
          user.isActive,
          true
        ),

      isStaff:
        normalizeBoolean(
          user.isStaff,
          false
        ),

      isSuperuser:
        normalizeBoolean(
          user.isSuperuser,
          false
        ),

      regionId:
        user.regionId !== null &&
        user.regionId !== undefined
          ? Number(
              user.regionId
            )
          : null,

      regionName:
        user.regionName || ""
    };

    localStorage.setItem(
      "accessToken",
      token
    );

    /*
     * Keep "token" temporarily for existing
     * components that read this key.
     */
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "tokenType",
      responseData.tokenType ||
        "Bearer"
    );

    localStorage.setItem(
      "tokenExpiresAt",
      responseData.expiresAt ||
        ""
    );

    localStorage.setItem(
      "authenticatedUser",
      JSON.stringify(
        normalizedUser
      )
    );

    localStorage.setItem(
      "user",
      normalizedUser.fullName
    );

    localStorage.setItem(
      "user_id",
      String(
        normalizedUser.id
      )
    );

    localStorage.setItem(
      "userId",
      normalizedUser.userId
    );

    localStorage.setItem(
      "role",
      normalizedUser.role
    );

    localStorage.setItem(
      "isSuperuser",
      String(
        normalizedUser.isSuperuser
      )
    );

    localStorage.setItem(
      "region",
      normalizedUser.regionName
    );

    localStorage.setItem(
      "regionName",
      normalizedUser.regionName
    );

    localStorage.setItem(
      "region_id",
      normalizedUser.regionId !==
        null
        ? String(
            normalizedUser.regionId
          )
        : ""
    );

    localStorage.setItem(
      "regionId",
      normalizedUser.regionId !==
        null
        ? String(
            normalizedUser.regionId
          )
        : ""
    );

    return normalizedUser;
  };

const redirectAuthenticatedUser =
  async user => {
    const normalizedRole =
      normalizeRole(
        user.role
      );

    const requestedRedirect =
      route.query &&
      typeof route.query.redirect ===
        "string"
        ? route.query.redirect
        : "";

    if (
      normalizedRole ===
      "admin"
    ) {
      const destination =
        requestedRedirect.startsWith(
          "/dashboard"
        )
          ? requestedRedirect
          : "/dashboard";

      await router.push({
        path: destination
      });

      return;
    }

    if (
      normalizedRole ===
      "manager"
    ) {
      const destination =
        requestedRedirect.startsWith(
          "/manager/"
        )
          ? requestedRedirect
          : "/manager/dashboard";

      await router.push({
        path: destination
      });

      return;
    }

    if (
      normalizedRole ===
      "staff"
    ) {
      const destination =
        `/staff/staff-details/${user.id}`;

      await router.push({
        path: destination
      });

      return;
    }

    throw new Error(
      "This account does not have a supported portal role."
    );
  };

const handleLogin =
  async () => {
    formSubmitted.value = true;

    if (!validateForm()) {
      return;
    }

    loading.value = true;
    clearMessages();
    clearExistingAuthentication();

    const payload = {
      userId:
        form.userId.trim(),

      password:
        form.password
    };

    try {
      const response =
        await login(payload);

      const responseData =
        response.data || {};

      const token =
        responseData.token;

      const user =
        responseData.user;

      if (!token) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      if (!user) {
        throw new Error(
          "The server did not return the authenticated account."
        );
      }

      if (
        !normalizeBoolean(
          user.isActive,
          true
        )
      ) {
        insertMessage(
          "This account is inactive. Please contact an administrator."
        );

        form.password = "";

        return;
      }

      if (
        !validateSelectedPortal(
          user
        )
      ) {
        form.password = "";

        return;
      }

      /*
       * This is the normal Admin, Manager,
       * and Staff portal.
       *
       * Superusers should use the dedicated
       * Super Admin login page.
       */
      if (
        normalizeBoolean(
          user.isSuperuser,
          false
        )
      ) {
        insertMessage(
          "This is a Super Admin account. Please use the Super Admin portal."
        );

        form.password = "";

        return;
      }

      const authenticatedUser =
        saveAuthentication(
          responseData
        );

      await redirectAuthenticatedUser(
        authenticatedUser
      );
    } catch (error) {
      clearExistingAuthentication();

      form.password = "";

      insertMessage(
        getLoginErrorMessage(
          error
        )
      );

      console.error(
        "Portal login failed:",
        error.response?.status,
        error.response?.data,
        error
      );
    } finally {
      loading.value = false;
    }
  };

const getLoginErrorMessage =
  error => {
    if (
      error instanceof Error &&
      !error.response &&
      error.message &&
      error.message !==
        "Network Error"
    ) {
      return error.message;
    }

    if (!error.response) {
      return "Unable to connect to the HR backend. Please check the connection and try again.";
    }

    const status =
      error.response.status;

    const responseData =
      error.response.data;

    if (
      typeof responseData ===
        "string" &&
      responseData.trim()
    ) {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData.detail ===
        "string"
    ) {
      return responseData.detail;
    }

    if (
      responseData &&
      typeof responseData.error ===
        "string"
    ) {
      return responseData.error;
    }

    if (
      responseData &&
      typeof responseData.message ===
        "string"
    ) {
      return responseData.message;
    }

    if (status === 400) {
      return "The login request could not be processed.";
    }

    if (status === 401) {
      return "Invalid staff ID or password.";
    }

    if (status === 403) {
      return "This account is inactive or is not permitted to access the selected portal.";
    }

    if (status === 404) {
      return "The authentication endpoint was not found.";
    }

    if (status === 429) {
      return "Too many login attempts. Please wait and try again.";
    }

    if (status >= 500) {
      return "The server could not complete the login request.";
    }

    return "Unable to log in. Please try again.";
  };
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css');

:root {
  --primary-color: #007bff;
  --primary-dark: #0056b3;
  --bg-dark: #1a202c;
  --bg-light: #f5f7fa;
  --card-bg: #ffffff;
  --text-dark: #2d3748;
  --text-light: #a0aec0;
  --border-color: #e2e8f0;
  --shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

body {
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-light);
}

.login-left {
  flex: 1;
  background-image: url('@/assets/img/landss2.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4rem;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.login-hero-content {
  color: #fff;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  opacity: 0.8;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: var(--card-bg);
  border-radius: 1.5rem;
  padding: 3rem 2.5rem;
  box-shadow: var(--shadow);
  transform: translateY(-20px);
  opacity: 0;
  animation: fadeInDown 0.8s ease-out forwards;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  height: 60px;
  margin-bottom: 1rem;
  border-radius: 50%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 1rem;
  color: var(--text-light);
}

.login-form .form-group {
  margin-bottom: 1.5rem;
}

.login-form label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--text-dark);
  transition: all var(--transition-speed) ease;
  background: #fcfcfc;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.password-input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.password-input-group input {
  flex-grow: 1;
}

.toggle-password {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 0.5rem;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  transition: color var(--transition-speed);
}

.toggle-password:hover {
  color: var(--primary-color);
}

.login-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 8px 15px rgba(0, 123, 255, 0.2);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 123, 255, 0.3);
}

.forgot-password {
  text-align: center;
  margin-top: 1.5rem;
}

.forgot-password a {
  font-size: 0.9rem;
  color: var(--text-light);
  text-decoration: none;
  transition: color var(--transition-speed);
}

.forgot-password a:hover {
  color: var(--primary-color);
}

.alert-message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  background-color: #ffe5e5;
  color: #c90000;
  border: 1px solid #ffd1d1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideInFromTop 0.5s ease-out;
}

.close-alert {
  background: none;
  border: none;
  cursor: pointer;
  color: #c90000;
  transition: transform var(--transition-speed);
}

.close-alert:hover {
  transform: rotate(90deg);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .login-left {
    display: none;
  }
  .login-right {
    flex: none;
    width: 100%;
    padding: 2rem 1rem;
  }
}
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-wrapper select {
  width: 100%;
  padding-right: 30px; /* space for icon */
  appearance: none; /* hide default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
}

.select-wrapper .dropdown-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* so clicks go to select */
  color: black; /* black icon */
  font-size: 14px;
}


</style>