<script setup>
import { ref, onMounted } from "vue"
import { manager_all_users } from "../../services/api"

import SimpleTable from "../box/SimpleTable.vue"
import m_StaffDetails from "./m_StaffDetails.vue"
import { useRouter } from "vue-router/composables";



const router = useRouter();

const isLoading = ref(true)
const rows = ref([])
const next = ref(null)
const previous = ref(null)
const totalPages = ref(null);
const currentPage = ref(null);
const itemsPerPage = ref(null)
const selectedUser = ref(null)
const errorMessage = ref("");


// function to check loading state
const checkLoading = () => isLoading.value




async function fetchUsers(page = 1) {
  isLoading.value = true;
  try {
    const region = localStorage.getItem("region") || "";
    const response = await manager_all_users({ page, region });



    rows.value = response.data.results
    
    itemsPerPage.value = 10
    totalPages.value = Math.ceil(response.data.count / 10);
    currentPage.value = getCurrentPageFromUrl(response.data.next, response.data.previous);
    next.value = response.data.next;
    previous.value = response.data.previous;
  } catch (err) {

     if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
   
  } finally {
    isLoading.value = false;
  }
}


function getCurrentPageFromUrl(next, previous) {
  if (previous === null) return 1; // first page
  if (next === null) {
   
    const prevPage = new URL(previous).searchParams.get("page");
    return parseInt(prevPage) + 1;
  }
  // middle pages: extract from next and subtract 1
  const nextPage = new URL(next).searchParams.get("page");
  return parseInt(nextPage) - 1;
}

const goToUserDetail = (id) => {
  router.push({ name: "Manager Staff Details", params: { id } });
};

onMounted(async () => {
  isLoading.value = true
  fetchUsers(1);
  try {
     const region = localStorage.getItem("region") || "";
    const response = await manager_all_users({ page: 1, region  })
 
    itemsPerPage.value = 10

    totalPages.value = Math.ceil(response.data.count / 10 );
    currentPage.value = getCurrentPageFromUrl(response.data.next, response.data.previous);


    rows.value = response.data.results

    next.value = response.data.next
    previous.value = response.data.previous 


  } catch (error) {
    
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-100">
        <md-card>
          <md-card-header data-background-color="green">
            <h4 class="title">Staff Data</h4>
            <p class="category">Click on staff for more info</p>
          </md-card-header>

          <md-card-content>
            <div v-if="checkLoading()"  class="loading-message">Loading users...</div>
            <!-- Error message -->
      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>


            <simple-table
              v-else
              table-header-color="green"
              :rows="rows"
              :next="next"
              :previous="previous"
              :currentPage="currentPage"
              :totalPages="totalPages"
              @page-changed="fetchUsers"
              @user-selected="goToUserDetail"
            />
          </md-card-content>
        </md-card>
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
