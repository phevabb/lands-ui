<script setup>
import { ref, onMounted } from "vue"
import { all_users, getAccounts } from "../../services/api"
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
const errorMessage = ref("");


// function to check loading state
const checkLoading = () => isLoading.value


async function fetchUsers(page = 1) {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const pageSize = Number(
      itemsPerPage.value || 10
    );

    const response = await getAccounts({
      page,
      page_size: pageSize
    });

    console.log(
      "Accounts API response: print",
      response
    );

    const responseData =
      response.data;

    console.log(
      "Accounts API response:",
      responseData
    );

    /*
     * Paginated response:
     *
     * {
     *   count: 20,
     *   next: "...",
     *   previous: null,
     *   results: [...]
     * }
     */
    if (
      responseData &&
      Array.isArray(
        responseData.results
      )
    ) {
      rows.value =
        responseData.results;

      const totalRecords =
        Number(
          responseData.count ??
          responseData.results.length
        );

      totalPages.value =
        Math.max(
          1,
          Math.ceil(
            totalRecords /
            pageSize
          )
        );

      currentPage.value =
        Math.min(
          Math.max(
            Number(page) || 1,
            1
          ),
          totalPages.value
        );

      next.value =
        responseData.next ??
        null;

      previous.value =
        responseData.previous ??
        null;

      console.log(
        "Paginated accounts:",
        rows.value
      );

      console.log(
        "Account pagination:",
        {
          currentPage:
            currentPage.value,

          totalPages:
            totalPages.value,

          totalRecords,

          pageSize,

          next:
            next.value,

          previous:
            previous.value
        }
      );

      return;
    }

    /*
     * Wrapped Ktor response:
     *
     * {
     *   accounts: [...]
     * }
     */
    if (
      responseData &&
      Array.isArray(
        responseData.accounts
      )
    ) {
      applyClientPagination(
        responseData.accounts,
        page
      );

      return;
    }

    /*
     * Wrapped response:
     *
     * {
     *   data: [...]
     * }
     */
    if (
      responseData &&
      Array.isArray(
        responseData.data
      )
    ) {
      applyClientPagination(
        responseData.data,
        page
      );

      return;
    }

    /*
     * Plain Ktor array:
     *
     * [...]
     */
    if (
      Array.isArray(
        responseData
      )
    ) {
      applyClientPagination(
        responseData,
        page
      );

      return;
    }

    console.error(
      "Unexpected accounts response:",
      responseData
    );

    resetAccountResults();

    errorMessage.value =
      "The accounts response has an unexpected format.";
  } catch (error) {
    console.error(
      "Unable to fetch accounts:",
      error.response?.data ||
      error.message ||
      error
    );

    resetAccountResults();

    if (
      error.message?.includes(
        "Network Error"
      ) ||
      error.code ===
        "ERR_NETWORK"
    ) {
      errorMessage.value =
        "Please check your internet connection.";
    } else if (
      error.response?.status ===
        400
    ) {
      errorMessage.value =
        error.response?.data?.detail ||
        "The accounts request is invalid.";
    } else if (
      error.response?.status ===
        401
    ) {
      errorMessage.value =
        "Your session has expired. Please sign in again.";
    } else if (
      error.response?.status ===
        403
    ) {
      errorMessage.value =
        "You do not have permission to view accounts.";
    } else if (
      error.response?.status ===
        404
    ) {
      errorMessage.value =
        "The accounts endpoint could not be found.";
    } else if (
      error.response?.status ===
        500
    ) {
      errorMessage.value =
        error.response?.data?.detail ||
        "The server could not retrieve the accounts.";
    } else {
      errorMessage.value =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong while fetching account data.";
    }
  } finally {
    isLoading.value = false;
  }
}

function applyClientPagination(
  accounts,
  page = 1
) {
  const safeAccounts =
    Array.isArray(accounts)
      ? accounts
      : [];

  const pageSize =
    Math.max(
      1,
      Number(
        itemsPerPage.value ||
        10
      )
    );

  const totalRecords =
    safeAccounts.length;

  totalPages.value =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
        pageSize
      )
    );

  const requestedPage =
    Number(page) || 1;

  const safePage =
    Math.min(
      Math.max(
        requestedPage,
        1
      ),
      totalPages.value
    );

  const startIndex =
    (
      safePage - 1
    ) * pageSize;

  const endIndex =
    startIndex +
    pageSize;

  rows.value =
    safeAccounts.slice(
      startIndex,
      endIndex
    );

  currentPage.value =
    safePage;

  next.value =
    safePage <
    totalPages.value
      ? safePage + 1
      : null;

  previous.value =
    safePage > 1
      ? safePage - 1
      : null;

  console.log(
    "Client-paginated accounts:",
    rows.value
  );

  console.log(
    "Client pagination information:",
    {
      currentPage:
        currentPage.value,

      totalPages:
        totalPages.value,

      totalRecords,

      pageSize,

      next:
        next.value,

      previous:
        previous.value
    }
  );
}

function resetAccountResults() {
  rows.value = [];
  totalPages.value = 1;
  currentPage.value = 1;
  next.value = null;
  previous.value = null;
}

function goToNextPage() {
  if (
    currentPage.value <
    totalPages.value
  ) {
    fetchUsers(
      currentPage.value + 1
    );
  }
}

function goToPreviousPage() {
  if (
    currentPage.value > 1
  ) {
    fetchUsers(
      currentPage.value - 1
    );
  }
}

function goToPage(page) {
  const targetPage =
    Number(page);

  if (
    !Number.isInteger(
      targetPage
    )
  ) {
    return;
  }

  if (
    targetPage < 1 ||
    targetPage >
      totalPages.value
  ) {
    return;
  }

  fetchUsers(
    targetPage
  );
}

function changePageSize() {
  currentPage.value = 1;

  fetchUsers(1);
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
  router.push({ name: "Staff Details", params: { id } });
};

onMounted(async () => {
  isLoading.value = true
  fetchUsers(1);
  try {
    const response = await getAccounts({ page: 1  })
 
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
