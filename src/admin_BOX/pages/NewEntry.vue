<script setup>

import { user_fields } from "../../services/api";
import { ref, onMounted } from "vue";
import EditProfileForm from "@/admin_BOX/pages/UserProfile/EditProfileForm.vue";
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue";
import { create_user } from "../../services/api";
 
import { useRouter } from "vue-router/composables";

const router = useRouter()



// define reactive error and success messages
const backendErrors = ref({});
const successMessage = ref("");
const isLoading = ref(true);
const errorMessage = ref("");
const userFields = ref([])

onMounted(async () => {
  isLoading.value = true
  errorMessage.value =""
  try {
    const res = await user_fields()

   
    userFields.value = res.data
    
  } catch (err) {

     if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
    
  }
    finally {
    isLoading.value = false
  }
})

// function to check loading state
const checkLoading = () => isLoading.value


const handleFormSubmit = async (formData) => {
  backendErrors.value = {};
  successMessage.value = "";

  // Fields to skip blank validation
  const optionalFields = ["middle_name", "maiden_name"];

  // Check for empty fields before sending to backend
  const emptyErrors = {};
  for (const key in formData) {
    if (!optionalFields.includes(key)) {
      if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
        emptyErrors[key] = ["This field can't be left blank"];
      }
    }
  }

  // If there are empty fields, stop and show errors
  if (Object.keys(emptyErrors).length > 0) {
    backendErrors.value = emptyErrors;
    return;
  }

try {
    const res = await create_user(formData);
    successMessage.value = "User created successfully!";

     // Redirect to /allusers after 2 seconds
    setTimeout(() => {
      router.push("/allusers");
    }, 2000);

  } catch (err) {
    if (err.response?.data) {
      const transformedErrors = {};
      for (const key in err.response.data) {
        const messages = err.response.data[key];
        transformedErrors[key] = messages.map((msg) => {
          if (msg.includes("Date has wrong format")) {
            return "This field can't be left blank";
          }
          return msg;
        });
      }
      backendErrors.value = transformedErrors;
    } else {
      backendErrors.value = { general: ["Failed to create user"] };
    }
  }
};


</script>

<template>
  <div class="content">
    <div class="md-layout">
      <!-- Show loader while fetching -->
  <div v-if="checkLoading()" class="loading-message">
  Loading Form Fields
</div>

<!-- Error message -->
      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else class="md-layout-item md-medium-size-100 md-size-66">
        <EditProfileForm
          data-background-color="green"
          title="New Entry"
          sub_title="Enter Staff data"
          button_name="Add Staff"
          :backformdata="userFields"
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

<style scoped>

.error-message {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
}
.loading-message {
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
  margin: 1rem 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}


</style>


