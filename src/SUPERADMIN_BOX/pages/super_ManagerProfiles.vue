<template>
  <div class="manager-profiles-page">
    <section class="manager-profiles-header">
      <div class="manager-profiles-header-content">
        <div class="manager-profiles-header-icon">
          <md-icon>supervisor_account</md-icon>
        </div>

        <div class="manager-profiles-header-text">
          <span class="manager-profiles-header-label">
            ACCOUNT MANAGEMENT
          </span>

          <h1 class="manager-profiles-header-title">
            Manager Profiles
          </h1>

          <p class="manager-profiles-header-description">
            Assign manager accounts to regions and manage existing
            regional manager assignments.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="manager-profiles-header-button"
        :disabled="loading"
        @click="openCreateModal"
      >
        <md-icon>person_add</md-icon>
        <span>Assign Manager</span>
      </button>
    </section>

    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>supervisor_account</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ managerProfiles.length }}
          </span>

          <span class="statistic-label">
            Manager Profiles
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>check_circle</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ activeManagersCount }}
          </span>

          <span class="statistic-label">
            Active Managers
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-purple">
          <md-icon>map</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ assignedRegionsCount }}
          </span>

          <span class="statistic-label">
            Assigned Regions
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-warning">
          <md-icon>person_search</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ availableAccounts.length }}
          </span>

          <span class="statistic-label">
            Available Accounts
          </span>
        </div>
      </div>
    </section>

    <section class="records-card">
      <div class="records-toolbar">
        <div class="records-heading">
          <h2>Regional Manager Assignments</h2>

          <p>
            View and manage accounts assigned as regional managers.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search manager, user ID or region..."
              aria-label="Search manager profiles"
            />

            <button
              v-if="search"
              type="button"
              class="clear-search-button"
              title="Clear search"
              @click="clearSearch"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading || refreshing"
            @click="refreshManagerProfiles"
          >
            <md-icon
              :class="{
                rotating: loading || refreshing
              }"
            >
              refresh
            </md-icon>

            <span>
              {{
                loading || refreshing
                  ? "Refreshing..."
                  : "Refresh"
              }}
            </span>
          </button>
        </div>
      </div>

      <div class="records-divider"></div>

      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>error_outline</md-icon>

          <div>
            <strong>
              Unable to load manager profiles
            </strong>

            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="loadPageData"
        >
          Try Again
        </button>
      </div>

      <div
        v-if="loading && !managerProfiles.length"
        class="loading-state"
      >
        <div class="loading-spinner"></div>

        <h3>Loading manager profiles</h3>

        <p>
          Please wait while manager assignments are retrieved.
        </p>
      </div>

      <div
        v-else-if="paginatedManagerProfiles.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                Manager
              </th>

              <th>
                User ID
              </th>

              <th>
                Role
              </th>

              <th>
                Region
              </th>

              <th>
                Account Status
              </th>

              <th class="identifier-column">
                Profile ID
              </th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(profile, index) in paginatedManagerProfiles"
              :key="profile.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="manager-cell">
                  <div class="manager-avatar">
                    {{ getInitials(profile) }}
                  </div>

                  <div class="manager-information">
                    <span class="manager-name">
                      {{
                        profile.displayName ||
                        profile.fullName ||
                        profile.userId ||
                        "Unnamed Manager"
                      }}
                    </span>

                    <span class="manager-description">
                      Regional manager profile
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="user-id-badge">
                  {{ profile.userId || "Not assigned" }}
                </span>
              </td>

              <td>
                <span
                  class="role-badge"
                  :class="getRoleClass(profile.role)"
                >
                  {{ profile.role || "No role" }}
                </span>
              </td>

              <td>
                <div class="region-cell">
                  <md-icon>location_on</md-icon>

                  <span>
                    {{ profile.regionName || "Unknown region" }}
                  </span>
                </div>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{
                    active: profile.isActive,
                    inactive: !profile.isActive
                  }"
                >
                  <span class="status-dot"></span>

                  {{
                    profile.isActive
                      ? "Active"
                      : "Inactive"
                  }}
                </span>
              </td>

              <td>
                <span class="record-id">
                  #{{ profile.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button view-button"
                    title="View manager profile"
                    @click="openDetailsModal(profile)"
                  >
                    <md-icon>visibility</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit manager profile"
                    :disabled="deletingId === profile.id"
                    @click="openEditModal(profile)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete manager profile"
                    :disabled="deletingId === profile.id"
                    @click="deleteManagerProfile(profile)"
                  >
                    <span
                      v-if="deletingId === profile.id"
                      class="small-spinner"
                    ></span>

                    <md-icon v-else>
                      delete_outline
                    </md-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="empty-state"
      >
        <div class="empty-state-icon">
          <md-icon>
            {{
              search
                ? "person_search"
                : "supervisor_account"
            }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching manager profile found"
              : "No manager profiles created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with another manager, user ID, or region."
              : "Assign an account to a region to create a manager profile."
          }}
        </p>

        <button
          v-if="search"
          type="button"
          class="empty-secondary-button"
          @click="clearSearch"
        >
          Clear Search
        </button>

        <button
          v-else
          type="button"
          class="empty-primary-button"
          @click="openCreateModal"
        >
          <md-icon>person_add</md-icon>
          <span>Assign Manager</span>
        </button>
      </div>

      <div
        v-if="filteredManagerProfiles.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredManagerProfiles.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="manager-profile-page-size">
            Rows:
          </label>

          <select
            id="manager-profile-page-size"
            v-model.number="pageSize"
            @change="currentPage = 1"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>

          <button
            type="button"
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            <md-icon>chevron_left</md-icon>
          </button>

          <span class="pagination-page">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            type="button"
            class="pagination-button"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <md-icon>chevron_right</md-icon>
          </button>
        </div>
      </div>
    </section>

    <transition name="modal-fade">
      <div
        v-if="showDetailsModal && selectedProfile"
        class="modal-overlay"
        @click.self="closeDetailsModal"
      >
        <div class="details-modal">
          <div class="modal-header">
            <div class="modal-header-icon">
              <md-icon>supervisor_account</md-icon>
            </div>

            <div class="modal-heading">
              <span class="modal-label">
                MANAGER PROFILE
              </span>

              <h2>
                {{
                  selectedProfile.fullName ||
                  selectedProfile.userId
                }}
              </h2>

              <p>
                {{ selectedProfile.regionName }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close-button"
              @click="closeDetailsModal"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <div class="details-modal-body">
            <div class="details-grid">
              <div class="detail-item">
                <span>Manager Profile ID</span>
                <strong>#{{ selectedProfile.id }}</strong>
              </div>

              <div class="detail-item">
                <span>Account ID</span>
                <strong>#{{ selectedProfile.accountId }}</strong>
              </div>

              <div class="detail-item">
                <span>User ID</span>
                <strong>
                  {{ selectedProfile.userId || "Not provided" }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Full Name</span>
                <strong>
                  {{ selectedProfile.fullName || "Not provided" }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Role</span>
                <strong>
                  {{ selectedProfile.role || "Not provided" }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Region</span>
                <strong>
                  {{ selectedProfile.regionName }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Region ID</span>
                <strong>
                  #{{ selectedProfile.regionId }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Account Status</span>
                <strong>
                  {{
                    selectedProfile.isActive
                      ? "Active"
                      : "Inactive"
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Staff Account</span>
                <strong>
                  {{
                    selectedProfile.isStaff
                      ? "Yes"
                      : "No"
                  }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Superuser</span>
                <strong>
                  {{
                    selectedProfile.isSuperuser
                      ? "Yes"
                      : "No"
                  }}
                </strong>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="cancel-button"
              @click="closeDetailsModal"
            >
              Close
            </button>

            <button
              type="button"
              class="save-button"
              @click="editSelectedProfile"
            >
              <md-icon>edit</md-icon>
              <span>Edit Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </transition>




<transition name="modal-fade">
  <div
    v-if="showFormModal"
    class="modal-overlay"
    @click.self="closeFormModal"
  >
    <div class="manager-profile-modal">
      <div class="modal-header">
        <div class="modal-header-icon">
          <md-icon>
            {{
              editingId !== null
                ? "edit"
                : "person_add"
            }}
          </md-icon>
        </div>

        <div class="modal-heading">
          <span class="modal-label">
            REGIONAL MANAGER
          </span>

          <h2>{{ modalTitle }}</h2>

          <p>{{ modalDescription }}</p>
        </div>

        <button
          type="button"
          class="modal-close-button"
          :disabled="saving"
          @click="closeFormModal"
        >
          <md-icon>close</md-icon>
        </button>
      </div>

      <form
        novalidate
        @submit.prevent="saveManagerProfile"
      >
        <div class="modal-body">
          <div class="form-section-heading">
            <div class="form-section-icon">
              <md-icon>person_search</md-icon>
            </div>

            <div>
              <h3>
                Select Manager Account
              </h3>

              <p>
                Search and select an account with the Manager role.
              </p>
            </div>
          </div>

          <div class="form-group">
            <label for="manager-account-search">
              Search Manager
            </label>

            <div class="manager-search-control">
              <md-icon>search</md-icon>

              <input
                id="manager-account-search"
                ref="managerSearchInput"
                v-model.trim="managerSearch"
                type="text"
                autocomplete="off"
                placeholder="Search by name or user ID..."
                :disabled="saving || optionsLoading"
                @keydown.esc="managerSearch = ''"
              />

              <button
                v-if="managerSearch"
                type="button"
                class="clear-manager-search-button"
                title="Clear manager search"
                :disabled="saving || optionsLoading"
                @click="clearManagerSearch"
              >
                <md-icon>close</md-icon>
              </button>
            </div>
          </div>

    <div class="manager-search-summary">
  <span v-if="optionsLoading">
    Loading manager accounts...
  </span>

  <template v-else>
    <span>
      {{ filteredSelectableAccounts.length }}
      manager account(s) available
    </span>

    <span v-if="managerSearch">
      for "{{ managerSearch }}"
    </span>
  </template>
</div>
          <div class="form-group">
            <label for="manager-account-id">
              Manager Account
              <span>*</span>
            </label>

            <select
  id="manager-account-id"
  ref="accountInput"
  v-model.number="form.accountId"
  :disabled="
    saving ||
    optionsLoading ||
    !selectableAccounts.length
  "
  @change="handleManagerSelection"
>
              <option :value="null">
                {{
                  optionsLoading
                    ? "Loading manager accounts..."
                    : "Select manager account"
                }}
              </option>

              <option
                v-for="account in filteredSelectableAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ getAccountOptionLabel(account) }}
              </option>
            </select>

            <span
              v-if="
                formSubmitted &&
                accountError
              "
              class="field-error"
            >
              {{ accountError }}
            </span>

            <span
              v-if="
                !optionsLoading &&
                managerSearch &&
                !filteredSelectableAccounts.length
              "
              class="field-information"
            >
              No available manager account matches
              "{{ managerSearch }}".
            </span>

            <span
              v-else-if="
                !optionsLoading &&
                !managerSearch &&
                !selectableAccounts.length
              "
              class="field-information"
            >
              No available accounts with the Manager role were found.
              Accounts that already have manager profiles are excluded.
            </span>
          </div>

          <div class="selected-account-card">
            <template v-if="selectedAccount">
              <div class="selected-account-avatar">
                {{ getInitials(selectedAccount) }}
              </div>

              <div class="selected-account-information">
                <strong>
                  {{
                    selectedAccount.fullName ||
                    selectedAccount.displayName ||
                    selectedAccount.userId
                  }}
                </strong>

                <span>
                  {{ selectedAccount.userId || "No user ID" }}
                  •
                  {{ selectedAccount.role || "No role" }}
                </span>
              </div>

              <span
                class="status-badge"
                :class="{
                  active: selectedAccount.isActive,
                  inactive: !selectedAccount.isActive
                }"
              >
                <span class="status-dot"></span>

                {{
                  selectedAccount.isActive
                    ? "Active"
                    : "Inactive"
                }}
              </span>
            </template>

            <template v-else>
              <md-icon>person_search</md-icon>

              <span>
                Select a manager account to view the account details.
              </span>
            </template>
          </div>

          <div class="form-section-divider"></div>

          <div class="form-section-heading">
            <div class="form-section-icon">
              <md-icon>location_on</md-icon>
            </div>

            <div>
              <h3>
                Assign Region
              </h3>

              <p>
                Select the region assigned to this manager.
              </p>
            </div>
          </div>

          <div class="form-group">
            <label for="manager-region-id">
              Assigned Region
              <span>*</span>
            </label>

            <select
              id="manager-region-id"
              v-model.number="form.regionId"
              :disabled="
                saving ||
                optionsLoading ||
                !regions.length
              "
              @change="formError = ''"
            >
              <option :value="null">
                {{
                  optionsLoading
                    ? "Loading regions..."
                    : "Select region"
                }}
              </option>

              <option
                v-for="regionItem in regions"
                :key="regionItem.id"
                :value="regionItem.id"
              >
                {{ regionItem.region }}
              </option>
            </select>

                        <span
              v-if="
                formSubmitted &&
                regionError
              "
              class="field-error"
            >
              {{ regionError }}
            </span>

            <span
              v-if="
                !optionsLoading &&
                !regions.length
              "
              class="field-information"
            >
              No regions are available.
            </span>
          </div>

          <div class="form-hint">
            <md-icon>info_outline</md-icon>

            <span>
              Only accounts with the Manager role are displayed.
              Each account can have only one manager profile,
              while a region may have multiple managers.
            </span>
          </div>

          <div
            v-if="optionsLoading"
            class="lookup-loading-message"
          >
            <span class="inline-spinner"></span>

            <span>
              Loading manager accounts and regions...
            </span>
          </div>

          <div
            v-if="formError"
            class="modal-error"
          >
            <md-icon>error_outline</md-icon>

            <span>
              {{ formError }}
            </span>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="cancel-button"
            :disabled="saving"
            @click="closeFormModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="save-button"
            :disabled="
              saving ||
              optionsLoading ||
              !canSubmitManagerProfile
            "
          >
            <span
              v-if="saving"
              class="button-spinner"
            ></span>

            <md-icon v-else>
              {{
                editingId !== null
                  ? "save"
                  : "person_add"
              }}
            </md-icon>

            <span>
              {{ submitButtonText }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</transition>

  </div>
</template>





<script>
import axios from "axios";
import Swal from "sweetalert2";

// Production API
// const API_BASE_URL =
//   process.env.VUE_APP_API_BASE_URL ||
//   "https://api.stoollands.com/api";

// Local/testing API
const API_BASE_URL =
  "http://127.0.0.1:8888/api";

function createEmptyForm() {
  return {
    accountId: null,
    regionId: null
  };
}

export default {
  name: "SuperManagerProfiles",

  data() {
    return {
        managerSearch: "",


      loading: false,
      refreshing: false,
      saving: false,
      optionsLoading: false,
      deletingId: null,

      showFormModal: false,
      showDetailsModal: false,
      selectedProfile: null,

      editingId: null,
      formSubmitted: false,

      search: "",
      errorMessage: "",
      formError: "",

      managerProfiles: [],
      accounts: [],
      regions: [],

      currentPage: 1,
      pageSize: 10,

      form: createEmptyForm()
    };
  },

  computed: {
    activeManagersCount() {
      return this.managerProfiles.filter(
        profile => profile.isActive
      ).length;
    },

    assignedRegionsCount() {
      return new Set(
        this.managerProfiles.map(
          profile => Number(profile.regionId)
        )
      ).size;
    },

    assignedAccountIds() {
      return new Set(
        this.managerProfiles.map(
          profile => Number(profile.accountId)
        )
      );
    },



managerAccounts() {
  return this.accounts.filter(account => {
    const role =
      account.role
        ? String(account.role)
            .trim()
            .toLowerCase()
        : "";

    return role === "manager";
  });
},

availableAccounts() {
  return this.managerAccounts.filter(account => {
    return !this.assignedAccountIds.has(
      Number(account.id)
    );
  });
},

selectableAccounts() {
  return this.managerAccounts.filter(account => {
    const isCurrentEditingAccount =
      this.editingId !== null &&
      Number(account.id) ===
        Number(this.form.accountId);

    if (isCurrentEditingAccount) {
      return true;
    }

    return !this.assignedAccountIds.has(
      Number(account.id)
    );
  });
},

filteredSelectableAccounts() {
  const searchValue =
    this.managerSearch
      ? this.managerSearch
          .trim()
          .toLowerCase()
      : "";

  if (!searchValue) {
    return this.selectableAccounts;
  }

  return this.selectableAccounts.filter(account => {
    const isSelectedAccount =
      Number(account.id) ===
      Number(this.form.accountId);

    if (isSelectedAccount) {
      return true;
    }

    const searchableValues = [
      account.firstName,
      account.middleName,
      account.lastName,
      account.fullName,
      account.displayName,
      account.userId,
      account.phoneNumber
    ]
      .filter(value => {
        return (
          value !== null &&
          value !== undefined &&
          String(value).trim()
        );
      })
      .map(value => {
        return String(value)
          .trim()
          .toLowerCase();
      });

    return searchableValues.some(value => {
      return value.includes(searchValue);
    });
  });
},


    selectedAccount() {
      if (!this.form.accountId) {
        return null;
      }

      return this.accounts.find(account => {
        return (
          Number(account.id) ===
          Number(this.form.accountId)
        );
      }) || null;
    },

    filteredManagerProfiles() {
      const searchValue =
        this.search.trim().toLowerCase();

      if (!searchValue) {
        return this.managerProfiles;
      }

      return this.managerProfiles.filter(
        profile => {
          const values = [
            profile.userId,
            profile.fullName,
            profile.displayName,
            profile.role,
            profile.regionName
          ]
            .filter(Boolean)
            .map(value => {
              return String(value).toLowerCase();
            });

          return values.some(value => {
            return value.includes(searchValue);
          });
        }
      );
    },

    sortedManagerProfiles() {
      return [
        ...this.filteredManagerProfiles
      ].sort((first, second) => {
        return Number(second.id) -
          Number(first.id);
      });
    },

        totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedManagerProfiles.length /
            this.pageSize
        )
      );
    },

    paginatedManagerProfiles() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      const end =
        start + this.pageSize;

      return this.sortedManagerProfiles.slice(
        start,
        end
      );
    },

    paginationStart() {
      if (
        !this.sortedManagerProfiles.length
      ) {
        return 0;
      }

      return (
        (this.currentPage - 1) *
          this.pageSize +
        1
      );
    },

    paginationEnd() {
      return Math.min(
        this.currentPage *
          this.pageSize,
        this.sortedManagerProfiles.length
      );
    },

    modalTitle() {
      return this.editingId !== null
        ? "Edit Manager Assignment"
        : "Assign Regional Manager";
    },

    modalDescription() {
      return this.editingId !== null
        ? "Update the manager account or assigned region."
        : "Select an account and assign the account to a region.";
    },

 submitButtonText() {
  if (this.saving) {
    return this.editingId !== null
      ? "Updating..."
      : "Assigning...";
  }

  return this.editingId !== null
    ? "Update Assignment"
    : "Assign Manager";
},

canSubmitManagerProfile() {
  return Boolean(
    this.form.accountId !== null &&
    this.form.accountId !== undefined &&
    this.form.accountId !== "" &&
    this.form.regionId !== null &&
    this.form.regionId !== undefined &&
    this.form.regionId !== "" &&
    !this.accountError &&
    !this.regionError
  );
},

accountError() {
  if (
    this.form.accountId === null ||
    this.form.accountId === undefined ||
    this.form.accountId === ""
  ) {
    return "Manager account is required.";
  }

  const selectedManager =
    this.accounts.find(account => {
      return (
        Number(account.id) ===
        Number(this.form.accountId)
      );
    });

  if (!selectedManager) {
    return "The selected account could not be found.";
  }

  const selectedRole =
    selectedManager.role
      ? String(selectedManager.role)
          .trim()
          .toLowerCase()
      : "";

  if (selectedRole !== "manager") {
    return "Only accounts with the Manager role can have manager profiles.";
  }

  const duplicate =
    this.managerProfiles.some(profile => {
      const sameAccount =
        Number(profile.accountId) ===
        Number(this.form.accountId);

      const isDifferentProfile =
        this.editingId === null ||
        Number(profile.id) !==
          Number(this.editingId);

      return (
        sameAccount &&
        isDifferentProfile
      );
    });

  if (duplicate) {
    return "This manager account already has a manager profile.";
  }

  return "";
},

regionError() {
  if (
    this.form.regionId === null ||
    this.form.regionId === undefined ||
    this.form.regionId === ""
  ) {
    return "Region is required.";
  }

  const selectedRegionExists =
    this.regions.some(regionItem => {
      return (
        Number(regionItem.id) ===
        Number(this.form.regionId)
      );
    });

  if (!selectedRegionExists) {
    return "The selected region could not be found.";
  }

  return "";
},



    



canSubmitManagerProfile() {
  return Boolean(
    this.form.accountId !== null &&
    this.form.accountId !== undefined &&
    this.form.accountId !== "" &&
    this.form.regionId !== null &&
    this.form.regionId !== undefined &&
    this.form.regionId !== "" &&
    !this.accountError &&
    !this.regionError
  );
},



accountError() {
  if (
    this.form.accountId === null ||
    this.form.accountId === undefined ||
    this.form.accountId === ""
  ) {
    return "Manager account is required.";
  }

  const selectedManager =
    this.accounts.find(account => {
      return (
        Number(account.id) ===
        Number(this.form.accountId)
      );
    });

  if (!selectedManager) {
    return "The selected account could not be found.";
  }

  const selectedRole =
    selectedManager.role
      ? String(selectedManager.role)
          .trim()
          .toLowerCase()
      : "";

  if (selectedRole !== "manager") {
    return "Only accounts with the Manager role can have manager profiles.";
  }

  const duplicate =
    this.managerProfiles.some(profile => {
      const sameAccount =
        Number(profile.accountId) ===
        Number(this.form.accountId);

      const differentProfile =
        Number(profile.id) !==
        Number(this.editingId);

      return (
        sameAccount &&
        differentProfile
      );
    });

  if (duplicate) {
    return "This manager account already has a manager profile.";
  }

  return "";
},









    regionError() {
      if (
        this.form.regionId === null ||
        this.form.regionId === undefined ||
        this.form.regionId === ""
      ) {
        return "Region is required.";
      }

      const regionExists =
        this.regions.some(region => {
          return (
            Number(region.id) ===
            Number(this.form.regionId)
          );
        });

      if (!regionExists) {
        return "The selected region could not be found.";
      }

      return "";
    }
  },

  watch: {
    search() {
      this.currentPage = 1;
    },

    pageSize() {
      this.currentPage = 1;
    },

    totalPages(value) {
      if (this.currentPage > value) {
        this.currentPage = value;
      }
    },

    showFormModal() {
      this.updateBodyScroll();
    },

    showDetailsModal() {
      this.updateBodyScroll();
    }
  },

  created() {
    this.loadPageData();
  },

  beforeDestroy() {
    document.body.style.overflow = "";
  },

  methods: {
    getRequestConfig() {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem(
          "access_token"
        );

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json"
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      return {
        headers
      };
    },

    updateBodyScroll() {
      const modalOpen =
        this.showFormModal ||
        this.showDetailsModal;

      document.body.style.overflow =
        modalOpen ? "hidden" : "";
    },

    getResponseRecords(
      responseData,
      collectionNames = []
    ) {
      if (Array.isArray(responseData)) {
        return responseData;
      }

      if (
        responseData &&
        Array.isArray(responseData.data)
      ) {
        return responseData.data;
      }

      for (
        const collectionName of
        collectionNames
      ) {
        if (
          responseData &&
          Array.isArray(
            responseData[collectionName]
          )
        ) {
          return responseData[
            collectionName
          ];
        }
      }

      return [];
    },

    normalizeBoolean(
      value,
      fallback = false
    ) {
      if (typeof value === "boolean") {
        return value;
      }

      if (
        value === 1 ||
        value === "1" ||
        value === "true"
      ) {
        return true;
      }

      if (
        value === 0 ||
        value === "0" ||
        value === "false"
      ) {
        return false;
      }

      return fallback;
    },

    normalizeManagerProfile(profile) {
      return {
        ...profile,

        id:
          Number(profile.id),

        accountId:
          Number(profile.accountId),

        regionId:
          Number(profile.regionId),

        fullName:
          profile.fullName || "",

        displayName:
          profile.displayName ||
          profile.fullName ||
          profile.userId ||
          `Manager Profile #${profile.id}`,

        regionName:
          profile.regionName ||
          "Unknown region",

        isActive:
          this.normalizeBoolean(
            profile.isActive,
            true
          ),

        isStaff:
          this.normalizeBoolean(
            profile.isStaff,
            false
          ),

        isSuperuser:
          this.normalizeBoolean(
            profile.isSuperuser,
            false
          )
      };
    },

    normalizeAccount(account) {
      const fullName =
        account.fullName ||
        [
          account.firstName,
          account.middleName,
          account.lastName
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      return {
        ...account,

        id:
          Number(account.id),

        fullName,

        displayName:
          account.displayName ||
          fullName ||
          account.userId ||
          `Account #${account.id}`,

        isActive:
          this.normalizeBoolean(
            account.isActive,
            true
          ),

        isStaff:
          this.normalizeBoolean(
            account.isStaff,
            false
          ),

        isSuperuser:
          this.normalizeBoolean(
            account.isSuperuser,
            false
          )
      };
    },

    normalizeRegion(region) {
      return {
        id:
          Number(region.id),

        region:
          region.region ||
          region.regionName ||
          region.name ||
          `Region #${region.id}`
      };
    },

    async loadPageData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const responses =
          await Promise.all([
            axios.get(
              `${API_BASE_URL}/manager-profiles`,
              this.getRequestConfig()
            ),

            axios.get(
              `${API_BASE_URL}/accounts`,
              this.getRequestConfig()
            ),

            axios.get(
              `${API_BASE_URL}/regions`,
              this.getRequestConfig()
            )
          ]);

        const managerProfileRecords =
          this.getResponseRecords(
            responses[0].data,
            [
              "managerProfiles",
              "profiles"
            ]
          );

        const accountRecords =
          this.getResponseRecords(
            responses[1].data,
            [
              "accounts",
              "users"
            ]
          );

        const regionRecords =
          this.getResponseRecords(
            responses[2].data,
            [
              "regions"
            ]
          );

        this.managerProfiles =
          managerProfileRecords.map(
            profile => {
              return this
                .normalizeManagerProfile(
                  profile
                );
            }
          );

        this.accounts =
          accountRecords.map(account => {
            return this.normalizeAccount(
              account
            );
          });

        this.regions =
          regionRecords
            .map(region => {
              return this.normalizeRegion(
                region
              );
            })
            .filter(region => {
              return Number.isFinite(
                region.id
              );
            })
            .sort((first, second) => {
              return first.region.localeCompare(
                second.region
              );
            });

        if (
          this.currentPage >
          this.totalPages
        ) {
          this.currentPage =
            this.totalPages;
        }
      } catch (error) {
        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load manager-profile records."
          );

        console.error(
          "Unable to load manager profiles:",
          error
        );
      } finally {
        this.loading = false;
      }
    },

    async refreshManagerProfiles() {
      this.refreshing = true;

      try {
        await this.loadPageData();
      } finally {
        this.refreshing = false;
      }
    },

    async loadFormOptions() {
      this.optionsLoading = true;
      this.formError = "";

      try {
        const responses =
          await Promise.all([
            axios.get(
              `${API_BASE_URL}/accounts`,
              this.getRequestConfig()
            ),

            axios.get(
              `${API_BASE_URL}/regions`,
              this.getRequestConfig()
            )
          ]);

        const accountRecords =
          this.getResponseRecords(
            responses[0].data,
            [
              "accounts",
              "users"
            ]
          );

        const regionRecords =
          this.getResponseRecords(
            responses[1].data,
            [
              "regions"
            ]
          );

        this.accounts =
          accountRecords.map(account => {
            return this.normalizeAccount(
              account
            );
          });

        this.regions =
          regionRecords
            .map(region => {
              return this.normalizeRegion(
                region
              );
            })
            .filter(region => {
              return Number.isFinite(
                region.id
              );
            })
            .sort((first, second) => {
              return first.region.localeCompare(
                second.region
              );
            });
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to load accounts and regions."
          );

        console.error(
          "Unable to load form options:",
          error
        );
      } finally {
        this.optionsLoading = false;
      }
    },

async openCreateModal() {
  this.resetForm();

  this.showFormModal = true;

  await this.loadFormOptions();

  this.focusManagerSearchInput();
},

async openEditModal(profile) {
  this.resetForm();

  this.editingId =
    Number(profile.id);

  this.form.accountId =
    Number(profile.accountId);

  this.form.regionId =
    Number(profile.regionId);

  this.showFormModal = true;

  await this.loadFormOptions();

  this.focusAccountInput();
},

closeFormModal() {
  if (this.saving) {
    return;
  }

  this.showFormModal = false;

  this.resetForm();
},

resetForm() {
  this.form =
    createEmptyForm();

  this.editingId =
    null;

  this.formSubmitted =
    false;

  this.formError =
    "";

  this.managerSearch =
    "";
},

focusManagerSearchInput() {
  this.$nextTick(() => {
    if (this.$refs.managerSearchInput) {
      this.$refs.managerSearchInput.focus();
    }
  });
},

focusAccountInput() {
  this.$nextTick(() => {
    if (this.$refs.accountInput) {
      this.$refs.accountInput.focus();
    }
  });
},

clearManagerSearch() {
  this.managerSearch = "";

  this.focusManagerSearchInput();
},

handleManagerSelection() {
  this.formError = "";
  this.formSubmitted = false;
},
    async openEditModal(profile) {
      this.resetForm();

      this.editingId =
        Number(profile.id);

      this.form.accountId =
        Number(profile.accountId);

      this.form.regionId =
        Number(profile.regionId);

      this.showFormModal = true;

      await this.loadFormOptions();

      this.focusAccountInput();
    },

        closeFormModal() {
      if (this.saving) {
        return;
      }

      this.showFormModal = false;
      this.resetForm();
    },

    resetForm() {
      this.form = createEmptyForm();
      this.editingId = null;
      this.formSubmitted = false;
      this.formError = "";
    },

    focusAccountInput() {
      this.$nextTick(() => {
        if (this.$refs.accountInput) {
          this.$refs.accountInput.focus();
        }
      });
    },

    openDetailsModal(profile) {
      this.selectedProfile =
        this.normalizeManagerProfile(
          profile
        );

      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedProfile = null;
    },

    editSelectedProfile() {
      const profile =
        this.selectedProfile;

      this.closeDetailsModal();

      if (profile) {
        this.openEditModal(profile);
      }
    },

    validateForm() {
      this.formError = "";

      if (this.accountError) {
        this.formError =
          this.accountError;

        this.focusAccountInput();

        return false;
      }

      if (this.regionError) {
        this.formError =
          this.regionError;

        this.$nextTick(() => {
          const regionInput =
            document.getElementById(
              "manager-region-id"
            );

          if (regionInput) {
            regionInput.focus();
          }
        });

        return false;
      }

      return true;
    },

    async saveManagerProfile() {
      this.formSubmitted = true;
      this.formError = "";

      if (!this.validateForm()) {
        return;
      }

      this.saving = true;

      const payload = {
        accountId: Number(
          this.form.accountId
        ),

        regionId: Number(
          this.form.regionId
        )
      };

      try {
        if (this.editingId !== null) {
          await axios.put(
            `${API_BASE_URL}/manager-profiles/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showFormModal = false;

          await this.showSuccess(
            "Assignment updated",
            "The manager profile was updated successfully."
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/manager-profiles`,
            payload,
            this.getRequestConfig()
          );

          this.showFormModal = false;

          await this.showSuccess(
            "Manager assigned",
            "The regional manager profile was created successfully."
          );
        }

        this.resetForm();

        await this.loadPageData();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the manager profile."
          );

        console.error(
          "Unable to save manager profile:",
          error
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteManagerProfile(
      profile
    ) {
      const managerName =
        profile.fullName ||
        profile.displayName ||
        profile.userId ||
        "this manager";

      const regionName =
        profile.regionName ||
        "the assigned region";

      const result =
        await Swal.fire({
          title:
            "Delete manager profile?",

          html: `
            <div style="
              color: #64748b;
              font-size: 16px;
              line-height: 1.7;
            ">
              Remove
              <strong style="color: #1f2937;">
                ${this.escapeHtml(managerName)}
              </strong>
              from
              <strong style="color: #1f2937;">
                ${this.escapeHtml(regionName)}
              </strong>?
              <br><br>
              The account will not be deleted.
              Only the regional manager assignment
              will be removed.
            </div>
          `,

          icon: "warning",
          showCancelButton: true,

          confirmButtonColor:
            "#dc2626",

          cancelButtonColor:
            "#64748b",

          confirmButtonText:
            '<span style="color: white;">Yes, delete</span>',

          cancelButtonText:
            '<span style="color: white;">Cancel</span>',

          reverseButtons: true,
          focusCancel: true
        });

      if (!result.isConfirmed) {
        return;
      }

      this.deletingId =
        profile.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/manager-profiles/${profile.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title:
            "Manager profile deleted",

          text:
            "The regional manager assignment was removed successfully.",

          icon: "success",

          confirmButtonColor:
            "#4338ca",

          confirmButtonText:
            '<span style="color: white;">Done</span>',

          timer: 2200,
          timerProgressBar: true
        });

        await this.loadPageData();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",

          text: this.getErrorMessage(
            error,
            "Unable to delete the manager profile."
          ),

          icon: "error",

          confirmButtonColor:
            "#dc2626",

          confirmButtonText:
            '<span style="color: white;">Close</span>'
        });

        console.error(
          "Unable to delete manager profile:",
          error
        );
      } finally {
        this.deletingId = null;
      }
    },

    async showSuccess(
      title,
      text
    ) {
      await Swal.fire({
        title,
        text,

        icon: "success",

        confirmButtonColor:
          "#4338ca",

        confirmButtonText:
          '<span style="color: white;">Done</span>',

        timer: 2200,
        timerProgressBar: true
      });
    },

    getErrorMessage(
      error,
      fallbackMessage
    ) {
      if (!error.response) {
        return "Unable to connect to the HR backend.";
      }

      const status =
        error.response.status;

      const responseData =
        error.response.data;

      if (
        typeof responseData ===
          "string" &&
        responseData.trim()
      ) {
        return responseData;
      }

      if (
        responseData &&
        typeof responseData.message ===
          "string"
      ) {
        return responseData.message;
      }

      if (
        responseData &&
        typeof responseData.error ===
          "string"
      ) {
        return responseData.error;
      }

      if (
        responseData &&
        Array.isArray(
          responseData.errors
        )
      ) {
        const errorMessages =
          responseData.errors
            .map(item => {
              if (
                typeof item === "string"
              ) {
                return item;
              }

              if (
                item &&
                typeof item.message ===
                  "string"
              ) {
                return item.message;
              }

              return "";
            })
            .filter(Boolean);

        if (errorMessages.length) {
          return errorMessages.join(
            ", "
          );
        }
      }

      if (
        responseData &&
        responseData.errors &&
        typeof responseData.errors ===
          "object" &&
        !Array.isArray(
          responseData.errors
        )
      ) {
        const validationMessages =
          Object.values(
            responseData.errors
          )
            .flat()
            .filter(Boolean)
            .map(message => {
              return String(message);
            });

        if (validationMessages.length) {
          return validationMessages.join(
            ", "
          );
        }
      }

      if (status === 400) {
        return "Please check the selected account and region.";
      }

      if (status === 401) {
        return "Your session is no longer valid. Please sign in again.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The manager profile, account, region, or endpoint was not found.";
      }

      if (status === 409) {
        return "This account already has a manager profile.";
      }

      if (status === 422) {
        return "The submitted manager profile could not be processed.";
      }

      if (status === 429) {
        return "Too many requests were submitted. Please try again shortly.";
      }

      if (status === 500) {
        return "The server could not process this request.";
      }

      if (status === 502) {
        return "The backend service is currently unavailable.";
      }

      if (status === 503) {
        return "The backend service is temporarily unavailable.";
      }

      if (status === 504) {
        return "The backend service took too long to respond.";
      }

      return fallbackMessage;
    },

    getAccountOptionLabel(account) {
      const name =
        account.fullName ||
        account.displayName ||
        account.userId ||
        `Account #${account.id}`;

      const userId =
        account.userId ||
        `ID ${account.id}`;

      const role =
        account.role ||
        "No role";

      return `${name} - ${userId} - ${role}`;
    },

    getInitials(value) {
      const source =
        value.fullName ||
        value.displayName ||
        value.userId ||
        "Manager";

      return String(source)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => {
          return word.charAt(0);
        })
        .join("")
        .toUpperCase();
    },

    getRoleClass(role) {
      if (role === "Admin") {
        return "role-admin";
      }

      if (role === "Manager") {
        return "role-manager";
      }

      if (role === "Staff") {
        return "role-staff";
      }

      return "role-unassigned";
    },

    escapeHtml(value) {
      const element =
        document.createElement("div");

      element.textContent =
        value || "";

      return element.innerHTML;
    },

    clearSearch() {
      this.search = "";
      this.currentPage = 1;
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    nextPage() {
      if (
        this.currentPage <
        this.totalPages
      ) {
        this.currentPage += 1;
      }
    },

    goToPage(page) {
      const targetPage =
        Number(page);

      if (
        Number.isInteger(
          targetPage
        ) &&
        targetPage >= 1 &&
        targetPage <=
          this.totalPages
      ) {
        this.currentPage =
          targetPage;
      }
    },

    rowNumber(index) {
      return (
        (this.currentPage - 1) *
          this.pageSize +
        index +
        1
      );
    }
  }
};
</script>

   
<style scoped>
.manager-profiles-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 32px;
  box-sizing: border-box;
  color: #1f2937;
  font-size: 16px;
}

/* Page header */

.manager-profiles-header {
  position: relative !important;
  inset: auto !important;
  width: 100%;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 0 20px !important;
  padding: 15px 18px !important;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #dddff7;
  border-left: 5px solid #4338ca;
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(67, 56, 202, 0.08),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fefeff 70%,
      #eef2ff 100%
    );
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.manager-profiles-header::before {
  content: "";
  position: absolute;
  top: -56px;
  right: 125px;
  width: 125px;
  height: 125px;
  border: 20px solid rgba(67, 56, 202, 0.035);
  border-radius: 50%;
  pointer-events: none;
}

.manager-profiles-header-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.manager-profiles-header-icon {
  min-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border-radius: 13px;
  background: linear-gradient(
    135deg,
    #3730a3,
    #4338ca
  );
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.23);
}

.manager-profiles-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 27px !important;
  line-height: 1 !important;
}

.manager-profiles-header-text {
  min-width: 0;
  flex: 1;
}

.manager-profiles-header-label {
  display: block;
  margin: 0 0 3px;
  padding: 0;
  color: #4338ca;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.manager-profiles-header-title {
  margin: 0 !important;
  padding: 0 !important;
  color: #172033;
  font-size: 25px !important;
  font-weight: 800;
  line-height: 1.25 !important;
}

.manager-profiles-header-description {
  max-width: 720px;
  margin: 5px 0 0 !important;
  padding: 0 !important;
  color: #64748b;
  font-size: 16px !important;
  line-height: 1.5 !important;
}

.manager-profiles-header-button {
  position: relative;
  z-index: 2;
  min-width: 0;
  min-height: 44px;
  height: 44px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 0 auto !important;
  padding: 0 17px !important;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  border: 0;
  border-radius: 11px;
  outline: none;
  background: linear-gradient(
    135deg,
    #3730a3,
    #4338ca
  );
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.23);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.manager-profiles-header-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 11px 22px rgba(67, 56, 202, 0.3);
}

.manager-profiles-header-button:active:not(:disabled) {
  transform: translateY(0);
}

.manager-profiles-header-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(67, 56, 202, 0.15),
    0 7px 16px rgba(67, 56, 202, 0.23);
}

.manager-profiles-header-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.manager-profiles-header-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 21px !important;
  line-height: 1 !important;
}

/* Statistics */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.statistic-card {
  min-width: 0;
  min-height: 104px;
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.statistic-card:hover {
  border-color: #c7d2fe;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.statistic-icon {
  min-width: 54px;
  width: 54px;
  height: 54px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
}

.statistic-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  color: inherit !important;
  font-size: 29px !important;
  line-height: 1 !important;
}

.statistic-icon-primary {
  color: #4338ca;
  background: #e0e7ff;
}

.statistic-icon-success {
  color: #16a34a;
  background: #dcfce7;
}

.statistic-icon-purple {
  color: #7c3aed;
  background: #ede9fe;
}

.statistic-icon-warning {
  color: #d97706;
  background: #fef3c7;
}

.statistic-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 15px;
}

.statistic-value {
  overflow: hidden;
  color: #111827;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statistic-label {
  margin-top: 5px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

/* Records card */

.records-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 19px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.065);
}

.records-toolbar {
  min-height: 94px;
  display: flex;
  align-items: center;
  padding: 21px 24px;
}

.records-heading {
  min-width: 0;
}

.records-heading h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.records-heading p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.records-divider {
  height: 1px;
  background: #e5e7eb;
}

/* Search and refresh */

.search-control {
  width: 360px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-control:focus-within {
  border-color: #4338ca;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.09);
}

.search-control > .md-icon {
  flex-shrink: 0;
  color: #94a3b8 !important;
  font-size: 23px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  margin-left: 9px;
  color: #1f2937;
  font-size: 16px;
  line-height: 1.4;
  border: 0;
  outline: none;
  background: transparent;
}

.search-control input::placeholder {
  color: #94a3b8;
  font-size: 16px;
}

.clear-search-button {
  width: 31px;
  height: 31px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-search-button:hover {
  background: #e2e8f0;
}

.clear-search-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  color: inherit !important;
  font-size: 20px !important;
}

.refresh-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  color: #4338ca;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid #c7d2fe;
  border-radius: 11px;
  outline: none;
  background: #eef2ff;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #e0e7ff;
  transform: translateY(-1px);
}

.refresh-button:active:not(:disabled) {
  transform: translateY(0);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.refresh-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  color: #4338ca !important;
  font-size: 21px !important;
}

/* Error banner */

.error-banner {
  display: flex;
  align-items: center;
  margin: 20px;
  padding: 16px 17px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
}

.error-banner-content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-banner-content > .md-icon {
  flex-shrink: 0;
  color: #dc2626 !important;
  font-size: 25px !important;
}

.error-banner-content div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.error-banner-content strong {
  color: #991b1b;
  font-size: 17px;
  font-weight: 800;
}

.error-banner-content span {
  margin-top: 4px;
  color: #b91c1c;
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.error-banner button {
  min-height: 40px;
  flex-shrink: 0;
  margin-left: auto;
  padding: 0 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-radius: 9px;
  background: #dc2626;
  cursor: pointer;
}

.error-banner button:hover {
  background: #b91c1c;
}

/* Table */

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.records-table {
  width: 100%;
  min-width: 1150px;
  border-collapse: collapse;
}

.records-table thead {
  background: #f8fafc;
}

.records-table th {
  height: 58px;
  padding: 0 18px;
  color: #526176;
  font-size: 16px;
  font-weight: 800;
  text-align: left;
  letter-spacing: 0.35px;
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 80px;
  padding: 12px 18px;
  color: #475569;
  font-size: 16px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.records-table tbody tr:nth-child(even) {
  background: #fcfdff;
}

.records-table tbody tr:hover {
  background: #eef2ff;
  box-shadow: inset 4px 0 0 #4338ca;
}

.number-column {
  width: 75px;
}

.identifier-column {
  width: 130px;
}

.actions-column {
  width: 165px;
  text-align: right !important;
}

.row-number {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4338ca;
  font-size: 16px;
  font-weight: 800;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  background: #eef2ff;
}

/* Manager information */

.manager-cell {
  min-width: 250px;
  display: flex;
  align-items: center;
}

.manager-avatar,
.selected-account-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #3730a3,
    #6366f1
  );
  box-shadow: 0 5px 12px rgba(67, 56, 202, 0.2);
}

.manager-avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.manager-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.manager-name {
  max-width: 290px;
  overflow: hidden;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manager-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
}

/* Badges */

.user-id-badge,
.record-id,
.role-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  border-radius: 9px;
}

.user-id-badge,
.record-id {
  color: #475569;
  background: #f1f5f9;
}

.role-admin {
  color: #991b1b;
  background: #fee2e2;
}

.role-manager {
  color: #6d28d9;
  background: #ede9fe;
}

.role-staff {
  color: #0369a1;
  background: #e0f2fe;
}

.role-unassigned {
  color: #64748b;
  background: #f1f5f9;
}

.status-badge.active {
  color: #166534;
  background: #dcfce7;
}

.status-badge.inactive {
  color: #991b1b;
  background: #fee2e2;
}

.status-dot {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  margin-right: 7px;
  border-radius: 50%;
  background: currentColor;
}

.region-cell {
  min-width: 175px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
}

.region-cell .md-icon {
  flex-shrink: 0;
  color: #4338ca !important;
  font-size: 22px !important;
}

/* Record actions */

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.record-action-button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;
}

.record-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 17px rgba(15, 23, 42, 0.12);
}

.record-action-button:active:not(:disabled) {
  transform: translateY(0);
}

.record-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.record-action-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: inherit !important;
  font-size: 22px !important;
  line-height: 1 !important;
}

.view-button {
  color: #4338ca;
  background: #e0e7ff;
}

.view-button:hover:not(:disabled) {
  background: #c7d2fe;
}

.edit-button {
  color: #2563eb;
  background: #dbeafe;
}

.edit-button:hover:not(:disabled) {
  background: #bfdbfe;
}

.delete-button {
  color: #dc2626;
  background: #fee2e2;
}

.delete-button:hover:not(:disabled) {
  background: #fecaca;
}

/* Loading and empty states */

.loading-state,
.empty-state {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 22px;
  text-align: center;
}

.loading-state h3,
.empty-state h3 {
  margin: 18px 0 0;
  color: #334155;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
}

.loading-state p,
.empty-state p {
  max-width: 500px;
  margin: 8px 0 18px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.empty-state-icon {
  width: 78px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  background: #e0e7ff;
}

.empty-state-icon .md-icon {
  color: #4338ca !important;
  font-size: 42px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 17px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #4338ca;
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.22);
}

.empty-primary-button:hover {
  background: #3730a3;
  transform: translateY(-1px);
}

.empty-primary-button:active {
  transform: translateY(0);
}

.empty-primary-button .md-icon {
  color: #ffffff !important;
  font-size: 20px !important;
}

.empty-secondary-button {
  color: #4338ca;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
}

.empty-secondary-button:hover {
  background: #e0e7ff;
}

/* Spinners */

.loading-spinner,
.small-spinner,
.button-spinner,
.inline-spinner {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e7ff;
  border-top-color: #4338ca;
}

.small-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fecaca;
  border-top-color: #dc2626;
}

.button-spinner {
  width: 19px;
  height: 19px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
}

.inline-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #c7d2fe;
  border-top-color: #4338ca;
}

/* Pagination */

.pagination-footer {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 14px 22px;
  color: #64748b;
  font-size: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.pagination-information {
  font-size: 16px;
  line-height: 1.5;
}

.pagination-information strong {
  color: #1f2937;
  font-size: 16px;
  font-weight: 800;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
}

.pagination-controls label {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
}

.pagination-controls select {
  height: 38px;
  padding: 0 27px 0 10px;
  color: #334155;
  font-size: 16px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
  cursor: pointer;
}

.pagination-controls select:focus {
  border-color: #4338ca;
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.09);
}

.pagination-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #eef2ff;
}

.pagination-button:disabled {
  color: #cbd5e1;
  border-color: #e5e7eb;
  background: #f8fafc;
  cursor: not-allowed;
}

.pagination-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: inherit !important;
  font-size: 23px !important;
  line-height: 1 !important;
}

.pagination-page {
  min-width: 68px;
  color: #475569;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

/* Modal overlay */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* Manager form and details modals */

.manager-profile-modal,
.details-modal {
  width: 100%;
  max-height: calc(100vh - 44px);
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 32px 85px rgba(15, 23, 42, 0.34);
}

.manager-profile-modal {
  max-width: 700px;
}

.details-modal {
  max-width: 850px;
}

/* Modal header */

.modal-header {
  position: relative;
  min-height: 118px;
  display: flex;
  align-items: center;
  padding: 24px 26px;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(255, 255, 255, 0.17),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #312e81 0%,
      #3730a3 48%,
      #4338ca 100%
    );
}

.modal-header::after {
  content: "";
  position: absolute;
  top: -82px;
  right: -42px;
  width: 185px;
  height: 185px;
  border: 30px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  pointer-events: none;
}

.modal-header-icon {
  position: relative;
  z-index: 2;
  min-width: 56px;
  width: 56px;
  height: 56px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
}

.modal-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 30px !important;
  line-height: 1 !important;
}

.modal-heading {
  position: relative;
  z-index: 2;
  min-width: 0;
  flex: 1;
}

.modal-label {
  display: block;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.modal-heading h2 {
  margin: 5px 0 4px;
  color: #ffffff;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.3;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.5;
}

.modal-close-button {
  position: relative;
  z-index: 2;
  width: 42px;
  height: 42px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  padding: 0;
  color: #ffffff;
  border: 0;
  border-radius: 11px;
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.modal-close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.22);
}

.modal-close-button:focus-visible {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
}

.modal-close-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.modal-close-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 24px !important;
  line-height: 1 !important;
}

/* Modal content */

.modal-body,
.details-modal-body {
  padding: 26px;
}

/* Form controls */

.form-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.form-group label span {
  color: #dc2626;
}

.form-group select {
  width: 100%;
  height: 52px;
  padding: 0 38px 0 13px;
  box-sizing: border-box;
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid #d4dce8;
  border-radius: 11px;
  outline: none;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-group select:hover:not(:disabled) {
  border-color: #a5b4fc;
}

.form-group select:focus {
  border-color: #4338ca;
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.1);
}

.form-group select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  background: #f1f5f9;
}

.field-error {
  display: block;
  margin-top: 7px;
  color: #dc2626;
  font-size: 16px;
  line-height: 1.4;
}

.field-information {
  display: block;
  margin-top: 7px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
}

/* Selected account preview */

.selected-account-card {
  min-height: 82px;
  display: flex;
  align-items: center;
  gap: 13px;
  margin: -4px 0 20px;
  padding: 15px;
  box-sizing: border-box;
  color: #475569;
  border: 1px solid #c7d2fe;
  border-radius: 13px;
  background: #eef2ff;
}

.selected-account-card > .md-icon {
  flex-shrink: 0;
  color: #4338ca !important;
  font-size: 27px !important;
}

.selected-account-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #3730a3,
    #6366f1
  );
  box-shadow: 0 5px 12px rgba(67, 56, 202, 0.2);
}

.selected-account-information {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.selected-account-information strong {
  overflow: hidden;
  color: #1f2937;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-account-information span {
  margin-top: 4px;
  overflow: hidden;
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-account-card .status-badge {
  flex-shrink: 0;
}

/* Form notices */

.form-hint,
.lookup-loading-message,
.modal-error {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 16px;
  padding: 14px;
  font-size: 16px;
  line-height: 1.5;
  border-radius: 11px;
}

.form-hint,
.lookup-loading-message {
  color: #3730a3;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
}

.form-hint .md-icon,
.lookup-loading-message .md-icon {
  flex-shrink: 0;
  color: #4338ca !important;
  font-size: 22px !important;
}

.modal-error {
  color: #991b1b;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.modal-error .md-icon {
  flex-shrink: 0;
  color: #dc2626 !important;
  font-size: 22px !important;
}

/* Manager profile details */

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  background: #f8fafc;
}

.detail-item span {
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
}

.detail-item strong {
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
}

/* Modal footer */

.modal-footer {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 11px;
  padding: 15px 24px;
  box-sizing: border-box;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 47px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  border-radius: 11px;
  outline: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.cancel-button {
  color: #526176;
  border: 1px solid #d4dce8;
  background: #ffffff;
}

.cancel-button:hover:not(:disabled) {
  background: #f1f5f9;
}

.cancel-button:focus-visible {
  box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.12);
}

.save-button {
  gap: 9px;
  color: #ffffff;
  border: 0;
  background: linear-gradient(
    135deg,
    #3730a3,
    #4338ca
  );
  box-shadow: 0 9px 20px rgba(67, 56, 202, 0.24);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(67, 56, 202, 0.3);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.save-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(67, 56, 202, 0.16),
    0 9px 20px rgba(67, 56, 202, 0.24);
}

.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.save-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 21px !important;
  line-height: 1 !important;
}

/* Modal transitions */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .manager-profile-modal,
.modal-fade-leave-active .manager-profile-modal,
.modal-fade-enter-active .details-modal,
.modal-fade-leave-active .details-modal {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .manager-profile-modal,
.modal-fade-leave-to .manager-profile-modal,
.modal-fade-enter .details-modal,
.modal-fade-leave-to .details-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* Animations */

.rotating {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbars */

.table-responsive::-webkit-scrollbar {
  height: 9px;
}

.manager-profile-modal::-webkit-scrollbar,
.details-modal::-webkit-scrollbar {
  width: 9px;
}

.table-responsive::-webkit-scrollbar-track,
.manager-profile-modal::-webkit-scrollbar-track,
.details-modal::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-responsive::-webkit-scrollbar-thumb,
.manager-profile-modal::-webkit-scrollbar-thumb,
.details-modal::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd5e1;
}

.table-responsive::-webkit-scrollbar-thumb:hover,
.manager-profile-modal::-webkit-scrollbar-thumb:hover,
.details-modal::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Large tablet */

@media (max-width: 1100px) {
  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .records-toolbar {
    align-items: flex-start;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }
}

/* Tablet */

@media (max-width: 900px) {
  .records-toolbar {
    display: block;
  }

  .toolbar-actions {
    margin-top: 16px;
    margin-left: 0;
  }

  .search-control {
    flex: 1;
    width: auto;
    min-width: 280px;
  }
}

/* Mobile */

@media (max-width: 767px) {
  .manager-profiles-header {
    display: block;
    padding: 15px !important;
  }

  .manager-profiles-header-content {
    align-items: flex-start;
  }

  .manager-profiles-header-button {
    width: 100%;
    margin: 14px 0 0 !important;
  }

  .toolbar-actions {
    display: block;
  }

  .search-control {
    width: 100%;
    min-width: 0;
  }

  .refresh-button {
    width: 100%;
    margin-top: 10px;
  }

  .error-banner {
    display: block;
  }

  .error-banner button {
    width: 100%;
    margin-top: 14px;
    margin-left: 0;
  }

  .pagination-footer {
    display: block;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
    margin-top: 14px;
    margin-left: 0;
  }
}

/* Small mobile */

@media (max-width: 575px) {
  .manager-profiles-page {
    padding-bottom: 20px;
  }

  .manager-profiles-header {
    margin-bottom: 16px !important;
    padding: 13px !important;
    border-radius: 12px;
  }

  .manager-profiles-header::before {
    display: none;
  }

  .manager-profiles-header-icon {
    min-width: 45px;
    width: 45px;
    height: 45px;
    margin-right: 11px;
  }

  .manager-profiles-header-title {
    font-size: 21px !important;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .statistic-card {
    min-height: 92px;
    padding: 17px;
  }

  .records-toolbar {
    padding: 20px 16px;
  }

  .records-heading h2 {
    font-size: 20px;
  }

  .records-table th,
  .records-table td {
    padding-right: 13px;
    padding-left: 13px;
  }

  .number-column {
    width: 58px;
  }

  .actions-column {
    width: 150px;
  }

  .row-number {
    width: 34px;
    height: 34px;
  }

  .manager-avatar {
    width: 42px;
    height: 42px;
    margin-right: 10px;
  }

  .record-action-button {
    width: 38px;
    height: 38px;
  }

  .pagination-footer {
    padding: 15px;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .manager-profile-modal,
  .details-modal {
    max-width: none;
    max-height: 95vh;
    border-radius: 21px 21px 0 0;
  }

  .modal-header {
    min-height: 108px;
    padding: 21px 18px;
  }

  .modal-header-icon {
    min-width: 50px;
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }

  .modal-heading h2 {
    font-size: 21px;
  }

  .modal-close-button {
    width: 40px;
    height: 40px;
    margin-left: 10px;
  }

  .modal-body,
  .details-modal-body {
    padding: 20px 17px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .selected-account-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .selected-account-information {
    width: calc(100% - 61px);
  }

  .selected-account-card .status-badge {
    margin-left: 61px;
  }

  .modal-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 14px 17px;
  }

  .cancel-button,
  .save-button {
    width: 100%;
    padding-right: 11px;
    padding-left: 11px;
  }
}

/* Final manager form modal layout overrides */

.manager-profile-modal {
  width: calc(100% - 32px);
  max-width: 720px;
  height: auto;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 21px;
  background: #ffffff;
}

.manager-profile-modal > .modal-header {
  min-height: auto;
  flex-shrink: 0;
}

.manager-profile-modal > form {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.manager-profile-modal .modal-body {
  min-height: 0;
  flex: 1 1 auto;
  padding: 26px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.manager-profile-modal .modal-footer {
  flex-shrink: 0;
  background: #ffffff;
  box-shadow: 0 -5px 18px rgba(15, 23, 42, 0.05);
}

.details-modal {
  width: calc(100% - 32px);
  max-width: 850px;
  max-height: calc(100vh - 48px);
  overflow-x: hidden;
  overflow-y: auto;
}

.form-section-heading {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-section-icon {
  width: 48px;
  height: 48px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
}
</style>
 

