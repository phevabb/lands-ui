<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
      <h1 class="text-3xl font-bold text-green-600 mb-4">Password Changed</h1>
      <p class="text-gray-700 mb-6">
        Your password has been successfully changed.
      </p>
      <router-link
        to="/dashboard"
        class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
// This component is only for displaying the success message.
// No logic needed unless you want to auto-redirect after a delay.
</script>

<style scoped>
body {
  font-family: "Inter", sans-serif;
}
</style>
