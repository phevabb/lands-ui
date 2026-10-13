



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

import {
  saveAs
} from "file-saver";

import * as XLSX from "xlsx";

import SimpleTableUnit from "@/admin_BOX/pages/SimpleTableUnit.vue";

import {
  users_per_department
} from "../../services/api";

const route =
  useRoute();

const router =
  useRouter();

const users =
  ref([]);

const dept =
  ref("");

const filterType =
  ref("");

const isLoading =
  ref(false);

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

const currentPage =
  ref(1);

const itemsPerPage =
  ref(10);

const totalPages =
  computed(() => {
    return Math.max(
      1,
      Math.ceil(
        totalCount.value /
          itemsPerPage.value
      )
    );
  });

const canExport =
  computed(() => {
    return (
      !isLoading.value &&
      !exportLoading.value &&
      totalCount.value > 0 &&
      Boolean(
        dept.value
      )
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

    currentPage.value =
      1;

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

    return;
  }

  dept.value =
    departmentName;

  currentPage.value =
    1;

  await fetchUsers(1);
}

async function fetchUsers(
  requestedPage = 1
) {
  if (isLoading.value) {
    return;
  }

  const departmentName =
    dept.value ||
    getDepartmentFromRoute();

  if (!departmentName) {
    errorMessage.value =
      "A department or staff category is required.";

    return;
  }

  const page =
    normalizePage(
      requestedPage
    );

  isLoading.value =
    true;

  errorMessage.value =
    "";

  try {
    const response =
      await users_per_department(
        departmentName,
        {
          page,

          page_size:
            itemsPerPage.value
        }
      );

    applyPaginatedResponse(
      response?.data,
      page
    );
  } catch (error) {
    console.error(
      "Unable to retrieve filtered staff:",
      error?.response?.data ||
        error?.message ||
        error
    );

    errorMessage.value =
      getErrorMessage(
        error
      );
  } finally {
    isLoading.value =
      false;
  }
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

  const responseUsers =
    Array.isArray(
      results.users
    )
      ? results.users
      : [];

  users.value =
    responseUsers.map(account => {
      return normalizeAccount(
        account
      );
    });

  const responseDepartment =
    results.dept ??
    dept.value;

  dept.value =
    String(
      responseDepartment ?? ""
    ).trim();

  filterType.value =
    String(
      results.filterType ??
      results.filter_type ??
      ""
    ).trim();

  totalCount.value =
    normalizeCount(
      data.count ??
      results.count
    );

  next.value =
    typeof data.next ===
      "string" &&
    data.next.trim()
      ? data.next
      : null;

  previous.value =
    typeof data.previous ===
      "string" &&
    data.previous.trim()
      ? data.previous
      : null;

  currentPage.value =
    Math.min(
      normalizePage(
        requestedPage
      ),
      totalPages.value
    );
}

function normalizeAccount(
  account
) {
  const source =
    account &&
    typeof account ===
      "object"
      ? account
      : {};

  return {
    id:
      normalizeAccountId(
        source.id ??
        source.accountId ??
        source.account_id
      ),

    userId:
      String(
        source.userId ??
        source.user_id ??
        ""
      ).trim(),

    firstName:
      String(
        source.firstName ??
        source.first_name ??
        ""
      ).trim(),

    fullName:
      String(
        source.fullName ??
        source.full_name ??
        createFullName(
          source
        )
      ).trim(),

    phoneNumber:
      String(
        source.phoneNumber ??
        source.phone_number ??
        ""
      ).trim(),

    profilePictureUrl:
      source.profilePictureUrl ??
      source.profile_picture_url ??
      source.profilePicture ??
      source.profile_picture ??
      null
  };
}

function createFullName(
  account
) {
  const nameParts = [
    account.firstName ??
      account.first_name,

    account.middleName ??
      account.middle_name,

    account.lastName ??
      account.last_name
  ];

  return nameParts
    .filter(value => {
      if (
        value === null ||
        value === undefined
      ) {
        return false;
      }

      return (
        String(value).trim() !==
        ""
      );
    })
    .map(value => {
      return String(
        value
      ).trim();
    })
    .join(" ");
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

async function exportExcel() {
  if (
    exportLoading.value ||
    !dept.value ||
    totalCount.value <= 0
  ) {
    return;
  }

  exportLoading.value =
    true;

  errorMessage.value =
    "";

  try {
    const exportUsers =
      await loadAllPagesForExport();

    if (
      exportUsers.length ===
      0
    ) {
      errorMessage.value =
        "No staff records are available to export.";

      return;
    }

    const exportData =
      exportUsers.map(staff => {
        return {
          "Account ID":
            staff.id ?? "",

          "Staff ID":
            staff.userId || "",

          "First Name":
            staff.firstName || "",

          "Full Name":
            staff.fullName || "",

          "Phone Number":
            staff.phoneNumber || ""
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
      `${createFileName(
        dept.value
      )}.xlsx`
    );
  } catch (error) {
    console.error(
      "Unable to export filtered staff:",
      error?.response?.data ||
        error?.message ||
        error
    );

    errorMessage.value =
      getErrorMessage(
        error
      );
  } finally {
    exportLoading.value =
      false;
  }
}

async function loadAllPagesForExport() {
  const exportPageSize =
    100;

  const firstResponse =
    await users_per_department(
      dept.value,
      {
        page:
          1,

        page_size:
          exportPageSize
      }
    );

  const firstResponseData =
    firstResponse?.data || {};

  const firstResults =
    firstResponseData.results &&
    typeof firstResponseData.results ===
      "object"
      ? firstResponseData.results
      : {};

  const firstPageRecords =
    Array.isArray(
      firstResults.users
    )
      ? firstResults.users
      : [];

  const firstPageUsers =
    firstPageRecords.map(account => {
      return normalizeAccount(
        account
      );
    });

  const exportTotalCount =
    normalizeCount(
      firstResponseData.count ??
      firstResults.count
    );

  const exportTotalPages =
    Math.max(
      1,
      Math.ceil(
        exportTotalCount /
          exportPageSize
      )
    );

  const allUsers = [
    ...firstPageUsers
  ];

  for (
    let page = 2;
    page <= exportTotalPages;
    page += 1
  ) {
    const response =
      await users_per_department(
        dept.value,
        {
          page,

          page_size:
            exportPageSize
        }
      );

    const responseData =
      response?.data || {};

    const results =
      responseData.results &&
      typeof responseData.results ===
        "object"
        ? responseData.results
        : {};

    const pageRecords =
      Array.isArray(
        results.users
      )
        ? results.users
        : [];

    const pageUsers =
      pageRecords.map(account => {
        return normalizeAccount(
          account
        );
      });

    allUsers.push(
      ...pageUsers
    );
  }

  const uniqueUsers =
    new Map();

  allUsers.forEach(account => {
    if (account.id !== null) {
      uniqueUsers.set(
        account.id,
        account
      );
    }
  });

  return Array.from(
    uniqueUsers.values()
  );
}

function handleExportError(
  message
) {
  errorMessage.value =
    String(
      message ||
      "Unable to process the staff records."
    );
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
      String(
        queryValue
      )
    ).trim();
  } catch (error) {
    return String(
      queryValue
    ).trim();
  }
}

function normalizePage(
  page
) {
  const normalizedPage =
    Number(page);

  if (
    !Number.isInteger(
      normalizedPage
    ) ||
    normalizedPage <= 0
  ) {
    return 1;
  }

  return normalizedPage;
}

function normalizeCount(
  value
) {
  const count =
    Number(value);

  if (
    !Number.isFinite(
      count
    ) ||
    count < 0
  ) {
    return 0;
  }

  return count;
}

function normalizeAccountId(
  value
) {
  const accountId =
    Number(value);

  if (
    !Number.isInteger(
      accountId
    ) ||
    accountId <= 0
  ) {
    return null;
  }

  return accountId;
}

function createWorksheetName(
  value
) {
  const invalidCharacters =
    new RegExp(
      "[\\\\/?\\x2A\\[\\]:]",
      "g"
    );

  const name =
    String(
      value ||
      "Staff"
    )
      .replace(
        invalidCharacters,
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
    error?.message?.includes(
      "Network Error"
    ) ||
    error?.code ===
      "ERR_NETWORK"
  ) {
    return (
      "Please check your internet " +
      "connection."
    );
  }

  if (
    error?.response?.status ===
      400
  ) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.dept?.[0] ||
      "A valid filter is required."
    );
  }

  if (
    error?.response?.status ===
      401
  ) {
    return (
      error.response?.data?.detail ||
      "Authentication is required."
    );
  }

  if (
    error?.response?.status ===
      403
  ) {
    return (
      error.response?.data?.detail ||
      "Access is denied."
    );
  }

  if (
    error?.response?.status ===
      404
  ) {
    return (
      error.response?.data?.detail ||
      "The requested staff records were not found."
    );
  }

  if (
    error?.response?.status >=
      500
  ) {
    return (
      error.response?.data?.detail ||
      "The server could not retrieve the staff records."
    );
  }

  return (
    error?.response?.data?.detail ||
    error?.message ||
    "Something went wrong while fetching staff data."
  );
}

function resetPage() {
  users.value =
    [];

  dept.value =
    "";

  filterType.value =
    "";

  totalCount.value =
    0;

  next.value =
    null;

  previous.value =
    null;

  currentPage.value =
    1;

  errorMessage.value =
    "";
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

      <SimpleTableUnit
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



