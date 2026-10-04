<template>
  <div class="table-container">
    <!-- Search and Export Header -->
    <div class="table-header">
      <div class="search-container">
        <span class="material-icons search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Staff ID or Name..."
          class="search-input"
          aria-label="Search staff by ID or name"
        />
        <button
          v-if="searchQuery"
          class="clear-btn"
          @click="clearSearch"
          aria-label="Clear search"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
      <button
        class="export-btn"
        @click="exportExcel"
        :disabled="loading"
        aria-label="Export to Excel"
      >
        <span class="material-icons" style="font-size: 16px; margin-right: 6px;">
          {{ loading ? 'hourglass_top' : 'download' }}
        </span>
        {{ loading ? 'Exporting...' : 'Export' }}
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
            :key="item.id"
            @click="selectUser(item)"
            class="table-row"
            role="button"
            :aria-label="`Select ${item.fullName}`"
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
      <div v-if="rows.length === 0" class="no-results">
        No results found
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="(page) => emit('page-changed', page)"
      />
    </div>

    <!-- Search Results Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="clearSearch">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search Results</h2>
          <button class="modal-close-btn" @click="clearSearch" aria-label="Close modal">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
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
                v-for="item in filteredRows2"
                :key="item.id"
                @click="selectUser(item)"
                class="table-row"
                role="button"
                :aria-label="`Select ${item.fullName}`"
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
          <div v-if="filteredRows2.length === 0" class="no-results">
            No results found for "{{ searchQuery }}"
          </div>
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

import Pagination from "../../components/Pagination.vue";

import api, {
  DEFAULT_AVATAR,
  manager_all_users_to_excel
} from "../../services/api";

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

const loading = ref(false);
const searchLoading = ref(false);
const searchQuery = ref("");
const rows2 = ref([]);
const showModal = ref(false);

const normalizedRows = computed(() => {
  return props.rows.map(item => {
    return normalizeAccount(item);
  });
});

const filteredRows2 = computed(() => {
  const query =
    searchQuery.value
      .trim()
      .toLowerCase();

  if (!query) {
    return [];
  }

  return rows2.value.filter(item => {
    const searchableValues = [
      item.userId,
      item.fullName,
      item.displayName,
      item.firstName,
      item.middleName,
      item.lastName,
      item.phoneNumber,
      item.email,
      item.role,
      item.gender,
      item.regionName,
      item.districtName,
      item.directorateName,
      item.categoryName,
      item.currentGradeName,
      item.managementUnitCostCentreName
    ];

    return searchableValues.some(value => {
      return String(value ?? "")
        .toLowerCase()
        .includes(query);
    });
  });
});

onMounted(async () => {
  await loadSearchRecords();
});

async function loadSearchRecords() {
  searchLoading.value = true;

  try {
    const response =
      await manager_all_users_to_excel();

    console.log(
      "Manager region users response:",
      response.data
    );

    const accounts =
      extractAccounts(
        response.data
      );

    rows2.value =
      accounts.map(item => {
        return normalizeAccount(item);
      });

    console.log(
      "Manager users available for search:",
      rows2.value.length
    );
  } catch (error) {
    rows2.value = [];

    console.error(
      "Unable to load Manager region users:",
      error.response?.data ||
      error.message ||
      error
    );

    emit(
      "export-error",
      error.response?.data?.detail ||
      "Failed to load regional staff records."
    );
  } finally {
    searchLoading.value = false;
  }
}

function extractAccounts(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (
    responseData &&
    Array.isArray(responseData.results)
  ) {
    return responseData.results;
  }

  if (
    responseData &&
    Array.isArray(responseData.accounts)
  ) {
    return responseData.accounts;
  }

  if (
    responseData &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  return [];
}

function normalizeAccount(item) {
  return {
    ...item,

    id:
      Number(
        item.id ??
        item.accountId ??
        item.account_id
      ) || null,

    userId:
      String(
        item.userId ??
        item.staffId ??
        item.staff_id ??
        ""
      ).trim(),

    firstName:
      item.firstName ??
      item.first_name ??
      "",

    middleName:
      item.middleName ??
      item.middle_name ??
      "",

    lastName:
      item.lastName ??
      item.last_name ??
      "",

    fullName:
      item.fullName ??
      item.full_name ??
      createFullName(item),

    phoneNumber:
      item.phoneNumber ??
      item.phone_number ??
      "",

    email:
      item.email ??
      "",

    role:
      item.role ??
      "",

    gender:
      item.gender ??
      "",

    regionName:
      item.regionName ??
      item.region_name ??
      item.region ??
      "",

    districtName:
      item.districtName ??
      item.district_name ??
      item.district ??
      "",

    directorateName:
      item.directorateName ??
      item.directorate_name ??
      item.directorate ??
      "",

    categoryName:
      item.categoryName ??
      item.category_name ??
      item.category ??
      "",

    currentGradeName:
      item.currentGradeName ??
      item.current_grade_name ??
      item.current_grade ??
      "",

    managementUnitCostCentreName:
      item.managementUnitCostCentreName ??
      item.management_unit_cost_centre_name ??
      item.management_unit_cost_centre ??
      "",

    profilePictureUrl:
      item.profilePictureUrl ??
      item.profile_picture_url ??
      item.profilePicture ??
      item.profile_picture ??
      null
  };
}



function handleUserSelected(accountId) {
  const normalizedAccountId =
    Number(accountId);

  if (
    !Number.isInteger(
      normalizedAccountId
    ) ||
    normalizedAccountId <= 0
  ) {
    console.error(
      "Cannot open staff details because the account ID is invalid:",
      accountId
    );

    return;
  }

  console.log(
    "Opening Manager staff details:",
    normalizedAccountId
  );

  router.push(
    `/manager/staff-details/${normalizedAccountId}`
  );
}






function createFullName(item) {
  return [
    item.firstName ??
      item.first_name,

    item.middleName ??
      item.middle_name,

    item.lastName ??
      item.last_name
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

function handlePageChanged(page) {
  emit(
    "page-changed",
    page
  );
}




function selectUser(item) {
  const accountId =
    Number(
      item.id ??
      item.user_id
    );

  if (
    !Number.isInteger(accountId) ||
    accountId <= 0
  ) {
    console.error(
      "Selected account has no valid database ID:",
      item
    );

    return;
  }

  console.log(
    "Selected Manager-region account ID:",
    accountId
  );

  emit(
    "user-selected",
    accountId
  );

  clearSearch();
}




function getProfilePictureSrc(
  profilePictureUrl
) {
  if (
    !profilePictureUrl ||
    profilePictureUrl === "-"
  ) {
    return DEFAULT_AVATAR;
  }

  const picture =
    String(
      profilePictureUrl
    ).trim();

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
        await manager_all_users_to_excel();

      exportAccounts =
        extractAccounts(
          response.data
        ).map(item => {
          return normalizeAccount(item);
        });
    }

    if (
      exportAccounts.length === 0
    ) {
      emit(
        "export-error",
        "No regional staff data is available to export."
      );

      return;
    }

    const exportData =
      exportAccounts.map(item => {
        return {
          "Staff ID":
            item.userId || "",

          "Full Name":
            item.fullName || "",

          "Phone Number":
            item.phoneNumber || "",

          "Email":
            item.email || "",

          "Role":
            item.role || "",

          "Gender":
            item.gender || "",

          "Region":
            item.regionName || "",

          "District":
            item.districtName || "",

          "Directorate":
            item.directorateName || "",

          "Class":
            item.categoryName || "",

          "Current Grade":
            item.currentGradeName || "",

          "Management Unit":
            item.managementUnitCostCentreName || ""
        };
      });

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "RegionalStaff"
    );

    XLSX.writeFile(
      workbook,
      "regional_staff_data.xlsx"
    );
  } catch (error) {
    console.error(
      "Unable to export Manager region users:",
      error.response?.data ||
      error.message ||
      error
    );

    emit(
      "export-error",
      error.response?.data?.detail ||
      "Failed to export regional staff data."
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
      newQuery.trim().length > 0;
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