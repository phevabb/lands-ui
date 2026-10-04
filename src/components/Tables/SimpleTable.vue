<template>
  <div class="table-container">
    <!-- Search and Export Header -->
    <div class="table-header">
      <div class="search-container">
        <span class="material-icons search-icon">search</span>
        <input
  v-model.trim="searchQuery"
  type="search"
  placeholder="Search by Staff ID or Name..."
  class="search-input"
  aria-label="Search staff by ID or name"
  :disabled="searchLoading"
/>
        <button
  v-if="searchQuery"
  type="button"
  class="clear-btn"
  aria-label="Clear search"
  @click="clearSearch"
>
  <span class="material-icons">
    close
  </span>
</button>
      </div>
  <button
  type="button"
  class="export-btn"
  :disabled="loading"
  aria-label="Export to Excel"
  @click="exportExcel"
>
  <span
    class="material-icons"
    style="
      font-size: 16px;
      margin-right: 6px;
    "
  >
    {{
      loading
        ? "hourglass_top"
        : "download"
    }}
  </span>

  {{
    loading
      ? "Exporting..."
      : "Export"
  }}
</button>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Profile Picture</th>
            <th>Staff ID</th>
            <th>Full Name</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr
v-for="item in normalizedRows"

  :key="item.id || item.userId"
  class="table-row"
  role="button"
  tabindex="0"
  :aria-label="`Select ${item.fullName || item.userId || 'account'}`"
  @click="selectUser(item)"
  @keydown.enter="selectUser(item)"
>
            <td>
              <img
                :src="getProfilePictureSrc(item.profilePictureUrl)"
                :alt="item.fullName || 'Profile Image'"
                class="profile-image"
              />
            </td>
            <td>{{ item.userId || 'N/A' }}</td>
            <td>{{ item.fullName || 'N/A' }}</td>
            <td>{{ item.phoneNumber || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
      <div
  v-if="normalizedRows.length === 0"
  class="no-results"
>
  No results found
</div>
    </div>

    <!-- Pagination -->
    <Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  @page-changed="
    page => emit(
      'page-changed',
      page
    )
  "
/>

    <!-- Search Results Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="clearSearch">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search Results</h2>


          <button
  type="button"
  class="modal-close-btn"
  aria-label="Close modal"
  @click="clearSearch"
>
  <span class="material-icons">
    close
  </span>
</button>
        </div>



       <div class="modal-body">
  <div
    v-if="searchLoading"
    class="no-results"
  >
    Loading account records...
  </div>

  <template v-else>
    <table
      v-if="filteredRows2.length > 0"
      class="data-table"
    >
      <thead>
        <tr>
          <th>Profile Picture</th>
          <th>Staff ID</th>
          <th>Full Name</th>
          <th>Contact</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in filteredRows2"
          :key="
            item.id ||
            item.userId
          "
          class="table-row"
          role="button"
          tabindex="0"
          :aria-label="
            `Select ${
              item.fullName ||
              item.userId ||
              'account'
            }`
          "
          @click="selectUser(item)"
          @keydown.enter="selectUser(item)"
          @keydown.space.prevent="
            selectUser(item)
          "
        >
          <td>
            <img
              :src="
                getProfilePictureSrc(
                  item.profilePictureUrl
                )
              "
              :alt="
                item.fullName ||
                'Profile image'
              "
              class="profile-image"
            />
          </td>

          <td>
            {{ item.userId || "N/A" }}
          </td>

          <td>
            {{ item.fullName || "N/A" }}
          </td>

          <td>
            {{ item.phoneNumber || "N/A" }}
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-else
      class="no-results"
    >
      No results found for
      "{{ searchQuery }}"
    </div>
  </template>
</div>





      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from "vue";

import * as XLSX from "xlsx";

import Pagination from "../Pagination.vue";

import api, {
  all_users_to_excel,
  DEFAULT_AVATAR
} from "../../services/api";

const loading = ref(false);
const searchLoading = ref(false);
const searchQuery = ref("");
const rows2 = ref([]);
const showModal = ref(false);

const props = defineProps({
  tableHeaderColor: {
    type: String,
    default: ""
  },

  next: {
    type: String,
    default: ""
  },

  previous: {
    type: String,
    default: ""
  },

  totalPages: {
    type: Number,
    default: 1
  },

  currentPage: {
    type: Number,
    default: 1
  },

  rows: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  "user-selected",
  "page-changed",
  "export-error"
]);



const normalizedRows =
  computed(() => {
    return props.rows.map(account => {
      return normalizeAccount(account);
    });
  });

onMounted(async () => {
  await loadSearchRecords();
});

async function loadSearchRecords() {
  searchLoading.value = true;

  try {
    const response =
      await all_users_to_excel();

    const responseData =
      response.data;

    console.log(
      "All accounts search response:",
      responseData
    );

    const accounts =
      extractAccounts(
        responseData
      );

    rows2.value =
      accounts.map(account => {
        return normalizeAccount(
          account
        );
      });

    console.log(
      "Normalized search accounts:",
      rows2.value
    );
  } catch (error) {
    console.error(
      "Unable to retrieve accounts for searching:",
      error.response?.data ||
      error.message ||
      error
    );

    rows2.value = [];

    emit(
      "export-error",
      error.response?.data?.detail ||
      "Failed to fetch account data for searching."
    );
  } finally {
    searchLoading.value = false;
  }
}

function extractAccounts(
  responseData
) {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.results
    )
  ) {
    return responseData.results;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.accounts
    )
  ) {
    return responseData.accounts;
  }

  if (
    responseData &&
    Array.isArray(
      responseData.data
    )
  ) {
    return responseData.data;
  }

  return [];
}

function normalizeAccount(account) {
  return {
    ...account,

    id:
      account.id ??
      null,

    userId:
      account.userId ??
      account.user_id ??
      "",

    firstName:
      account.firstName ??
      account.first_name ??
      "",

    middleName:
      account.middleName ??
      account.middle_name ??
      "",

    lastName:
      account.lastName ??
      account.last_name ??
      "",

    fullName:
      account.fullName ??
      account.full_name ??
      createFullName(account),

    displayName:
      account.displayName ??
      account.display_name ??
      account.fullName ??
      account.full_name ??
      account.userId ??
      account.user_id ??
      "",

    phoneNumber:
      account.phoneNumber ??
      account.phone_number ??
      "",

    email:
      account.email ??
      "",

    role:
      account.role ??
      "",

    regionName:
      account.regionName ??
      account.region_name ??
      account.region ??
      "",

    profilePictureUrl:
      account.profilePictureUrl ??
      account.profile_picture_url ??
      account.profilePicture ??
      account.profile_picture ??
      null
  };
}

function createFullName(
  account
) {
  return [
    account.firstName ??
      account.first_name,

    account.middleName ??
      account.middle_name,

    account.lastName ??
      account.last_name
  ]
    .filter(value => {
      return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      );
    })
    .map(value => {
      return String(value).trim();
    })
    .join(" ");
}

const filteredRows2 =
  computed(() => {
    const query =
      searchQuery.value
        .trim()
        .toLowerCase();

    if (!query) {
      return [];
    }

    return rows2.value.filter(
      account => {
        const searchableValues = [
          account.userId,
          account.fullName,
          account.displayName,
          account.firstName,
          account.middleName,
          account.lastName,
          account.phoneNumber,
          account.email,
          account.role,
          account.regionName
        ];

        return searchableValues.some(
          value => {
            return String(
              value ?? ""
            )
              .toLowerCase()
              .includes(query);
          }
        );
      }
    );
  });

function getProfilePictureSrc(profilePicture) {
  if (
    !profilePicture ||
    profilePicture === "-"
  ) {
    return DEFAULT_AVATAR;
  }

  const picture =
    String(profilePicture).trim();

  if (
    picture.startsWith("http://") ||
    picture.startsWith("https://") ||
    picture.startsWith("data:") ||
    picture.startsWith("blob:")
  ) {
    return picture;
  }

  const baseUrl =
    String(
      api.defaults.baseURL || ""
    ).replace(
      /\/+$/,
      ""
    );

  const picturePath =
    picture.replace(
      /^\/+/,
      ""
    );

  return `${baseUrl}/${picturePath}`;
}

function selectUser(
  item
) {
  if (
    item.id === null ||
    item.id === undefined
  ) {
    console.error(
      "Selected account has no database ID:",
      item
    );

    return;
  }

  emit(
    "user-selected",
    item.id
  );

  clearSearch();
}

async function exportExcel() {
  if (loading.value) {
    return;
  }

  loading.value = true;

  try {
    let exportAccounts =
      rows2.value;

    if (
      exportAccounts.length === 0
    ) {
      const response =
        await all_users_to_excel();

      exportAccounts =
        extractAccounts(
          response.data
        ).map(account => {
          return normalizeAccount(
            account
          );
        });
    }

    if (
      exportAccounts.length === 0
    ) {
      emit(
        "export-error",
        "No account data is available to export."
      );

      return;
    }

    const exportData =
      exportAccounts.map(
        account => {
          return {
            "Staff ID":
              account.userId ||
              "",

            "Full Name":
              account.fullName ||
              "",

            "Phone Number":
              account.phoneNumber ||
              "",

            "Email":
              account.email ||
              "",

            "Role":
              account.role ||
              "",

            "Region":
              account.regionName ||
              ""
          };
        }
      );

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "StaffData"
    );

    XLSX.writeFile(
      workbook,
      "staff_data.xlsx"
    );
  } catch (error) {
    console.error(
      "Unable to export account data:",
      error.response?.data ||
      error.message ||
      error
    );

    emit(
      "export-error",
      error.response?.data?.detail ||
      "Failed to export account data to Excel."
    );
  } finally {
    loading.value = false;
  }
}

function clearSearch() {
  searchQuery.value = "";
  showModal.value = false;
}

watch(
  searchQuery,
  newQuery => {
    showModal.value =
      newQuery.trim()
        .length > 0;
  }
);
</script>


<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: #666;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.export-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  min-width: 120px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td:first-child {
  width: 60px; /* Fixed width for profile picture column */
}

.profile-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.table-row:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
}

.modal-body {
  padding: 16px;
}
</style>