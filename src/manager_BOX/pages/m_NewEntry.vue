<script setup>

import { user_fields } from "../../services/api";
import { ref, onMounted } from "vue";

import { manager_create_user } from "../../services/api"; // Ensure this is imported


import EditProfileForm from "../box/EditProfileForm.vue";
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue";

 
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

  const optionalFields = ["middle_name", "maiden_name"];
  const emptyErrors = {};

  // Check for empty fields
  if (formData instanceof FormData) {
    for (const [key, value] of formData.entries()) {
      if (!optionalFields.includes(key) && (value === "" || value === null || value === undefined)) {
        emptyErrors[key] = ["This field can't be left blank"];
      }
    }
  } else {
    for (const key in formData) {
      if (!optionalFields.includes(key) && (formData[key] === "" || formData[key] === null || formData[key] === undefined)) {
        emptyErrors[key] = ["This field can't be left blank"];
      }
    }
  }

  if (Object.keys(emptyErrors).length > 0) {
    backendErrors.value = emptyErrors;
    return;
  }

  try {
    // Get region name and ID from localStorage
    const regionName = localStorage.getItem("region") || "";
    const regionId = localStorage.getItem("region_id");

    let payload;
    if (formData instanceof FormData) {
      payload = new FormData();
      for (const [key, value] of formData.entries()) {
        payload.append(key, value);
      }
      payload.set("region", regionName); // Backend expects region PK
    } else {
      payload = { ...formData, region: regionName }; // Backend expects region PK
    }

    console.log("Submitting payload:", payload instanceof FormData ? Object.fromEntries(payload) : payload);

    const res = await manager_create_user(payload);
    console.log("Response:", res.data);

    successMessage.value = "User created successfully";

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push("/manager/allusers");
    }, 2000);
  } catch (err) {
    console.error("Error in handleFormSubmit:", err, err.response?.data);
    if (err.response?.data) {
      const transformedErrors = {};
      for (const key in err.response.data) {
        const messages = Array.isArray(err.response.data[key])
          ? err.response.data[key]
          : [err.response.data[key]];
        transformedErrors[key] = messages.map((msg) => {
          if (typeof msg === "string" && msg.includes("Date has wrong format")) {
            return "This field can't be left blank";
          }
          return msg;
        });
      }
      backendErrors.value = transformedErrors;
    } else {
      backendErrors.value = { general: ["Failed to create user: " + err.message] };
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


