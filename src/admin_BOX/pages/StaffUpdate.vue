<script setup>
import { user_fields, get_user_details, put_user, patch_user } from "../../services/api";
import { ref, onMounted, computed } from "vue";
import EditProfileForm from "@/admin_BOX/pages/UserProfile/EditProfileForm_update.vue";
import UserCard from "@/admin_BOX/pages/UserProfile/UserCard.vue";
import { useRouter, useRoute } from "vue-router/composables";

const route = useRoute();
const router = useRouter();
const userId = route.params.id;

// Reactive states
const backendErrors = ref({});
const successMessage = ref("");
const userFields = ref([]);
const userData = ref({});

// Fetch data
onMounted(async () => {
  try {
    console.log('Fetching form fields and user details for ID:', userId);
    // Fetch form fields
    const fieldsRes = await user_fields();
    userFields.value = Array.isArray(fieldsRes.data) ? fieldsRes.data : [];
    console.log('Form fields:', userFields.value);

    // Fetch user details
    const userDetailsRes = await get_user_details(userId);
    userData.value = userDetailsRes.data || {};
    console.log("Fetched user data:", userData.value);
  } catch (err) {
    console.error("Error fetching data:", err);
    backendErrors.value = { general: ["Failed to load user data"] };
  }
});

// Handle form submit
// Handle form submit
const handleFormSubmit = async (formData) => {
  // If formData is already FormData from child component, no need to recreate
  const newFormData = new FormData();

  for (let [key, value] of formData.entries()) {
    if (key === "profile_picture") {
      if (value instanceof File) {
        // ✅ Only append if it's a real File upload
        newFormData.append(key, value);
      }
      // else: skip, don’t send old URL/path
    } else {
      newFormData.append(key, value);
    }
  }

  try {
    // ✅ Use PATCH for partial updates
    const res = await patch_user(userId, newFormData);
    console.log("Response from patch_user:", res.data);

    successMessage.value = "User updated successfully!";
    setTimeout(() => {
      router.push("/allusers");
    }, 1500);
  } catch (err) {
    console.error("Error in patch_user:", err.response?.data || err);
    backendErrors.value = err.response?.data || {
      general: ["Failed to update user"],
    };
  }
};


// Title
const formTitle = computed(() => {
  return userData.value?.full_name
    ? `${userData.value.title || ""} ${userData.value.full_name}`
    : "Staff Update";
});
</script>



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

