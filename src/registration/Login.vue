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

        <div v-for="(msg, index) in messages" :key="index" class="alert-message" role="alert">
          <p>{{ msg }}</p>
          <button type="button" class="close-alert" @click="closeAlert(index)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
  <label for="department">Choose Department</label>
  <div class="input-wrapper select-wrapper">
    <select v-model="form.staff_department" id="department">
      <option value="" disabled selected>Select Department</option>
      <option v-for="dept in departments" :key="dept.id" :value="dept.name">
        {{ dept.name }}
      </option>
    </select>
    <!-- Dropdown arrow -->
    <span class="dropdown-icon">▼</span>
  </div>
</div>


          <div class="form-group">
            <label for="userID">Staff ID</label>
            <div class="input-wrapper">
              <input v-model="form.user_ID" type="text" id="userID" placeholder="ID" />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper password-input-group">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                placeholder="Password"
              />
              <button type="button" class="toggle-password" @click="togglePassword">
                <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
              </button>
            </div>
          </div>

         <!-- Loading spinner OR button -->
        <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>
        <button v-else type="submit" class="login-btn">Log in</button>


          <div class="forgot-password">
            <router-link to="/reset-password">Forgot password?</router-link>
          </div>
        </form>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {login} from '@/services/api'
const loading = ref(false)


const messages = ref([])
const insert_message = (msg) => {
  messages.value.push(msg)
}
const closeAlert = (index) => {
  messages.value.splice(index, 1)
}

const form = reactive({
  staff_department: '',
  user_ID: '',
  password: ''
})

const departments = ref([
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Staff' }
])

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  loading.value = true
  try{
    const {data} = await login(form)
 
    localStorage.setItem('token', data.token) // save token
    localStorage.setItem('user', data.user.full_name) // save user info

    const v = data.user.role
    const name = data.user.full_name
    


    if (data.user.role === "Admin") {
      window.location.href ='/dashboard'
    }
    else if(data.user.role === "Manager"){
      window.location.href ='/dashboard_manager'
    }

    else {window.location.href ='/dashboard_staff'}
  }catch (err) {
  const message =
    err?.response?.data?.non_field_errors?.[0] ||
    err?.response?.data?.staff_department?.[0] ||
    err?.response?.data?.user_ID?.[0] ||
    err?.response?.data?.password?.[0] ||
    'Please check your internet connection';

  insert_message(message);

}

 finally{
    loading.value = false
  }



}
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