<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-medium-size-100 md-size-66">
        <EditProfileForm
          data-background-color="green"
          :title="formTitle"
          sub_title="Update Staff data"
          button_name="Update Staff"
          :backformdata="userFields"
          :formValues="userData"
          :backendErrors="backendErrors"
          :successMessage="successMessage"
          @submitForm="handleFormSubmit"
        />
      </div>
      <div class="md-layout-item md-medium-size-100 md-size-33">
        <UserCard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { user_fields, get_user_details, patch_user } from "../../services/api"
import { ref, onMounted, computed } from "vue"
import EditProfileForm from "@/admin_BOX/pages/UserProfile/EditProfileForm_update.vue"
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue"
import { useRouter, useRoute } from "vue-router/composables"

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// reactive states
const backendErrors = ref({})
const successMessage = ref("")
const userFields = ref([])
const userData = ref({})

// Fetch data
onMounted(async () => {
  try {
    // Fetch form fields
    const fieldsRes = await user_fields()
    userFields.value = Array.isArray(fieldsRes.data) ? fieldsRes.data : []

    // Fetch user details
    const userDetailsRes = await get_user_details(userId)
    userData.value = userDetailsRes.data || {}

  } catch (err) {

  }
})

// Handle form submit
const handleFormSubmit = async (formData) => {
  backendErrors.value = {}
  successMessage.value = ""

  try {

    const res = await patch_user(userId, formData)
    successMessage.value = "User updated successfully!"

    setTimeout(() => {
      router.push("/allusers")
    }, 1500)
  } catch (err) {
  
    if (err.response?.data) {
      backendErrors.value = err.response.data
    } else {
      backendErrors.value = { general: ["Failed to update user"] }
    }
  }
}

// Title
const formTitle = computed(() => {
  return userData.value?.full_name
    ? `Staff Update for ${userData.value.title || ""} ${userData.value.full_name}`
    : "Staff Update"
})
</script>
