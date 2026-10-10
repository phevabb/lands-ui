<template>
  <div class="main-container">
    <div class="card">
      <!-- Success Icon -->
      <div class="success-icon">
        <i class="fas fa-check"></i>
      </div>

      <!-- Title -->
      <h1 class="title">
        Reset your password
      </h1>

      <!-- Primary Message -->
      <p class="message">
        We've emailed you instructions for resetting your password.
      </p>

      <!-- Secondary Message -->
      <p class="message">
        If you don't receive an email, make sure you entered the
        address you registered with and check your spam folder.
      </p>

      <!-- Countdown -->
      <p class="countdown">
        Redirecting to login in
        <strong>{{ seconds }}</strong>
        {{ seconds === 1 ? "second" : "seconds" }}...
      </p>

      <!-- Login Button -->
      <router-link
        to="/login"
        class="btn bbb"
      >
        <i class="fas fa-sign-in-alt"></i>
        Go to Login
      </router-link>

      <!-- Confetti Elements -->
      <div
        class="confetti"
        style="top: 30%; left: 20%;"
      ></div>

      <div
        class="confetti"
        style="top: 25%; left: 80%;"
      ></div>

      <div
        class="confetti"
        style="top: 40%; left: 40%;"
      ></div>

      <div
        class="confetti"
        style="top: 35%; left: 60%;"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResetPasswordDone",

  data() {
    return {
      seconds: 5,
      countdownInterval: null
    };
  },

  mounted() {
    this.countdownInterval = window.setInterval(() => {
      this.seconds -= 1;

      if (this.seconds <= 0) {
        this.clearCountdown();

        this.$router.push("/login").catch((error) => {
          if (error && error.name !== "NavigationDuplicated") {
            throw error;
          }
        });
      }
    }, 1000);
  },

  beforeDestroy() {
    this.clearCountdown();
  },

  methods: {
    clearCountdown() {
      if (this.countdownInterval !== null) {
        window.clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    }
  }
};
</script>



<style scoped>
/* GENERAL STYLES */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.main-container {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e2e3ec 0%, #d8d2df 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 40px;
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  z-index: 0;
}

.success-icon {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  animation: icon-animation 1s ease-out forwards;
}

.success-icon i {
  color: white;
  font-size: 36px;
  animation: checkmark-animation 0.5s ease-out 0.3s both;
}

.title {
  position: relative;
  z-index: 1;
  font-weight: 700;
  color: #1f2937;
  font-size: 28px;
  margin-bottom: 12px;
  text-align: center;
}

.message {
  position: relative;
  z-index: 1;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  text-align: center;
}

.countdown {
  position: relative;
  z-index: 1;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 24px;
  text-align: center;
}

.btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #e0e0e5 0%, #aea9b7 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
  text-decoration: none;
}
.bbb {
  background: linear-gradient(135deg, #e0e6e3 0%, #d2ddda 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
}

.btn:active {
  transform: translateY(0);
}

.btn i {
  margin-right: 10px;
}

.confetti {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  z-index: 2;
  animation: confetti 1.5s ease-out forwards;
  opacity: 0;
}

/* Specific confetti animations */
.confetti:nth-of-type(1) { animation-delay: 0.5s; }
.confetti:nth-of-type(2) { animation-delay: 0.7s; }
.confetti:nth-of-type(3) { animation-delay: 0.9s; }
.confetti:nth-of-type(4) { animation-delay: 1.1s; }

/* KEYFRAMES */
@keyframes icon-animation {
  0% { opacity: 0; transform: scale(0.8) translateY(-20px); }
  70% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes checkmark-animation {
  0% { opacity: 0; transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes confetti {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(100px) rotate(360deg);
  }
}
</style>
