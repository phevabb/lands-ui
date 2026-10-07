



<script setup>
import {
  onMounted,
  ref
} from "vue";

import {
  useRouter
} from "vue-router/composables";

import {
  manager_all_users
} from "../../services/api";

import SimpleTable from "../box/SimpleTable.vue";

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

  const safePageSize =
    Number.isInteger(
      Number(
        itemsPerPage.value
      )
    ) &&
    Number(
      itemsPerPage.value
    ) > 0
      ? Number(
          itemsPerPage.value
        )
      : 10;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    console.log(
      "Fetching Manager users"
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
      await manager_all_users({
        page:
          safePage,

        page_size:
          safePageSize
      });

    const responseData =
      response.data || {};

    console.log(
      "Manager users response:",
      responseData
    );

    rows.value =
      Array.isArray(
        responseData.results
      )
        ? responseData.results
        : [];

    totalRecords.value =
      Number(
        responseData.count
      ) || 0;

    currentPage.value =
      safePage;

    itemsPerPage.value =
      safePageSize;

    totalPages.value =
      Math.max(
        1,
        Math.ceil(
          totalRecords.value /
          safePageSize
        )
      );

    next.value =
      responseData.next ||
      null;

    previous.value =
      responseData.previous ||
      null;

    console.log(
      "Manager users loaded successfully"
    );

    console.log(
      "Current page:",
      currentPage.value
    );

    console.log(
      "Page size:",
      itemsPerPage.value
    );

    console.log(
      "Total pages:",
      totalPages.value
    );

    console.log(
      "Total records:",
      totalRecords.value
    );

    console.log(
      "Records returned:",
      rows.value.length
    );
  } catch (error) {
    console.log(
      "Manager users request failed:",
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

    rows.value = [];

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
      401
    ) {
      errorMessage.value =
        "Your session has expired. Please sign in again.";
    } else if (
      error.response?.status ===
      403
    ) {
      errorMessage.value =
        "You do not have permission to view these staff records.";
    } else {
      errorMessage.value =
        error.response?.data?.detail ||
        "Something went wrong while fetching staff data.";
    }
  } finally {
    isLoading.value = false;

    console.log(
      "Manager users loading completed"
    );
  }
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
      "Manager Staff Details",

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
              {{ errorMessage }}

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

.retry-button:hover {
  background: #3730a3;
}

.loading-message {
  margin: 1rem 0;
  color: #475569;
  font-size: 1.3rem;
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


