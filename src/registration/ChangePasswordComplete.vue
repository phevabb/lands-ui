<template>
  <main class="success-page">
    <div
      class="decorative-orb orb-left"
      aria-hidden="true"
    ></div>

    <div
      class="decorative-orb orb-right"
      aria-hidden="true"
    ></div>

    <section
      class="success-card"
      aria-labelledby="success-title"
    >
      <div class="success-icon-wrapper">
        <div class="success-icon-ring">
          <i
            class="fas fa-check"
            aria-hidden="true"
          ></i>
        </div>
      </div>

      <div class="status-badge">
        <span class="status-dot"></span>
        Password updated successfully
      </div>

      <h1
        id="success-title"
        class="success-title"
      >
        Your password has been changed
      </h1>

      <p class="success-description">
        Your account is now protected with your new password.
        Please use it the next time you sign in.
      </p>

      <div class="security-note">
        <div class="security-note-icon">
          <i
            class="fas fa-shield-alt"
            aria-hidden="true"
          ></i>
        </div>

        <div class="security-note-content">
          <strong>Security confirmation</strong>

          <span>
            All existing password reset links for this account
            are no longer valid.
          </span>
        </div>
      </div>

      <router-link
        to="/login"
        class="login-button"
        style="color: white;"
        aria-label="Continue to the login page"
      >
        <span>Continue to Login</span>

        <i
          class="fas fa-arrow-right"
          aria-hidden="true"
        ></i>
      </router-link>

      <p class="footer-message">
        <i
          class="fas fa-lock"
          aria-hidden="true"
        ></i>

        Your account security is important to us.
      </p>
    </section>
  </main>
</template>

<script setup>
// This page displays confirmation after a successful password change.
</script>

<style scoped>
.success-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 32px 20px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(99, 102, 241, 0.16),
      transparent 34%
    ),
    radial-gradient(
      circle at 90% 90%,
      rgba(16, 185, 129, 0.14),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #f8fafc 0%,
      #eef2ff 46%,
      #f0fdf4 100%
    );
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.success-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 540px;
  padding: 52px 44px 38px;
  overflow: hidden;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.96);
  border-radius: 28px;
  box-shadow:
    0 32px 80px rgba(15, 23, 42, 0.13),
    0 8px 25px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(20px);
  animation: card-entry 0.65s ease-out both;
}

.success-card::before {
  position: absolute;
  top: 0;
  left: 12%;
  width: 76%;
  height: 4px;
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    #4f46e5,
    #10b981,
    transparent
  );
  border-radius: 0 0 999px 999px;
}

.success-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  color: #ffffff;
  font-size: 36px;
  background: linear-gradient(
    145deg,
    #10b981,
    #059669
  );
  border: 8px solid #d1fae5;
  border-radius: 50%;
  box-shadow:
    0 16px 35px rgba(16, 185, 129, 0.28),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  animation: icon-entry 0.7s 0.2s ease-out both;
}

.success-icon-ring::after {
  position: absolute;
  inset: -15px;
  content: "";
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 50%;
  animation: confirmation-pulse 2.4s ease-out infinite;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 7px 13px;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 999px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.13);
}

.success-title {
  max-width: 440px;
  margin: 0 auto 16px;
  color: #0f172a;
  font-size: clamp(29px, 5vw, 38px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.success-description {
  max-width: 430px;
  margin: 0 auto;
  color: #64748b;
  font-size: 16px;
  line-height: 1.75;
}

.security-note {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin: 30px 0;
  padding: 17px;
  text-align: left;
  background: linear-gradient(
    135deg,
    #f8fafc,
    #f1f5f9
  );
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.security-note-icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #4f46e5;
  background: #e0e7ff;
  border-radius: 12px;
}

.security-note-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-note-content strong {
  color: #1e293b;
  font-size: 14px;
}

.security-note-content span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 54px;
  padding: 14px 24px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  background: linear-gradient(
    135deg,
    #4f46e5,
    #4338ca
  );
  border-radius: 14px;
  box-shadow:
    0 12px 26px rgba(79, 70, 229, 0.27),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}.login-button:hover {
  color: #ffffff !important;
  text-decoration: none;

  background: linear-gradient(
    135deg,
    #4338ca,
    #3730a3
  );

  box-shadow:
    0 16px 32px rgba(79, 70, 229, 0.34),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);

  transform: translateY(-2px);
}

/* Keep all text and icons white on hover */
.login-button:hover,
.login-button:hover span,
.login-button:hover i,
.login-button:hover svg {
  color: #ffffff !important;
}

/* Prevent the button text from being underlined */
.login-button:hover,
.login-button:hover span {
  text-decoration: none !important;
}

.login-button:active {
  color: #ffffff !important;
  transform: translateY(0);
}

.login-button:focus,
.login-button:focus-visible {
  color: #ffffff !important;
}

.login-button:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.3);
  outline-offset: 4px;
}

.login-button i {
  font-size: 14px;
  transition: transform 0.22s ease;
}

.login-button:hover i {
  color: #ffffff !important;
  transform: translateX(4px);
}

.footer-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 22px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.footer-message i {
  color: #64748b;
}

.decorative-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.orb-left {
  top: 14%;
  left: 7%;
  width: 180px;
  height: 180px;
  background: rgba(99, 102, 241, 0.1);
  animation: floating-orb 7s ease-in-out infinite;
}

.orb-right {
  right: 8%;
  bottom: 10%;
  width: 230px;
  height: 230px;
  background: rgba(16, 185, 129, 0.09);
  animation: floating-orb 8s 1s ease-in-out infinite;
}

@keyframes card-entry {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes icon-entry {
  0% {
    opacity: 0;
    transform: scale(0.55) rotate(-18deg);
  }

  65% {
    opacity: 1;
    transform: scale(1.08) rotate(3deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes confirmation-pulse {
  0% {
    opacity: 0.7;
    transform: scale(0.8);
  }

  75%,
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

@keyframes floating-orb {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-18px);
  }
}

@media (max-width: 600px) {
  .success-page {
    padding: 20px 14px;
  }

  .success-card {
    padding: 42px 22px 30px;
    border-radius: 22px;
  }

  .success-icon-ring {
    width: 82px;
    height: 82px;
    font-size: 31px;
  }

  .success-description {
    font-size: 15px;
  }

  .security-note {
    padding: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .success-card,
  .success-icon-ring,
  .success-icon-ring::after,
  .decorative-orb {
    animation: none;
  }

  .login-button,
  .login-button i {
    transition: none;
  }
}
</style>