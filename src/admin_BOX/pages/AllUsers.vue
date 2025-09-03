<script setup>
import { ref, onMounted } from "vue"
import { all_users } from "../../services/api"
import { SimpleTable } from "@/components"
import StaffDetails from "./StaffDetails.vue"
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


// function to check loading state
const checkLoading = () => isLoading.value




async function fetchUsers(page = 1) {
  isLoading.value = true;
  try {
    const response = await all_users({ page });

    rows.value = response.data.results;
    
    itemsPerPage.value = response.data.page_size
    totalPages.value = Math.ceil(response.data.count / itemsPerPage.value);
    currentPage.value = getCurrentPageFromUrl(response.data.next, response.data.previous);
    next.value = response.data.next;
    previous.value = response.data.previous;
  } catch (error) {
   
  } finally {
    isLoading.value = false;
  }
}


function getCurrentPageFromUrl(next, previous) {
  if (previous === null) return 1; // first page
  if (next === null) {
    // last page: extract ?page=X from previous and +1
    const prevPage = new URL(previous).searchParams.get("page");
    return parseInt(prevPage) + 1;
  }
  // middle pages: extract from next and subtract 1
  const nextPage = new URL(next).searchParams.get("page");
  return parseInt(nextPage) - 1;
}

const goToUserDetail = (id) => {
  router.push({ name: "Staff Details", params: { id } });
};

onMounted(async () => {
  isLoading.value = true
  fetchUsers(1);
  try {
    const response = await all_users({ page: 1  })
    itemsPerPage.value = response.data.page_size

    totalPages.value = Math.ceil(response.data.count / itemsPerPage.value);
    currentPage.value = getCurrentPageFromUrl(response.data.next, response.data.previous);

    


   // console.log("All users response:", response.data)
 

    rows.value = response.data.results
    console.log("it", response.data.results)
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
            <div v-if="checkLoading()">Loading users...</div>
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
