




<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from "vue";

import {
  useRoute,
  useRouter
} from "vue-router/composables";

import * as XLSX from "xlsx";

import {
  saveAs
} from "file-saver";


import {
  SimpleTable
} from "@/components";

import {
  users_per_department,
  users_per_department_no_pages
} from "../../services/api";


const route =
  useRoute();

const router =
  useRouter();

const users =
  ref([]);

const usersNoPages =
  ref([]);

const dept =
  ref("");

const filterType =
  ref("");

const searchQuery =
  ref("");

const selectedRow =
  ref(null);

const isLoading =
  ref(true);

const exportLoading =
  ref(false);

const errorMessage =
  ref("");

const totalCount =
  ref(0);

const next =
  ref(null);

const previous =
  ref(null);

const totalPages =
  ref(1);

const currentPage =
  ref(1);

const itemsPerPage =
  ref(10);

const filteredUsers =
  computed(() => {
    const query =
      searchQuery.value
        .trim()
        .toLowerCase();

    if (!query) {
      return users.value;
    }

    return users.value.filter(
      staff => {
        const searchableValues = [
          staff.userId,
          staff.fullName,
          staff.firstName,
          staff.middleName,
          staff.lastName,
          staff.phoneNumber,
          staff.email,
          staff.supervisorName
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

const showingRange =
  computed(() => {
    if (
      totalCount.value === 0
    ) {
      return "Showing 0 of 0";
    }

    const start =
      (
        (
          currentPage.value -
          1
        ) *
        PAGE_SIZE
      ) + 1;

    const end =
      Math.min(
        currentPage.value *
          PAGE_SIZE,
        totalCount.value
      );

    return (
      `Showing ${start}-${end} ` +
      `of ${totalCount.value}`
    );
  });

const canExport =
  computed(() => {
    return (
      usersNoPages.value.length >
      0
    );
  });

onMounted(async () => {
  await loadPage();
});

watch(
  () => route.query.dept,
  async (
    newDepartment,
    oldDepartment
  ) => {
    if (
      newDepartment ===
      oldDepartment
    ) {
      return;
    }

    currentPage.value = 1;
    searchQuery.value = "";

    await loadPage();
  }
);

async function loadPage() {
  const departmentName =
    getDepartmentFromRoute();

  if (!departmentName) {
    resetPage();

    errorMessage.value =
      "A department or staff category is required.";

    isLoading.value = false;

    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  dept.value = departmentName;

  try {
    const [
      paginatedResponse,
      nonPaginatedResponse
    ] = await Promise.all([
      users_per_department(
        departmentName,
        {
          page: 1,
          page_size:
            itemsPerPage.value
        }
      ),

      users_per_department_no_pages(
        departmentName
      )
    ]);

    applyPaginatedResponse(
      paginatedResponse?.data,
      1
    );

    applyNonPaginatedResponse(
      nonPaginatedResponse?.data
    );

    console.log(
      "Filtered staff loaded:",
      {
        dept:
          dept.value,

        filterType:
          filterType.value,

        totalCount:
          totalCount.value,

        currentPageUsers:
          users.value.length,

        exportUsers:
          usersNoPages.value.length
      }
    );
  } catch (error) {
    resetPage();

    console.error(
      "Unable to load filtered staff:",
      error.response?.data ||
      error.message ||
      error
    );

    errorMessage.value =
      getErrorMessage(
        error
      );
  } finally {
    isLoading.value = false;
  }
}

async function fetchUsers(
  page = 1
) {
  const requestedPage =
    normalizePage(
      page
    );

  const departmentName =
    dept.value ||
    getDepartmentFromRoute();

  if (!departmentName) {
    errorMessage.value =
      "A department or staff category is required.";

    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response =
  await users_per_department(
    departmentName,
    {
      page:
        requestedPage,

      page_size:
        itemsPerPage.value
    }
  );

    applyPaginatedResponse(
      response?.data,
      requestedPage
    );
  } catch (error) {
    console.error(
      "Unable to retrieve filtered staff page:",
      error.response?.data ||
      error.message ||
      error
    );

    errorMessage.value =
      getErrorMessage(
        error
      );
  } finally {
    isLoading.value = false;
  }
}




function goToUserDetail(
  id
) {
  const accountId =
    normalizeAccountId(
      id
    );

  if (!accountId) {
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




function applyPaginatedResponse(
  responseData,
  requestedPage
) {
  const data =
    responseData &&
    typeof responseData ===
      "object"
      ? responseData
      : {};

  const results =
    data.results &&
    typeof data.results ===
      "object"
      ? data.results
      : {};

  users.value =
    Array.isArray(
      results.users
    )
      ? results.users.map(
          normalizeAccount
        )
      : [];

  dept.value =
    String(
      results.dept ??
      dept.value
    ).trim();

  filterType.value =
    String(
      results.filter_type ??
      results.filterType ??
      ""
    ).trim();

  totalCount.value =
    normalizeCount(
      data.count ??
      results.count
    );

  next.value =
    typeof data.next ===
      "string"
      ? data.next
      : null;

  previous.value =
    typeof data.previous ===
      "string"
      ? data.previous
      : null;

  totalPages.value =
    Math.max(
      1,
      Math.ceil(
        totalCount.value /
        itemsPerPage.value
      )
    );

  currentPage.value =
    Math.min(
      normalizePage(
        requestedPage
      ),
      totalPages.value
    );

  console.log(
    "Filtered staff pagination:",
    {
      department:
        dept.value,

      currentPage:
        currentPage.value,

      pageSize:
        itemsPerPage.value,

      totalPages:
        totalPages.value,

      totalRecords:
        totalCount.value,

      recordsOnCurrentPage:
        users.value.length
    }
  );
}




function applyNonPaginatedResponse(
  responseData
) {
  const data =
    responseData &&
    typeof responseData ===
      "object"
      ? responseData
      : {};

  usersNoPages.value =
    Array.isArray(
      data.users
    )
      ? data.users.map(
          normalizeAccount
        )
      : [];
}

function normalizeAccount(
  account
) {
  return {
    ...account,

    id:
      normalizeAccountId(
        account.id ??
        account.accountId ??
        account.account_id
      ),

    userId:
      String(
        account.userId ??
        account.user_id ??
        ""
      ),

    firstName:
      String(
        account.firstName ??
        account.first_name ??
        ""
      ),

    middleName:
      String(
        account.middleName ??
        account.middle_name ??
        ""
      ),

    lastName:
      String(
        account.lastName ??
        account.last_name ??
        ""
      ),

    fullName:
      String(
        account.fullName ??
        account.full_name ??
        createFullName(account)
      ),

    phoneNumber:
      String(
        account.phoneNumber ??
        account.phone_number ??
        ""
      ),

    email:
      String(
        account.email ??
        ""
      ),

    supervisorName:
      String(
        account.supervisorName ??
        account.supervisor_name ??
        ""
      ),

    profilePictureUrl:
      account.profilePictureUrl ??
      account.profile_picture_url ??
      account.profilePicture ??
      account.profile_picture ??
      null,

    role:
      String(
        account.role ??
        ""
      ),

    gender:
      String(
        account.gender ??
        ""
      ),

    staffCategory:
      String(
        account.staffCategory ??
        account.staff_category ??
        ""
      ),

    directorateName:
      String(
        account.directorateName ??
        account.directorate_name ??
        account.directorate ??
        ""
      ),

    categoryName:
      String(
        account.categoryName ??
        account.category_name ??
        account.category ??
        ""
      ),

    districtName:
      String(
        account.districtName ??
        account.district_name ??
        account.district ??
        ""
      ),

    regionName:
      String(
        account.regionName ??
        account.region_name ??
        account.region ??
        ""
      ),

    currentGradeName:
      String(
        account.currentGradeName ??
        account.current_grade_name ??
        account.current_grade ??
        ""
      ),

    managementUnitCostCentreName:
      String(
        account.managementUnitCostCentreName ??
        account.management_unit_cost_centre_name ??
        account.management_unit_cost_centre ??
        ""
      )
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
    .filter(
      value => {
        return (
          value !== null &&
          value !== undefined &&
          String(value).trim()
        );
      }
    )
    .map(
      value => {
        return String(
          value
        ).trim();
      }
    )
    .join(" ");
}

function selectRow(
  staff
) {
  const accountId =
    normalizeAccountId(
      staff?.id
    );

  if (!accountId) {
    console.error(
      "Selected staff record has no valid account ID:",
      staff
    );

    return;
  }

  selectedRow.value =
    staff;

  router.push({
    name:
      "Staff Details",

    params: {
      id:
        accountId
    }
  });
}






function getProfilePictureSrc(
  profilePicture
) {
  if (
    !profilePicture ||
    profilePicture ===
      "-"
  ) {
    return DEFAULT_AVATAR;
  }

  const picture =
    String(
      profilePicture
    ).trim();

  if (
    picture.startsWith(
      "http://"
    ) ||
    picture.startsWith(
      "https://"
    ) ||
    picture.startsWith(
      "data:"
    ) ||
    picture.startsWith(
      "blob:"
    )
  ) {
    return picture;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ??
      ""
    ).replace(
      /\/+$/,
      ""
    );

  const path =
    picture.replace(
      /^\/+/,
      ""
    );

  if (!baseUrl) {
    return `/${path}`;
  }

  return `${baseUrl}/${path}`;
}

async function exportExcel() {
  if (exportLoading.value) {
    return;
  }

  exportLoading.value = true;
  errorMessage.value = "";

  try {
    let exportUsers =
      usersNoPages.value;

    if (
      exportUsers.length === 0 &&
      dept.value
    ) {
      const response =
        await users_per_department_no_pages(
          dept.value
        );

      applyNonPaginatedResponse(
        response?.data
      );

      exportUsers =
        usersNoPages.value;
    }

    if (
      exportUsers.length === 0
    ) {
      errorMessage.value =
        "No staff records are available to export.";

      return;
    }

    const exportData =
      exportUsers.map(
        staff => {
          return {
            "Account ID":
              staff.id ??
              "",

            "Staff ID":
              staff.userId ||
              "",

            "Full Name":
              staff.fullName ||
              "",

            "Phone Number":
              staff.phoneNumber ||
              "",

            "Email":
              staff.email ||
              "",

            "Role":
              staff.role ||
              "",

            "Gender":
              staff.gender ||
              "",

            "Staff Category":
              staff.staffCategory ||
              "",

            "Supervisor's Name":
              staff.supervisorName ||
              "",

            "Directorate":
              staff.directorateName ||
              "",

            "Class":
              staff.categoryName ||
              "",

            "District":
              staff.districtName ||
              "",

            "Region":
              staff.regionName ||
              "",

            "Current Grade":
              staff.currentGradeName ||
              "",

            "Management Unit":
              staff.managementUnitCostCentreName ||
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
      createWorksheetName(
        dept.value
      )
    );

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType:
            "xlsx",

          type:
            "array"
        }
      );

    const excelFile =
      new Blob(
        [
          excelBuffer
        ],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      );

    saveAs(
      excelFile,
      `${createFileName(dept.value)}.xlsx`
    );
  } catch (error) {
    console.error(
      "Unable to export filtered staff:",
      error.response?.data ||
      error.message ||
      error
    );

    errorMessage.value =
      error.response?.data?.detail ||
      "The staff records could not be exported.";
  } finally {
    exportLoading.value = false;
  }
}

function clearSearch() {
  searchQuery.value = "";
}

function getDepartmentFromRoute() {
  const queryValue =
    route.query.dept;

  if (
    queryValue === null ||
    queryValue === undefined
  ) {
    return "";
  }

  try {
    return decodeURIComponent(
      String(queryValue)
    ).trim();
  } catch (error) {
    return String(
      queryValue
    ).trim();
  }
}

function getCurrentPageFromUrl(
  nextUrl,
  previousUrl,
  count,
  pageSize = PAGE_SIZE,
  fallbackPage = 1
) {
  const safeFallbackPage =
    normalizePage(
      fallbackPage
    );

  try {
    const nextPage =
      extractPageFromUrl(
        nextUrl
      );

    const previousPage =
      extractPageFromUrl(
        previousUrl
      );

    if (
      previousPage !== null
    ) {
      return previousPage + 1;
    }

    if (
      nextPage !== null
    ) {
      return Math.max(
        1,
        nextPage - 1
      );
    }

    const calculatedPages =
      Math.max(
        1,
        Math.ceil(
          normalizeCount(count) /
          pageSize
        )
      );

    return Math.min(
      safeFallbackPage,
      calculatedPages
    );
  } catch (error) {
    return safeFallbackPage;
  }
}

function extractPageFromUrl(
  url
) {
  if (
    typeof url !==
      "string" ||
    !url.trim()
  ) {
    return null;
  }

  const parsedUrl =
    new URL(
      url,
      window.location.origin
    );

  const page =
    Number(
      parsedUrl.searchParams.get(
        "page"
      )
    );

  return (
    Number.isInteger(page) &&
    page > 0
  )
    ? page
    : null;
}

function normalizePage(
  page
) {
  const normalizedPage =
    Number(page);

  return (
    Number.isInteger(
      normalizedPage
    ) &&
    normalizedPage > 0
  )
    ? normalizedPage
    : 1;
}

function normalizeCount(
  value
) {
  const count =
    Number(value);

  return (
    Number.isFinite(count) &&
    count >= 0
  )
    ? count
    : 0;
}

function normalizeAccountId(
  value
) {
  const accountId =
    Number(value);

  return (
    Number.isInteger(accountId) &&
    accountId > 0
  )
    ? accountId
    : null;
}

function createWorksheetName(
  value
) {
  const name =
    String(
      value ||
      "Staff"
    )
      .replace(
        /[\\/?*[\]:]/g,
        ""
      )
      .trim();

  return (
    name ||
    "Staff"
  ).slice(
    0,
    31
  );
}

function createFileName(
  value
) {
  const name =
    String(
      value ||
      "staff"
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      );

  return name ||
    "staff";
}

function getErrorMessage(
  error
) {
  if (
    error.message?.includes(
      "Network Error"
    ) ||
    error.code ===
      "ERR_NETWORK"
  ) {
    return "Please check your internet connection.";
  }

  if (
    error.response?.status ===
      401
  ) {
    return "Authentication is required.";
  }

  if (
    error.response?.status ===
      403
  ) {
    return (
      error.response?.data?.detail ||
      "Access is denied."
    );
  }

  return (
    error.response?.data?.detail ||
    "Something went wrong while fetching staff data."
  );
}

function resetPage() {
  users.value = [];
  usersNoPages.value = [];
  dept.value = "";
  filterType.value = "";
  searchQuery.value = "";
  selectedRow.value = null;
  totalCount.value = 0;
  next.value = null;
  previous.value = null;
  totalPages.value = 1;
  currentPage.value = 1;
}
</script>

<template>
  <div class="premium-container">
    <div class="premium-header">
      <div class="premium-title">
        <md-icon>
          group
        </md-icon>

        <div>
          <h2>
            {{ dept || "Filtered Staff" }}
          </h2>

          <p v-if="filterType">
            Filter type:
            {{ filterType }}
          </p>

          <p v-else>
            View and manage staff records for the selected category.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <md-button
          class="
            md-dense
            md-primary
            export-button
          "
          :disabled="
            exportLoading ||
            !canExport
          "
          @click="exportExcel"
        >
          <md-icon>
            {{
              exportLoading
                ? "hourglass_top"
                : "download"
            }}
          </md-icon>

          {{
            exportLoading
              ? "Exporting..."
              : "Export"
          }}
        </md-button>
      </div>
    </div>

    <div class="table-container">
      <div
        v-if="isLoading"
        class="loading-message"
      >
        <md-icon>
          hourglass_empty
        </md-icon>

        <h3>
          Loading Staff Records
        </h3>

        <p>
          Please wait while the staff records are retrieved.
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="error-message"
      >
        <md-icon>
          error_outline
        </md-icon>

        <div class="error-content">
          <strong>
            Unable to Load Staff Records
          </strong>

          <span>
            {{ errorMessage }}
          </span>
        </div>

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

      <div
        v-else-if="users.length === 0"
        class="no-results"
      >
        <md-icon>
          person_search
        </md-icon>

        <h3>
          No Staff Records Found
        </h3>

        <p>
          No staff records were found for
          {{ dept || "the selected category" }}.
        </p>
      </div>

      <SimpleTable
        v-else
        table-header-color="green"
        :rows="users"
        :next="next"
        :previous="previous"
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="itemsPerPage"
        :total-records="totalCount"
        @page-changed="fetchUsers"
        @user-selected="goToUserDetail"
        @export-error="handleExportError"
      />
    </div>
  </div>
</template>


<style scoped>
.premium-container {
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
}

/* Header */

.premium-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.premium-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.premium-title h2 {
  margin: 0;
  color: #333333;
  font-size: 1.5rem;
  font-weight: 700;
}

.premium-title p {
  margin: 4px 0 0;
  color: #777777;
  font-size: 0.9rem;
}

.premium-title .md-icon {
  color: #2e7d32;
  font-size: 30px;
}

/* Header actions */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search */

.search-container {
  display: flex;
  align-items: center;
  width: 320px;
  height: 42px;
  padding: 0 12px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 6px;
}

.search-container:focus-within {
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.12);
}

.search-container .md-icon {
  margin-right: 8px;
  color: #777777;
  font-size: 20px;
}

.search-input {
  flex: 1;
  width: 100%;
  padding: 8px 0;
  color: #333333;
  font-size: 0.9rem;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #999999;
}

.clear-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  color: #777777;
  background: transparent;
  border: none;
  cursor: pointer;
}

.clear-search-button:hover {
  color: #d32f2f;
}

.clear-search-button .md-icon {
  margin: 0;
  font-size: 19px;
}

/* Export button */

.export-button,
.export-btn {
  min-width: 120px;
  min-height: 40px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #2e7d32;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.export-button:hover:not(:disabled),
.export-btn:hover:not(:disabled) {
  background-color: #1b5e20;
}

.export-button:disabled,
.export-btn:disabled {
  background-color: #aaaaaa;
  cursor: not-allowed;
}

.export-button .md-icon,
.export-btn .md-icon {
  margin-right: 6px;
  font-size: 18px;
}

/* Loading and errors */

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

.loading-message .md-icon,
.error-message .md-icon {
  margin-right: 6px;
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

/* Table */

.table-container {
  width: 100%;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #dddddd;
  border-radius: 6px;
}

.premium-table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
  background-color: #ffffff;
}

.premium-table th {
  padding: 14px 16px;
  color: #333333;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  background-color: #f5f5f5;
  border-bottom: 2px solid #dddddd;
}

.premium-table td {
  padding: 12px 16px;
  color: #444444;
  font-size: 0.9rem;
  vertical-align: middle;
  border-bottom: 1px solid #eeeeee;
}

.premium-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.premium-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.premium-table tbody tr:hover {
  background-color: #e8f5e9;
}

.premium-table tbody tr.row-selected {
  background-color: #c8e6c9;
}

.premium-table tbody tr:last-child td {
  border-bottom: none;
}

/* Profile image */

.profile-image {
  display: block;
  width: 42px;
  height: 42px;
  object-fit: cover;
  background-color: #eeeeee;
  border: 1px solid #cccccc;
  border-radius: 50%;
}

/* Empty state */

.no-results {
  padding: 30px 20px;
  color: #777777;
  font-size: 1rem;
  text-align: center;
}

.no-results .md-icon {
  display: block;
  margin: 0 auto 8px;
  color: #999999;
  font-size: 38px;
}

.no-results p {
  margin: 0;
}

/* Pagination footer */

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
}

.showing-range {
  color: #777777;
  font-size: 0.9rem;
  white-space: nowrap;
}

/*
 * Pagination.vue is a child component.
 * The deep selector is needed because this
 * component uses scoped CSS.
 */

::v-deep .pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
}

::v-deep .pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

::v-deep .pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  color: #333333;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 5px;
  cursor: pointer;
}

::v-deep .pagination-btn:hover:not(:disabled) {
  color: #ffffff;
  background-color: #2e7d32;
  border-color: #2e7d32;
}

::v-deep .pagination-btn:disabled {
  color: #999999;
  background-color: #eeeeee;
  cursor: not-allowed;
  opacity: 0.7;
}

::v-deep .page-numbers {
  display: flex;
  align-items: center;
  gap: 5px;
}

::v-deep .page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #333333;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 5px;
  cursor: pointer;
}

::v-deep .page-number:hover {
  color: #ffffff;
  background-color: #43a047;
  border-color: #43a047;
}

::v-deep .page-number.active {
  color: #ffffff;
  background-color: #2e7d32;
  border-color: #2e7d32;
}

/*
 * Support Pagination.vue implementations
 * that use ordinary button elements.
 */

::v-deep .pagination button {
  min-width: 38px;
  min-height: 38px;
  padding: 6px 10px;
  color: #333333;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 5px;
  cursor: pointer;
}

::v-deep .pagination button:hover:not(:disabled) {
  color: #ffffff;
  background-color: #2e7d32;
  border-color: #2e7d32;
}

::v-deep .pagination button:disabled {
  color: #999999;
  background-color: #eeeeee;
  cursor: not-allowed;
  opacity: 0.7;
}

::v-deep .pagination button.active {
  color: #ffffff;
  background-color: #2e7d32;
  border-color: #2e7d32;
}

/* Tablet */

@media screen and (max-width: 900px) {
  .premium-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .search-container {
    flex: 1;
    width: auto;
  }
}

/* Mobile */

@media screen and (max-width: 600px) {
  .premium-container {
    padding: 12px;
  }

  .premium-title h2 {
    font-size: 1.2rem;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }

  .export-button,
  .export-btn {
    width: 100%;
  }

  .premium-table {
    min-width: 700px;
  }

  .premium-table th,
  .premium-table td {
    padding: 11px 12px;
  }

  .table-footer {
    align-items: center;
    flex-direction: column;
  }

  .showing-range {
    width: 100%;
    text-align: center;
  }

  ::v-deep .pagination {
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }

  ::v-deep .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  ::v-deep .page-numbers {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>



