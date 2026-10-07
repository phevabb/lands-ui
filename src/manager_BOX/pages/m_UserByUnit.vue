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

import Pagination from "../../components/Pagination.vue";

import api, {
  DEFAULT_AVATAR,
  manager_users_per_department,
  manager_users_per_department_no_pages
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

const PAGE_SIZE =
  10;


const numberedUsers =
  computed(() => {
    return users.value.map(
      (
        staff,
        index
      ) => {
        return {
          ...staff,

          tableRowNumber:
            (
              (
                currentPage.value -
                1
              ) *
              PAGE_SIZE
            ) +
            index +
            1
        };
      }
    );
  });

const filteredUsers =
  computed(() => {
    const query =
      searchQuery.value
        .trim()
        .toLowerCase();

    if (!query) {
      return numberedUsers.value;
    }

    return numberedUsers.value.filter(
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
              value ??
              ""
            )
              .toLowerCase()
              .includes(
                query
              );
          }
        );
      }
    );
  });




const paginationStart =
  computed(() => {
    if (
      users.value.length ===
      0
    ) {
      return 0;
    }

    return (
      (
        currentPage.value -
        1
      ) *
      PAGE_SIZE
    ) + 1;
  });

const paginationEnd =
  computed(() => {
    if (
      users.value.length ===
      0
    ) {
      return 0;
    }

    return Math.min(
      paginationStart.value +
        users.value.length -
        1,

      totalCount.value
    );
  });

const showingRange =
  computed(() => {
    if (
      totalCount.value ===
      0
    ) {
      return "Showing 0 records";
    }

    return (
      `Showing ${paginationStart.value} ` +
      `to ${paginationEnd.value} ` +
      `of ${totalCount.value} records`
    );
  });

const pageSummary =
  computed(() => {
    return (
      `Page ${currentPage.value} ` +
      `of ${totalPages.value}`
    );
  });

function rowNumber(
  index
) {
  return (
    (
      currentPage.value -
      1
    ) *
    PAGE_SIZE
  ) + index + 1;
}





const canExport =
  computed(() => {
    return (
      usersNoPages.value.length >
      0
    );
  });

onMounted(async () => {
  await loadPageData();
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

    await loadPageData();
  }
);

async function loadPageData() {
  const departmentName =
    getDepartmentFromRoute();

  if (!departmentName) {
    resetPageData();

    errorMessage.value =
      "A department or staff category is required.";

    isLoading.value =
      false;

    return;
  }

  isLoading.value =
    true;

  errorMessage.value =
    "";

  dept.value =
    departmentName;

  currentPage.value =
    1;

  try {
    const paginatedResponse =
      await manager_users_per_department(
        departmentName,
        {
          page:
            1,

          page_size:
            PAGE_SIZE
        }
      );

    applyPaginatedResponse(
      paginatedResponse?.data,
      1
    );

    console.log(
      "Manager filtered staff page loaded:",
      {
        department:
          dept.value,

        filterType:
          filterType.value,

        currentPage:
          currentPage.value,

        totalPages:
          totalPages.value,

        totalCount:
          totalCount.value,

        pageUsers:
          users.value.length
      }
    );
  } catch (error) {
    resetPageData();

    console.error(
      "Unable to load filtered staff page:",
      {
        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );

    errorMessage.value =
      getErrorMessage(
        error
      );

    return;
  } finally {
    isLoading.value =
      false;
  }

  /*
   * Load export records separately.
   * Failure here must not empty the table.
   */
  try {
    const nonPaginatedResponse =
      await manager_users_per_department_no_pages(
        departmentName
      );

    applyNonPaginatedResponse(
      nonPaginatedResponse?.data
    );
  } catch (error) {
    usersNoPages.value = [];

    console.error(
      "Unable to preload export records:",
      {
        status:
          error.response?.status,

        response:
          error.response?.data,

        message:
          error.message
      }
    );
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
      await manager_users_per_department(
        departmentName,
        {
          page:
            requestedPage,

          page_size:
            PAGE_SIZE
        }
      );

    applyPaginatedResponse(
      response?.data,
      requestedPage
    );
  } catch (error) {
    console.error(
      "Unable to load filtered staff page:",
      error.response?.data ||
      error.message ||
      error
    );

    users.value = [];

    errorMessage.value =
      getErrorMessage(
        error
      );
  } finally {
    isLoading.value = false;
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
    );

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
        PAGE_SIZE
      )
    );

  currentPage.value =
    Math.min(
      normalizePage(
        requestedPage
      ),
      totalPages.value
    );

  selectedRow.value =
    null;

  console.log(
    "Filtered staff page applied"
  );

  console.log(
    "Department:",
    dept.value
  );

  console.log(
    "Current page:",
    currentPage.value
  );

  console.log(
    "Page size:",
    PAGE_SIZE
  );

  console.log(
    "Total pages:",
    totalPages.value
  );

  console.log(
    "Total records:",
    totalCount.value
  );

  console.log(
    "Records on current page:",
    users.value.length
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

  const results =
    data.results &&
    typeof data.results ===
      "object"
      ? data.results
      : {};

  const records =
    Array.isArray(data.users)
      ? data.users
      : Array.isArray(
          results.users
        )
        ? results.users
        : Array.isArray(data)
          ? data
          : [];

  usersNoPages.value =
    records.map(
      normalizeAccount
    );

  console.log(
    "Non-paginated filtered staff applied:",
    {
      department:
        dept.value,

      records:
        usersNoPages.value.length
    }
  );
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
      ).trim(),

    firstName:
      String(
        account.firstName ??
        account.first_name ??
        ""
      ).trim(),

    middleName:
      String(
        account.middleName ??
        account.middle_name ??
        ""
      ).trim(),

    lastName:
      String(
        account.lastName ??
        account.last_name ??
        ""
      ).trim(),

    fullName:
      String(
        account.fullName ??
        account.full_name ??
        createFullName(
          account
        ) ??
        ""
      ).trim(),

    phoneNumber:
      String(
        account.phoneNumber ??
        account.phone_number ??
        ""
      ).trim(),

    supervisorName:
      String(
        account.supervisorName ??
        account.supervisor_name ??
        ""
      ).trim(),

    email:
      String(
        account.email ??
        ""
      ).trim(),

    profilePictureUrl:
      account.profilePictureUrl ??
      account.profile_picture_url ??
      account.profilePicture ??
      account.profile_picture ??
      null,

    directorateName:
      String(
        account.directorateName ??
        account.directorate_name ??
        account.directorate ??
        ""
      ).trim(),

    categoryName:
      String(
        account.categoryName ??
        account.category_name ??
        account.category ??
        ""
      ).trim(),

    districtName:
      String(
        account.districtName ??
        account.district_name ??
        account.district ??
        ""
      ).trim(),

    regionName:
      String(
        account.regionName ??
        account.region_name ??
        account.region ??
        ""
      ).trim(),

    currentGradeName:
      String(
        account.currentGradeName ??
        account.current_grade_name ??
        account.current_grade ??
        ""
      ).trim(),

    managementUnitCostCentreName:
      String(
        account.managementUnitCostCentreName ??
        account.management_unit_cost_centre_name ??
        account.management_unit_cost_centre ??
        ""
      ).trim()
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
          String(value).trim() !==
            ""
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
    .join(
      " "
    );
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
      "Cannot open staff details because the database account ID is missing:",
      staff
    );

    return;
  }

  selectedRow.value =
    staff;

  console.log(
    "Opening Manager staff details:",
    accountId
  );

  router.push({
    name:
      "Manager Staff Details",

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

  if (!picture) {
    return DEFAULT_AVATAR;
  }

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

  if (
    picture.startsWith(
      "//"
    )
  ) {
    return `https:${picture}`;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ??
      ""
    ).replace(
      /\/+$/,
      ""
    );

  const picturePath =
    picture.replace(
      /^\/+/,
      ""
    );

  if (!baseUrl) {
    return `/${picturePath}`;
  }

  return `${baseUrl}/${picturePath}`;
}



async function exportExcel() {
  if (exportLoading.value) {
    return;
  }

  exportLoading.value = true;

  try {
    let exportUsers =
      usersNoPages.value;

    if (
      exportUsers.length === 0 &&
      dept.value
    ) {
      const response =
        await manager_users_per_department_no_pages(
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

    const file =
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
      file,
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
  const normalizedValue =
    Number(value);

  return (
    Number.isFinite(
      normalizedValue
    ) &&
    normalizedValue >= 0
  )
    ? normalizedValue
    : 0;
}

function normalizeAccountId(
  value
) {
  const normalizedValue =
    Number(value);

  return (
    Number.isInteger(
      normalizedValue
    ) &&
    normalizedValue > 0
  )
    ? normalizedValue
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
      "Manager access is required."
    );
  }

  return (
    error.response?.data?.detail ||
    "Something went wrong while fetching staff data."
  );
}

function resetPageData() {
  users.value = [];
  usersNoPages.value = [];
  dept.value = "";
  filterType.value = "";
  totalCount.value = 0;
  currentPage.value = 1;
  totalPages.value = 1;
  next.value = null;
  previous.value = null;
  selectedRow.value = null;
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
        </div>
      </div>

      <div class="header-actions">
        <div class="search-container">
          <md-icon>
            search
          </md-icon>

          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by Staff ID or name..."
            aria-label="Search filtered staff"
          />

          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-button"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <md-icon>
              close
            </md-icon>
          </button>
        </div>

        <md-button
          class="md-dense md-primary export-button"
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

        <p>
          Loading users...
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="error-message"
      >
        <md-icon>
          error_outline
        </md-icon>

        <span>
          {{ errorMessage }}
        </span>
      </div>

      <template v-else>
        <div class="table-wrapper">
          <table class="premium-table">


           <thead>
  <tr>
    <th class="number-column">
      #
    </th>

    <th>
      Picture
    </th>

    <th>
      Staff ID
    </th>

    <th>
      Full Name
    </th>

    <th>
      Contact
    </th>

    <th>
      Supervisor's Name
    </th>
  </tr>
</thead>
<tbody>
  <tr
    v-for="(staff, index) in filteredUsers"
    :key="
      staff.id ||
      staff.userId
    "
    :class="{
      'row-selected':
        selectedRow?.id ===
        staff.id
    }"
    class="staff-row"
    role="button"
    tabindex="0"
    :aria-label="
      `Open ${staff.fullName || staff.userId || 'staff'}`
    "
    @click="selectRow(staff)"
    @keydown.enter="
      selectRow(staff)
    "
    @keydown.space.prevent="
      selectRow(staff)
    "
  >
    <td class="number-cell">
      <span class="row-number">
        {{ rowNumber(index) }}
      </span>
    </td>

    <td>
      <img
        :src="
          getProfilePictureSrc(
            staff.profilePictureUrl
          )
        "
        :alt="
          staff.fullName ||
          'Profile image'
        "
        class="profile-image"
      />
    </td>

    <td>
      {{
        staff.userId ||
        "N/A"
      }}
    </td>

    <td>
      {{
        staff.fullName ||
        "N/A"
      }}
    </td>

    <td>
      {{
        staff.phoneNumber ||
        "N/A"
      }}
    </td>

    <td>
      {{
        staff.supervisorName ||
        "N/A"
      }}
    </td>
  </tr>
  
</tbody>


          </table>
        </div>

        <div
          v-if="
            filteredUsers.length ===
            0
          "
          class="no-results"
        >
          <md-icon>
            person_search
          </md-icon>

          <p v-if="searchQuery">
            No staff records match
            "{{ searchQuery }}".
          </p>

          <p v-else>
            No staff records were found for
            {{ dept }}.
          </p>
        </div>

     <div
  v-if="
    totalCount > 0 &&
    filteredUsers.length > 0
  "
  class="table-footer"
>
  <div class="pagination-information">
    <span class="showing-range">
      {{ showingRange }}
    </span>

    <span class="page-summary">
      {{ pageSummary }}
    </span>
  </div>

  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    @page-changed="fetchUsers"
  />
</div>
        
      </template>
    </div>
  </div>
</template>








<style scoped>


.number-column {
  width: 72px;
  text-align: center;
}

.number-cell {
  width: 72px;
  text-align: center;
}

.row-number {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4338ca;
  font-size: 14px;
  font-weight: 800;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  background: #eef2ff;
}

.table-footer {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  color: #64748b;
  font-size: 15px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-information {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
}

.showing-range {
  color: #475569;
  font-size: 15px;
  font-weight: 600;
}

.page-summary {
  padding: 8px 12px;
  color: #4338ca;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  background: #eef2ff;
}

@media (max-width: 700px) {
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-information {
    justify-content: center;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .pagination-information {
    flex-direction: column;
    gap: 8px;
  }
}



.premium-container {
  width: 100%;
  padding: 20px;
}

.premium-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.premium-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.premium-title h2 {
  margin: 0;
  color: #34495e;
  font-size: 22px;
  font-weight: 600;
}

.premium-title p {
  margin: 4px 0 0;
  color: #7f8c8d;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  width: 300px;
  padding: 4px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background: #ffffff;
}

.search-container .md-icon {
  color: #7f8c8d;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 8px;
  border: none;
  outline: none;
  background: transparent;
}

.clear-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  color: #7f8c8d;
  background: transparent;
  cursor: pointer;
}

.export-button {
  min-width: 120px;
}

.export-button .md-icon {
  margin-right: 6px;
}

.table-container {
  width: 100%;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.premium-table th,
.premium-table td {
  padding: 12px;
  border-bottom: 1px solid #eeeeee;
  text-align: left;
  vertical-align: middle;
}

.premium-table th {
  color: #34495e;
  background: #fafafa;
  font-weight: 600;
}

.staff-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.staff-row:hover {
  background: #f5f9f6;
}

.row-selected {
  background: #e8f5e9;
}

.profile-image {
  width: 44px;
  height: 44px;
  border: 2px solid #eeeeee;
  border-radius: 50%;
  object-fit: cover;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}

.showing-range {
  color: #7f8c8d;
  font-size: 14px;
  white-space: nowrap;
}

.loading-message,
.error-message,
.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 160px;
  padding: 24px;
  text-align: center;
}

.loading-message {
  color: #607d8b;
}

.error-message {
  color: #d32f2f;
}

.no-results {
  flex-direction: column;
  color: #7f8c8d;
}

.no-results p {
  margin: 0;
}

@media screen and (max-width: 768px) {
  .premium-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .search-container {
    width: 100%;
  }

  .table-footer {
    align-items: center;
    flex-direction: column;
  }

  .showing-range {
    width: 100%;
    text-align: center;
  }
}
</style>


