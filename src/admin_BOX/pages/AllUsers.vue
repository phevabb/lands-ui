<script setup>
import {
  onMounted,
  ref
} from "vue";

import {
  useRouter
} from "vue-router/composables";

import {
  getAccounts
} from "../../services/api";

import SimpleTable from "@/admin_BOX/pages/SimpleTable.vue";


const router =
  useRouter();

const isLoading =
  ref(true);

const rows =
  ref([]);

const next =
  ref(null);

const previous =
  ref(null);

const totalRecords =
  ref(0);

const totalPages =
  ref(1);

const currentPage =
  ref(1);

const itemsPerPage =
  ref(10);

const errorMessage =
  ref("");

const checkLoading = () => {
  return isLoading.value;
};

async function fetchUsers(
  page = 1
) {
  const requestedPage =
    Number(page);

  const safePage =
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const requestedPageSize =
    Number(
      itemsPerPage.value
    );

  const safePageSize =
    Number.isInteger(
      requestedPageSize
    ) &&
    requestedPageSize > 0
      ? requestedPageSize
      : 10;

  isLoading.value =
    true;

  errorMessage.value =
    "";

  try {
    console.log(
      "Fetching accounts"
    );

    console.log(
      "Requested page:",
      safePage
    );

    console.log(
      "Page size:",
      safePageSize
    );

    const response =
      await getAccounts({
        page:
          safePage,

        page_size:
          safePageSize
      });

    const responseData =
      response.data;

    console.log(
      "Accounts API response:",
      responseData
    );

    /*
     * Server-paginated response:
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

      totalRecords.value =
        normalizeTotalRecords(
          responseData.count ??
          responseData.results.length
        );

      itemsPerPage.value =
        safePageSize;

      totalPages.value =
        Math.max(
          1,
          Math.ceil(
            totalRecords.value /
            itemsPerPage.value
          )
        );

      currentPage.value =
        Math.min(
          safePage,
          totalPages.value
        );

      next.value =
        responseData.next ??
        null;

      previous.value =
        responseData.previous ??
        null;

      console.log(
        "Paginated accounts loaded:",
        {
          currentPage:
            currentPage.value,

          totalPages:
            totalPages.value,

          totalRecords:
            totalRecords.value,

          pageSize:
            itemsPerPage.value,

          recordsOnPage:
            rows.value.length,

          next:
            next.value,

          previous:
            previous.value
        }
      );

      return;
    }

    /*
     * Wrapped response:
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
        safePage
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
        safePage
      );

      return;
    }

    /*
     * Plain array:
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
        safePage
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

    console.log("error is print", error);
    console.error(
      "Unable to fetch accounts:",
      {
        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message,

        code:
          error.code
      }
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
    isLoading.value =
      false;

    console.log(
      "Account loading completed"
    );
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

  const requestedPageSize =
    Number(
      itemsPerPage.value
    );

  const safePageSize =
    Number.isInteger(
      requestedPageSize
    ) &&
    requestedPageSize > 0
      ? requestedPageSize
      : 10;

  totalRecords.value =
    safeAccounts.length;

  itemsPerPage.value =
    safePageSize;

  totalPages.value =
    Math.max(
      1,
      Math.ceil(
        totalRecords.value /
        itemsPerPage.value
      )
    );

  const requestedPage =
    Number(page);

  const safePage =
    Math.min(
      Math.max(
        Number.isInteger(
          requestedPage
        )
          ? requestedPage
          : 1,
        1
      ),
      totalPages.value
    );

  const startIndex =
    (
      safePage -
      1
    ) *
    itemsPerPage.value;

  const endIndex =
    startIndex +
    itemsPerPage.value;

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
    {
      currentPage:
        currentPage.value,

      totalPages:
        totalPages.value,

      totalRecords:
        totalRecords.value,

      pageSize:
        itemsPerPage.value,

      recordsOnPage:
        rows.value.length,

      next:
        next.value,

      previous:
        previous.value
    }
  );
}

function normalizeTotalRecords(
  value
) {
  const normalizedValue =
    Number(value);

  return Number.isFinite(
    normalizedValue
  ) &&
    normalizedValue >= 0
    ? normalizedValue
    : 0;
}

function resetAccountResults() {
  rows.value = [];
  totalRecords.value = 0;
  totalPages.value = 1;
  currentPage.value = 1;
  next.value = null;
  previous.value = null;
}

async function goToNextPage() {
  if (
    currentPage.value <
    totalPages.value
  ) {
    await fetchUsers(
      currentPage.value +
      1
    );
  }
}

async function goToPreviousPage() {
  if (
    currentPage.value >
    1
  ) {
    await fetchUsers(
      currentPage.value -
      1
    );
  }
}

async function goToPage(
  page
) {
  const targetPage =
    Number(page);

  if (
    !Number.isInteger(
      targetPage
    ) ||
    targetPage < 1 ||
    targetPage >
      totalPages.value
  ) {
    return;
  }

  await fetchUsers(
    targetPage
  );
}

async function changePageSize(
  pageSize
) {
  const normalizedPageSize =
    Number(pageSize);

  if (
    Number.isInteger(
      normalizedPageSize
    ) &&
    normalizedPageSize > 0
  ) {
    itemsPerPage.value =
      normalizedPageSize;
  }

  currentPage.value = 1;

  await fetchUsers(
    1
  );
}

function goToUserDetail(
  id
) {
  const accountId =
    Number(id);

  if (
    !Number.isInteger(
      accountId
    ) ||
    accountId <= 0
  ) {
    console.error(
      "Cannot open staff details because the account ID is invalid:",
      id
    );

    return;
  }

  router.push({
    name:
      "Staff Details",

    params: {
      id:
        accountId
    }
  });
}

onMounted(async () => {
  await fetchUsers(
    1
  );
});
</script>

<template>
  <div class="content">
    <div class="md-layout">
      <div
        class="
          md-layout-item
          md-medium-size-100
          md-xsmall-size-100
          md-size-100
        "
      >
        <md-card>
          <md-card-header
            data-background-color="green"
          >
            <h4 class="title">
              Staff Data
            </h4>

            <p class="category">
              Click on a staff member for more information
            </p>
          </md-card-header>

          <md-card-content>
            <div
              v-if="checkLoading()"
              class="loading-message"
            >
              Loading users...
            </div>

            <div
              v-else-if="errorMessage"
              class="error-message"
            >
              <span>
                {{ errorMessage }}
              </span>

              <button
                type="button"
                class="retry-button"
                @click="
                  fetchUsers(
                    currentPage
                  )
                "
              >
                Try Again
              </button>
            </div>

            <SimpleTable
              v-else
              table-header-color="green"
              :rows="rows"
              :next="next"
              :previous="previous"
              :current-page="currentPage"
              :total-pages="totalPages"
              :page-size="itemsPerPage"
              :total-records="totalRecords"
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 1rem 0;
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
}

.retry-button {
  padding: 9px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  border: 0;
  border-radius: 8px;
  background: #4338ca;
  cursor: pointer;
}

.loading-message {
  margin: 1rem 0;
  color: #475569;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}
</style>



