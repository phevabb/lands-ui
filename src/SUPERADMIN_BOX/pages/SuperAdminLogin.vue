<template>
  <div class="superadmin-login-page">
    <div class="login-background-shape shape-one"></div>
    <div class="login-background-shape shape-two"></div>

    <main class="login-container">
      <section class="login-information-panel">
        <div class="brand">
          <div class="brand-icon">
            <md-icon>admin_panel_settings</md-icon>
          </div>

          <div class="brand-text">
            <span>HR MANAGEMENT SYSTEM</span>
            <strong>Super Admin Portal</strong>
          </div>
        </div>

        <div class="information-content">
          <span class="information-label">
            SECURE ADMINISTRATION
          </span>

          <h1>
            Manage the HR platform securely.
          </h1>

          <p>
            Sign in with an active Super Admin account to manage
            users, regional managers, reference data, and system
            settings.
          </p>

          <div class="security-message">
            <md-icon>verified_user</md-icon>

            <div>
              <strong>Restricted access</strong>

              <span>
                Only accounts granted Super Admin permission can
                access this portal.
              </span>
            </div>
          </div>
        </div>

        <div class="information-footer">
          <md-icon>lock</md-icon>

          <span>
            Protected using secure JWT authentication
          </span>
        </div>
      </section>

      <section class="login-form-panel">
        <div class="mobile-brand">
          <div class="brand-icon">
            <md-icon>admin_panel_settings</md-icon>
          </div>

          <div class="brand-text">
            <span>HR MANAGEMENT SYSTEM</span>
            <strong>Super Admin Portal</strong>
          </div>
        </div>

        <div class="form-heading">
          <span>WELCOME BACK</span>

          <h2>Super Admin Sign In</h2>

          <p>
            Enter your user ID and password to continue.
          </p>
        </div>

        <form
          novalidate
          @submit.prevent="login"
        >
          <div class="form-group">
            <label for="superadmin-user-id">
              User ID
            </label>

            <div
              class="input-control"
              :class="{
                invalid:
                  formSubmitted &&
                  userIdError
              }"
            >
              <md-icon>person_outline</md-icon>

              <input
                id="superadmin-user-id"
                ref="userIdInput"
                v-model.trim="form.userId"
                type="text"
                name="userId"
                autocomplete="username"
                placeholder="Enter your user ID"
                :disabled="submitting"
                @input="clearError"
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
            <div class="password-label-row">
              <label for="superadmin-password">
                Password
              </label>

              <router-link
                class="forgot-password-link"
                to="/forgot-password"
              >
                Forgot password?
              </router-link>
            </div>

            <div
              class="input-control"
              :class="{
                invalid:
                  formSubmitted &&
                  passwordError
              }"
            >
              <md-icon>lock_outline</md-icon>

              <input
                id="superadmin-password"
                ref="passwordInput"
                v-model="form.password"
                :type="
                  showPassword
                    ? 'text'
                    : 'password'
                "
                name="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                :disabled="submitting"
                @input="clearError"
              />

              <button
                type="button"
                class="password-toggle"
                :title="
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                "
                :disabled="submitting"
                @click="showPassword = !showPassword"
              >
                <md-icon>
                  {{
                    showPassword
                      ? "visibility_off"
                      : "visibility"
                  }}
                </md-icon>
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

          <div
            v-if="loginError"
            class="login-error"
          >
            <md-icon>error_outline</md-icon>

            <div>
              <strong>Sign in unsuccessful</strong>

              <span>{{ loginError }}</span>
            </div>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="submitting"
          >
            <span
              v-if="submitting"
              class="button-spinner"
            ></span>

            <md-icon v-else>
              login
            </md-icon>

            <span>
              {{
                submitting
                  ? "Signing in..."
                  : "Sign In"
              }}
            </span>
          </button>
        </form>

        <div class="access-notice">
          <md-icon>info_outline</md-icon>

          <span>
            Manager and Staff accounts cannot access the
            Super Admin portal.
          </span>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import axios from "axios";

// Production API
// const API_BASE_URL =
//   process.env.VUE_APP_API_BASE_URL ||
//   "https://api.example.com/api";

// Local/testing API
const API_BASE_URL =
  "http://127.0.0.1:8888/api";

function createEmptyForm() {
  return {
    userId: "",
    password: ""
  };
}

export default {
  name: "SuperAdminLogin",

  data() {
    return {
      form: createEmptyForm(),

      formSubmitted: false,
      submitting: false,
      showPassword: false,

      loginError: ""
    };
  },

  computed: {
    userIdError() {
      const userId =
        this.form.userId
          ? this.form.userId.trim()
          : "";

      if (!userId) {
        return "User ID is required.";
      }

      return "";
    },

    passwordError() {
      if (!this.form.password) {
        return "Password is required.";
      }

      return "";
    }
  },

  mounted() {
    this.clearExistingAuthentication();

    this.$nextTick(() => {
      if (this.$refs.userIdInput) {
        this.$refs.userIdInput.focus();
      }
    });
  },

  methods: {
    clearExistingAuthentication() {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access_token");

      localStorage.removeItem(
        "authenticatedUser"
      );

      localStorage.removeItem(
        "superAdminUser"
      );

      localStorage.removeItem(
        "user"
      );
    },

    clearError() {
      this.loginError = "";
    },

    validateForm() {
      this.loginError = "";

      if (this.userIdError) {
        this.loginError =
          this.userIdError;

        this.$nextTick(() => {
          if (this.$refs.userIdInput) {
            this.$refs.userIdInput.focus();
          }
        });

        return false;
      }

      if (this.passwordError) {
        this.loginError =
          this.passwordError;

        this.$nextTick(() => {
          if (this.$refs.passwordInput) {
            this.$refs.passwordInput.focus();
          }
        });

        return false;
      }

      return true;
    },

    async login() {
      this.formSubmitted = true;
      this.loginError = "";

      if (!this.validateForm()) {
        return;
      }

      this.submitting = true;

      const payload = {
        userId:
          this.form.userId.trim(),

        password:
          this.form.password
      };

      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/auth/login`,
            payload,
            {
              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json"
              }
            }
          );

        const responseData =
          response.data || {};

        const token =
          responseData.token || "";

        const user =
          responseData.user || null;

        if (!token) {
          throw new Error(
            "The server did not return an authentication token."
          );
        }

        if (!user) {
          throw new Error(
            "The server did not return the authenticated user."
          );
        }

        const isSuperuser =
          this.normalizeBoolean(
            user.isSuperuser
          );

        if (!isSuperuser) {
          this.clearExistingAuthentication();

          this.loginError =
            "Access denied. Only Super Admin accounts can sign in to this portal.";

          this.form.password = "";

          this.$nextTick(() => {
            if (this.$refs.passwordInput) {
              this.$refs.passwordInput.focus();
            }
          });

          return;
        }

        if (
          !this.normalizeBoolean(
            user.isActive,
            true
          )
        ) {
          this.clearExistingAuthentication();

          this.loginError =
            "This account is inactive. Please contact the system administrator.";

          this.form.password = "";

          return;
        }

        const authenticatedUser = {
          ...user,

          isActive:
            this.normalizeBoolean(
              user.isActive,
              true
            ),

          isStaff:
            this.normalizeBoolean(
              user.isStaff,
              false
            ),

          isSuperuser:
            isSuperuser
        };

        localStorage.setItem(
          "accessToken",
          token
        );

        /*
         * Kept for compatibility with components
         * that currently read "token".
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
            authenticatedUser
          )
        );

        localStorage.setItem(
          "superAdminUser",
          JSON.stringify(
            authenticatedUser
          )
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            authenticatedUser
          )
        );

        await this.redirectToPortal();
      } catch (error) {
        this.clearExistingAuthentication();

        this.loginError =
          this.getLoginErrorMessage(
            error
          );

        this.form.password = "";

        this.$nextTick(() => {
          if (this.$refs.passwordInput) {
            this.$refs.passwordInput.focus();
          }
        });

        console.error(
          "Super Admin login failed:",
          error.response?.status,
          error.response?.data,
          error
        );
      } finally {
        this.submitting = false;
      }
    },

    async redirectToPortal() {
      const redirectPath =
        this.$route.query.redirect;

      const safeRedirectPath =
        typeof redirectPath ===
          "string" &&
        redirectPath.startsWith(
          "/superadmin"
        )
          ? redirectPath
          : "/superadmin/allusers";

      try {
        await this.$router.replace(
          safeRedirectPath
        );
      } catch (error) {
        if (
          !error ||
          error.name !==
            "NavigationDuplicated"
        ) {
          console.error(
            "Portal redirect failed:",
            error
          );
        }
      }
    },

    normalizeBoolean(
      value,
      fallback = false
    ) {
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
    },

    getLoginErrorMessage(error) {
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
        return "Unable to connect to the HR backend. Please check your connection and try again.";
      }

      const responseData =
        error.response.data;

      const status =
        error.response.status;

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
        return "The login information could not be processed.";
      }

      if (status === 401) {
        return "Invalid user ID or password.";
      }

      if (status === 403) {
        return "This account is not permitted to access the Super Admin portal.";
      }

      if (status === 404) {
        return "The authentication endpoint was not found.";
      }

      if (status === 429) {
        return "Too many sign-in attempts. Please wait and try again.";
      }

      if (status >= 500) {
        return "The server could not complete the sign-in request.";
      }

      return "Unable to sign in. Please try again.";
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.superadmin-login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 32px;
  color: #1f2937;
  background:
    radial-gradient(
      circle at 15% 15%,
      rgba(79, 70, 229, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 85% 85%,
      rgba(37, 99, 235, 0.12),
      transparent 30%
    ),
    #f1f5f9;
}

.login-background-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.shape-one {
  top: -160px;
  right: -120px;
  width: 430px;
  height: 430px;
  border: 65px solid rgba(67, 56, 202, 0.055);
}

.shape-two {
  bottom: -180px;
  left: -145px;
  width: 480px;
  height: 480px;
  border: 75px solid rgba(37, 99, 235, 0.045);
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1040px;
  min-height: 630px;
  display: grid;
  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(0, 0.95fr);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 26px;
  background: #ffffff;
  box-shadow:
    0 35px 90px rgba(15, 23, 42, 0.18),
    0 12px 30px rgba(15, 23, 42, 0.08);
}

.login-information-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 46px;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(255, 255, 255, 0.16),
      transparent 27%
    ),
    linear-gradient(
      145deg,
      #312e81 0%,
      #3730a3 45%,
      #4338ca 100%
    );
}

.login-information-panel::after {
  content: "";
  position: absolute;
  right: -115px;
  bottom: -115px;
  width: 320px;
  height: 320px;
  border: 48px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.brand,
.mobile-brand {
  display: flex;
  align-items: center;
}

.brand {
  position: relative;
  z-index: 2;
}

.brand-icon {
  width: 55px;
  height: 55px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
}

.brand-icon .md-icon {
  color: #ffffff !important;
  font-size: 30px !important;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text span {
  color: rgba(255, 255, 255, 0.73);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-text strong {
  margin-top: 3px;
  color: #ffffff;
  font-size: 19px;
  font-weight: 800;
}

.information-content {
  position: relative;
  z-index: 2;
  margin: auto 0;
}

.information-label {
  display: block;
  margin-bottom: 13px;
  color: #c7d2fe;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.information-content h1 {
  max-width: 470px;
  margin: 0;
  color: #ffffff;
  font-size: 39px;
  font-weight: 800;
  line-height: 1.18;
}

.information-content > p {
  max-width: 470px;
  margin: 19px 0 0;
  color: rgba(255, 255, 255, 0.79);
  font-size: 17px;
  line-height: 1.7;
}

.security-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 32px;
  padding: 17px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
}

.security-message .md-icon {
  flex-shrink: 0;
  color: #c7d2fe !important;
  font-size: 25px !important;
}

.security-message div {
  display: flex;
  flex-direction: column;
}

.security-message strong {
  color: #ffffff;
  font-size: 16px;
}

.security-message span {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 15px;
  line-height: 1.5;
}

.information-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 14px;
}

.information-footer .md-icon {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 19px !important;
}

.login-form-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 52px;
  background: #ffffff;
}

.mobile-brand {
  display: none;
}

.form-heading {
  margin-bottom: 34px;
}

.form-heading > span {
  display: block;
  margin-bottom: 8px;
  color: #4338ca;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.form-heading h2 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.25;
}

.form-heading p {
  margin: 9px 0 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 21px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
}

.password-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.password-label-row label {
  margin-bottom: 8px;
}

.forgot-password-link {
  margin-bottom: 8px;
  color: #4338ca;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.input-control {
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #d5dce7;
  border-radius: 12px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-control:focus-within {
  border-color: #4338ca;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.1);
}

.input-control.invalid {
  border-color: #dc2626;
  background: #fef2f2;
}

.input-control > .md-icon {
  flex-shrink: 0;
  color: #94a3b8 !important;
  font-size: 23px !important;
}

.input-control input {
  min-width: 0;
  height: 100%;
  flex: 1;
  margin-left: 10px;
  padding: 0;
  color: #1f2937;
  font-size: 16px;
  border: 0;
  outline: none;
  background: transparent;
}

.input-control input::placeholder {
  color: #94a3b8;
}

.input-control input:disabled {
  cursor: not-allowed;
}

.password-toggle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  border: 0;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
}

.password-toggle:hover:not(:disabled) {
  color: #4338ca;
  background: #eef2ff;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.password-toggle .md-icon {
  color: inherit !important;
  font-size: 22px !important;
}

.field-error {
  display: block;
  margin-top: 7px;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.4;
}

.login-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  padding: 14px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.login-error > .md-icon {
  flex-shrink: 0;
  color: #dc2626 !important;
  font-size: 23px !important;
}

.login-error div {
  display: flex;
  flex-direction: column;
}

.login-error strong {
  font-size: 15px;
  font-weight: 800;
}

.login-error span {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.login-button {
  width: 100%;
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    #3730a3,
    #4338ca
  );
  box-shadow: 0 10px 22px rgba(67, 56, 202, 0.24);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 27px rgba(67, 56, 202, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.login-button .md-icon {
  color: #ffffff !important;
  font-size: 22px !important;
}

.button-spinner {
  width: 20px;
  height: 20px;
  display: inline-block;
  border: 3px solid rgba(255, 255, 255, 0.38);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.access-notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 25px;
  padding: 13px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #f8fafc;
}

.access-notice .md-icon {
  flex-shrink: 0;
  color: #4338ca !important;
  font-size: 21px !important;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .superadmin-login-page {
    align-items: flex-start;
    padding: 24px;
  }

  .login-container {
    max-width: 560px;
    min-height: 0;
    display: block;
  }

  .login-information-panel {
    display: none;
  }

  .login-form-panel {
    min-height: 640px;
    padding: 43px;
  }

  .mobile-brand {
    display: flex;
    margin-bottom: 45px;
  }

  .mobile-brand .brand-icon {
    border-color: #c7d2fe;
    background: #4338ca;
  }

  .mobile-brand .brand-text span {
    color: #64748b;
  }

  .mobile-brand .brand-text strong {
    color: #1f2937;
  }
}

@media (max-width: 575px) {
  .superadmin-login-page {
    min-height: 100svh;
    padding: 0;
    background: #ffffff;
  }

  .login-container {
    width: 100%;
    max-width: none;
    min-height: 100svh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .login-form-panel {
    min-height: 100svh;
    justify-content: flex-start;
    padding: 30px 20px;
  }

  .mobile-brand {
    margin-bottom: 45px;
  }

  .mobile-brand .brand-icon {
    width: 49px;
    height: 49px;
  }

  .brand-text span {
    font-size: 11px;
  }

  .brand-text strong {
    font-size: 17px;
  }

  .form-heading h2 {
    font-size: 26px;
  }

  .password-label-row {
    align-items: flex-end;
  }
}
</style>