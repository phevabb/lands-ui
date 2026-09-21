<template>
  <div class="districts-page">
    <!-- Premium header -->
    

   <section class="district-header">
  <div class="district-header-content">
    <div class="district-header-icon">
      <md-icon>location_city</md-icon>
    </div>

    <div class="district-header-text">
      <span class="district-header-label">
        SYSTEM CONFIGURATION
      </span>

      <h1 class="district-header-title">
        Districts
      </h1>

      <p class="district-header-description">
        Create, update, search, and manage the districts available
        when creating and updating staff accounts.
      </p>
    </div>
  </div>

  <button
    type="button"
    class="district-header-button"
    :disabled="loading"
    @click="openCreateModal"
  >
    <md-icon>add_location_alt</md-icon>

    <span>Add District</span>
  </button>
</section>



    <!-- Statistics -->
    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>location_city</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ districts.length }}
          </span>

          <span class="statistic-label">
            Total Districts
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredDistricts.length }}
          </span>

          <span class="statistic-label">
            Visible Records
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-purple">
          <md-icon>update</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value statistic-time">
            {{ lastUpdatedLabel }}
          </span>

          <span class="statistic-label">
            Last Refreshed
          </span>
        </div>
      </div>
    </section>

    <!-- Records card -->
    <section class="records-card">
      <div class="records-toolbar">
        <div class="records-heading">
          <h2>District Records</h2>

          <p>
            Manage all administrative districts available in the HR system.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search districts..."
              aria-label="Search districts"
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
            @click="refreshDistricts"
          >
            <md-icon
              :class="{
                rotating: loading || refreshing
              }"
            >
              refresh
            </md-icon>

            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div class="records-divider" />

      <!-- Error state -->
      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>error_outline</md-icon>

          <div>
            <strong>Unable to load districts</strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="loadDistricts"
        >
          Try Again
        </button>
      </div>

      <!-- Loading state -->
      <div
        v-if="loading && !districts.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>Loading districts</h3>

        <p>
          Please wait while the district records are retrieved.
        </p>
      </div>

      <!-- District table -->
      <div
        v-else-if="paginatedDistricts.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                District Name
              </th>

              <th class="identifier-column">
                Record ID
              </th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(districtItem, index) in paginatedDistricts"
              :key="districtItem.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="district-cell">
                  <div class="district-icon">
                    <md-icon>location_city</md-icon>
                  </div>

                  <div class="district-information">
                    <span class="district-name">
                      {{ districtItem.district }}
                    </span>

                    <span class="district-description">
                      Administrative district record
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="record-id">
                  #{{ districtItem.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit district"
                    :disabled="deletingId === districtItem.id"
                    @click="openEditModal(districtItem)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete district"
                    :disabled="deletingId === districtItem.id"
                    @click="deleteDistrict(districtItem)"
                  >
                    <span
                      v-if="deletingId === districtItem.id"
                      class="small-spinner"
                    />

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

      <!-- Empty state -->
      <div
        v-else
        class="empty-state"
      >
        <div class="empty-state-icon">
          <md-icon>
            {{ search ? "search_off" : "location_city" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching district found"
              : "No districts created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with a different district name."
              : "Create the first administrative district."
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
          <md-icon>add</md-icon>

          Add District
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredDistricts.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredDistricts.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="district-page-size">
            Rows:
          </label>

          <select
            id="district-page-size"
            v-model.number="pageSize"
            @change="handlePageSizeChange"
          >
            <option :value="5">
              5
            </option>

            <option :value="10">
              10
            </option>

            <option :value="20">
              20
            </option>

            <option :value="50">
              50
            </option>
          </select>

          <button
            type="button"
            class="pagination-button"
            :disabled="currentPage === 1"
            title="Previous page"
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
            title="Next page"
            @click="nextPage"
          >
            <md-icon>chevron_right</md-icon>
          </button>
        </div>
      </div>
    </section>

    <!-- Create/Edit modal -->
    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="district-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="modalTitle"
        >
          <div class="modal-header">
            <div class="modal-header-icon">
              <md-icon>
                {{ editingId ? "edit_location_alt" : "add_location_alt" }}
              </md-icon>
            </div>

            <div class="modal-heading">
              <span class="modal-label">
                DISTRICT
              </span>

              <h2>
                {{ modalTitle }}
              </h2>

              <p>
                {{ modalDescription }}
              </p>
            </div>

                        <button
              type="button"
              class="modal-close-button"
              :disabled="saving"
              title="Close"
              @click="closeModal"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <form @submit.prevent="saveDistrict">
            <div class="modal-body">
              <label
                class="form-label"
                for="district-name"
              >
                District Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid: formSubmitted && districtError
                }"
              >
                <md-icon>location_city</md-icon>

                <input
                  id="district-name"
                  ref="districtInput"
                  v-model="form.district"
                  type="text"
                  maxlength="120"
                  autocomplete="off"
                  placeholder="Example: Tema Metropolitan"
                  :disabled="saving"
                  @input="clearFormError"
                />
              </div>

              <div class="form-information">
                <span
                  class="form-error"
                  :class="{
                    visible: formSubmitted && districtError
                  }"
                >
                  {{ districtError || " " }}
                </span>

                <span class="character-count">
                  {{ form.district.length }} / 120
                </span>
              </div>

              <div class="form-hint">
                <md-icon>info_outline</md-icon>

                <span>
                  Enter a district name with no more than 120
                  characters. Duplicate district names are not allowed.
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
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="save-button"
                :disabled="saving"
              >
                <span
                  v-if="saving"
                  class="button-spinner"
                />

                <md-icon v-else>
                  {{ editingId ? "save" : "add" }}
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
const API_BASE_URL  = "http://127.0.0.1:8888/api";

export default {
  name: "SuperDistricts",

  data() {
    return {
      loading: false,
      refreshing: false,
      saving: false,
      deletingId: null,

      showModal: false,
      formSubmitted: false,
      editingId: null,

      search: "",
      errorMessage: "",
      formError: "",

      districts: [],

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      form: {
        district: ""
      }
    };
  },

  computed: {
    filteredDistricts() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.districts;
      }

      return this.districts.filter(districtItem => {
        const district =
          districtItem.district || "";

        return district
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedDistricts() {
      return [...this.filteredDistricts].sort(
        (first, second) => {
          const firstDistrict =
            first.district
              ? first.district.trim().toLowerCase()
              : "";

          const secondDistrict =
            second.district
              ? second.district.trim().toLowerCase()
              : "";

          return firstDistrict.localeCompare(
            secondDistrict
          );
        }
      );
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedDistricts.length /
            this.pageSize
        )
      );
    },

    paginatedDistricts() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      const end =
        start + this.pageSize;

      return this.sortedDistricts.slice(
        start,
        end
      );
    },

    paginationStart() {
      if (!this.sortedDistricts.length) {
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
        this.currentPage * this.pageSize,
        this.sortedDistricts.length
      );
    },

    modalTitle() {
      return this.editingId
        ? "Edit District"
        : "Add District";
    },

    modalDescription() {
      return this.editingId
        ? "Update the selected district record."
        : "Create a new district for staff accounts.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId
        ? "Update District"
        : "Create District";
    },

    districtError() {
      const district =
        this.form.district
          ? this.form.district.trim()
          : "";

      if (!district) {
        return "District name is required.";
      }

      if (district.length < 2) {
        return "District name must contain at least 2 characters.";
      }

      if (district.length > 120) {
        return "District name cannot exceed 120 characters.";
      }

      const duplicate =
        this.districts.some(districtItem => {
          const existingDistrict =
            districtItem.district
              ? districtItem.district
                  .trim()
                  .toLowerCase()
              : "";

          return (
            Number(districtItem.id) !==
              Number(this.editingId) &&
            existingDistrict ===
              district.toLowerCase()
          );
        });

      if (duplicate) {
        return "This district already exists.";
      }

      return "";
    },

    lastUpdatedLabel() {
      if (!this.lastUpdated) {
        return "Not yet";
      }

      return this.lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );
    }
  },

  watch: {
    search() {
      this.currentPage = 1;
    },

    totalPages(value) {
      if (this.currentPage > value) {
        this.currentPage = value;
      }
    },

    showModal(value) {
      document.body.style.overflow =
        value ? "hidden" : "";
    }
  },

  created() {
    this.loadDistricts();
  },

  beforeDestroy() {
    document.body.style.overflow = "";
  },

  methods: {
    getRequestConfig() {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token");

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

    normalizeDistrict(item) {
      return {
        id: item.id,
        district:
          item.district ||
          item.districtName ||
          ""
      };
    },

    async loadDistricts() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/districts`,
          this.getRequestConfig()
        );

        const responseData =
          Array.isArray(response.data)
            ? response.data
            : response.data &&
                Array.isArray(response.data.data)
              ? response.data.data
              : [];

        this.districts =
          responseData.map(item => {
            return this.normalizeDistrict(item);
          });

        this.lastUpdated = new Date();

        if (
          this.currentPage >
          this.totalPages
        ) {
          this.currentPage =
            this.totalPages;
        }
      } catch (error) {
        this.districts = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load districts."
          );
      } finally {
        this.loading = false;
      }
    },

    async refreshDistricts() {
      this.refreshing = true;

      try {
        await this.loadDistricts();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusDistrictInput();
    },

    openEditModal(districtItem) {
      this.resetForm();

      this.editingId =
        districtItem.id;

      this.form.district =
        districtItem.district || "";

      this.showModal = true;
      this.focusDistrictInput();
    },

    closeModal() {
      if (this.saving) {
        return;
      }

      this.showModal = false;
      this.resetForm();
    },

    resetForm() {
      this.editingId = null;

      this.form = {
        district: ""
      };

      this.formSubmitted = false;
      this.formError = "";
    },

    clearFormError() {
      this.formError = "";
    },

    focusDistrictInput() {
      this.$nextTick(() => {
        if (this.$refs.districtInput) {
          this.$refs.districtInput.focus();
        }
      });
    },

    async saveDistrict() {
      this.formSubmitted = true;
      this.formError = "";

      if (this.districtError) {
        this.focusDistrictInput();
        return;
      }

      this.saving = true;

      const payload = {
        district:
          this.form.district.trim()
      };

      try {
        if (this.editingId !== null) {
          await axios.put(
            `${API_BASE_URL}/districts/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "District updated",
            `"${payload.district}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/districts`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "District created",
            `"${payload.district}" was created successfully.`
          );
        }

        this.resetForm();
        await this.loadDistricts();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the district."
          );
      } finally {
        this.saving = false;
      }
    },

    async deleteDistrict(districtItem) {
      const districtName =
        districtItem.district ||
        "this district";

      const result = await Swal.fire({
        title: "Delete district?",
        html: `
          <div style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.7;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(districtName)}
            </strong>?
            <br><br>
            This action cannot be undone.
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true
      });

      if (!result.isConfirmed) {
        return;
      }

      this.deletingId =
        districtItem.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/districts/${districtItem.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "District deleted",
          text: `"${districtName}" was deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Done",
          timer: 2200,
          timerProgressBar: true
        });

        await this.loadDistricts();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",
          text: this.getErrorMessage(
            error,
            "Unable to delete the district."
          ),
          icon: "error",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Close"
        });
      } finally {
        this.deletingId = null;
      }
    },

    async showSuccess(title, text) {
      await Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Done",
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
        typeof responseData === "string" &&
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

      if (status === 400) {
        return "Please check the submitted district name.";
      }

      if (status === 401) {
        return "Your session is no longer valid.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The district was not found.";
      }

      if (status === 409) {
        return "This district already exists.";
      }

      if (status === 500) {
        return "The server could not process this request.";
      }

      return fallbackMessage;
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

    handlePageSizeChange() {
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
.districts-page {
  width: 100%;
  min-height: 100%;
  padding: 8px 0 40px;
  font-size: 16px;
}

/* =========================================================
   PAGE HEADER
   ========================================================= */


  .district-header {
  position: relative !important;
  inset: auto !important;

  width: 100%;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;

  display: flex;
  align-items: center;
  gap: 16px;

  margin: 0 0 18px !important;
  padding: 12px 16px !important;

  overflow: hidden;
  box-sizing: border-box;

  color: #1f2937;

  border: 1px solid #f1dede;
  border-left: 4px solid #dc2626;
  border-radius: 12px;

  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(220, 38, 38, 0.06),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fffdfd 70%,
      #fef2f2 100%
    );

  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.055);
}

.district-header::before {
  content: "";
  position: absolute;
  top: -52px;
  right: 120px;

  width: 115px;
  height: 115px;

  border: 18px solid rgba(220, 38, 38, 0.035);
  border-radius: 50%;

  pointer-events: none;
}

.district-header-content {
  position: relative;
  z-index: 2;

  min-width: 0;

  display: flex;
  flex: 1;
  align-items: center;
}

.district-header-icon {
  min-width: 44px;
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 13px;

  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #b91c1c,
    #dc2626
  );

  box-shadow: 0 6px 14px rgba(220, 38, 38, 0.22);
}

.district-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;

  margin: 0 !important;
  padding: 0 !important;

  color: #ffffff !important;
  font-size: 24px !important;
  line-height: 1 !important;
}

.district-header-text {
  min-width: 0;
  flex: 1;
}

.district-header-label {
  display: block;

  margin: 0 0 2px;
  padding: 0;

  color: #b91c1c;

  font-size: 9px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.district-header-title {
  margin: 0 !important;
  padding: 0 !important;

  color: #172033;

  font-size: 20px !important;
  font-weight: 800;
  line-height: 1.25 !important;
  letter-spacing: -0.2px;
}

.district-header-description {
  max-width: 620px;

  margin: 3px 0 0 !important;
  padding: 0 !important;

  color: #64748b;

  font-size: 12px !important;
  font-weight: 400;
  line-height: 1.4 !important;
}

.district-header-button {
  position: relative;
  z-index: 2;

  min-width: 0;
  min-height: 38px;
  height: 38px;

  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;

  margin: 0 0 0 auto !important;
  padding: 0 14px !important;

  color: #ffffff;

  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  border: 0;
  border-radius: 9px;
  outline: none;

  background: linear-gradient(
    135deg,
    #b91c1c,
    #dc2626
  );

  box-shadow: 0 6px 14px rgba(220, 38, 38, 0.22);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.district-header-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 9px 18px rgba(220, 38, 38, 0.28);
}

.district-header-button:active:not(:disabled) {
  transform: translateY(0);
}

.district-header-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(220, 38, 38, 0.14),
    0 6px 14px rgba(220, 38, 38, 0.22);
}

.district-header-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.district-header-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;

  margin: 0 !important;
  padding: 0 !important;

  color: #ffffff !important;
  font-size: 18px !important;
  line-height: 1 !important;
}

@media (max-width: 991px) {
  .district-header {
    min-height: 0 !important;
    padding: 11px 14px !important;
  }

  .district-header-description {
    max-width: 430px;
  }
}

@media (max-width: 767px) {
  .district-header {
    display: block;

    height: auto !important;
    min-height: 0 !important;

    padding: 13px !important;
  }

  .district-header-content {
    align-items: flex-start;
  }

  .district-header-button {
    width: 100%;
    height: 40px;

    margin: 12px 0 0 !important;
  }
}

@media (max-width: 575px) {
  .district-header {
    margin-bottom: 14px !important;
    padding: 11px !important;
    border-radius: 11px;
  }

  .district-header::before {
    display: none;
  }

  .district-header-icon {
    min-width: 40px;
    width: 40px;
    height: 40px;

    margin-right: 10px;

    border-radius: 10px;
  }

  .district-header-icon .md-icon {
    font-size: 22px !important;
  }

  .district-header-label {
    font-size: 8px;
  }

  .district-header-title {
    font-size: 17px !important;
  }

  .district-header-description {
    margin-top: 2px !important;

    font-size: 10px !important;
    line-height: 1.35 !important;
  }

  .district-header-button {
    min-height: 38px;
    height: 38px;

    font-size: 11px;
  }
}


/* =========================================================
   STATISTICS
   ========================================================= */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin-bottom: 28px;
}

.statistic-card {
  min-height: 110px;
  display: flex;
  align-items: center;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.055);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.statistic-card:hover {
  border-color: #fecaca;
  transform: translateY(-3px);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.09);
}

.statistic-icon {
  min-width: 60px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.statistic-icon .md-icon {
  color: inherit !important;
  font-size: 33px !important;
}

.statistic-icon-primary {
  color: #dc2626;
  background: #fee2e2;
}

.statistic-icon-success {
  color: #16a34a;
  background: #dcfce7;
}

.statistic-icon-purple {
  color: #7c3aed;
  background: #ede9fe;
}

.statistic-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: 17px;
}

.statistic-value {
  color: #111827;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
}

.statistic-time {
  font-size: 21px;
}

.statistic-label {
  margin-top: 5px;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
}

/* =========================================================
   RECORDS CARD
   ========================================================= */

.records-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 15px 36px rgba(15, 23, 42, 0.07);
}

.records-toolbar {
  min-height: 105px;
  display: flex;
  align-items: center;
  padding: 24px 29px;
}

.records-heading {
  min-width: 0;
}

.records-toolbar h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}

.records-toolbar p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.5;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-left: auto;
}

/* =========================================================
   SEARCH AND REFRESH
   ========================================================= */

.search-control {
  width: 340px;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border: 1px solid #dbe3ee;
  border-radius: 13px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.search-control:focus-within {
  border-color: #dc2626;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.09);
}

.search-control > .md-icon {
  color: #94a3b8 !important;
  font-size: 25px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  margin-left: 10px;
  color: #1f2937;
  font-size: 16px;
  border: 0;
  outline: none;
  background: transparent;
}

.search-control input::placeholder {
  color: #94a3b8;
}

.clear-search-button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.clear-search-button:hover {
  background: #e2e8f0;
}

.clear-search-button .md-icon {
  color: #64748b !important;
  font-size: 22px !important;
}

.refresh-button {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  color: #b91c1c;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid #fecaca;
  border-radius: 12px;
  outline: none;
  background: #fef2f2;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #fee2e2;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-button .md-icon {
  color: #dc2626 !important;
  font-size: 23px !important;
}

.records-divider {
  height: 1px;
  background: #e5e7eb;
}

/* =========================================================
   ERROR
   ========================================================= */

.error-banner {
  display: flex;
  align-items: center;
  margin: 22px;
  padding: 17px 19px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 13px;
  background: #fef2f2;
}

.error-banner-content {
  display: flex;
  align-items: center;
  gap: 13px;
}

.error-banner-content .md-icon {
  color: #dc2626 !important;
  font-size: 28px !important;
}

.error-banner-content div {
  display: flex;
  flex-direction: column;
}

.error-banner-content strong {
  font-size: 17px;
  font-weight: 800;
}

.error-banner-content span {
  margin-top: 4px;
  font-size: 15px;
  line-height: 1.5;
}

.error-banner button {
  margin-left: auto;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  border: 0;
  border-radius: 9px;
  background: #dc2626;
  cursor: pointer;
}

/* =========================================================
   TABLE
   ========================================================= */

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table thead {
  background: #f8fafc;
}

.records-table th {
  height: 62px;
  padding: 0 25px;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  text-align: left;
  letter-spacing: 0.55px;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 84px;
  padding: 13px 25px;
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
  background: #fdfefe;
}

.records-table tbody tr:hover {
  background: #fef2f2;
  box-shadow: inset 5px 0 0 #dc2626;
}

.number-column {
  width: 90px;
}

.identifier-column {
  width: 150px;
}

.actions-column {
  width: 170px;
  text-align: right !important;
}

.row-number {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #b91c1c;
  font-size: 15px;
  font-weight: 800;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.district-cell {
  display: flex;
  align-items: center;
}

.district-icon {
  min-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border-radius: 14px;
  background: #fee2e2;
}

.district-icon .md-icon {
  color: #dc2626 !important;
  font-size: 27px !important;
}

.district-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.district-name {
  color: #1f2937;
  font-size: 18px;
  font-weight: 750;
  line-height: 1.35;
}

.district-description {
  margin-top: 5px;
  color: #64748b;
  font-size: 14px;
}

.record-id {
  display: inline-block;
  padding: 7px 11px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  border-radius: 9px;
  background: #f1f5f9;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.record-action-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 11px;
  outline: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.record-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 17px rgba(15, 23, 42, 0.13);
}

.record-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.edit-button {
  color: #2563eb;
  background: #dbeafe;
}

.delete-button {
  color: #dc2626;
  background: #fee2e2;
}

.record-action-button .md-icon {
  color: inherit !important;
  font-size: 23px !important;
}

/* =========================================================
   LOADING AND EMPTY STATES
   ========================================================= */

.loading-state,
.empty-state {
  min-height: 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 45px 24px;
  text-align: center;
}

.loading-spinner,
.button-spinner,
.small-spinner {
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 52px;
  height: 52px;
  border: 5px solid #fee2e2;
  border-top-color: #dc2626;
}

.button-spinner {
  width: 19px;
  height: 19px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
}

.small-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fecaca;
  border-top-color: #dc2626;
}

.loading-state h3,
.empty-state h3 {
  margin: 18px 0 0;
  color: #334155;
  font-size: 22px;
  font-weight: 700;
}

.loading-state p,
.empty-state p {
  margin: 8px 0 19px;
  color: #64748b;
  font-size: 16px;
}

.empty-state-icon {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 23px;
  background: #f1f5f9;
}

.empty-state-icon .md-icon {
  color: #dc2626 !important;
  font-size: 45px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 11px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #dc2626;
}

.empty-primary-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.empty-secondary-button {
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

/* =========================================================
   PAGINATION
   ========================================================= */

.pagination-footer {
  min-height: 76px;
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: #475569;
  font-size: 15px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
}

.pagination-information strong {
  color: #1f2937;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.pagination-controls label {
  margin: 0;
  color: #475569;
  font-size: 15px;
}

.pagination-controls select {
  height: 39px;
  padding: 0 27px 0 10px;
  color: #334155;
  font-size: 15px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
}

.pagination-button {
  width: 39px;
  height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-button:disabled {
  color: #cbd5e1;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.pagination-button .md-icon {
  color: inherit !important;
  font-size: 24px !important;
}

.pagination-page {
  min-width: 68px;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

/* =========================================================
   MODAL
   ========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(6px);
}

.district-modal {
  width: 100%;
  max-width: 620px;
  overflow: hidden;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 32px 85px rgba(15, 23, 42, 0.32);
}

.modal-header {
  min-height: 125px;
  display: flex;
  align-items: center;
  padding: 26px 28px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #7f1d1d,
    #b91c1c,
    #ef4444
  );
}

.modal-header-icon {
  min-width: 60px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 17px;
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.16);
}

.modal-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 32px !important;
}

.modal-heading {
  min-width: 0;
}

.modal-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.modal-heading h2 {
  margin: 5px 0 4px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 800;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
}

.modal-close-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0;
  color: #ffffff;
  border: 0;
  border-radius: 11px;
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.modal-close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.modal-close-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-close-button .md-icon {
  color: #ffffff !important;
  font-size: 25px !important;
}

.modal-body {
  padding: 32px 29px 24px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-size: 16px;
  font-weight: 700;
}

.form-label span {
  color: #dc2626;
}

.form-input-wrapper {
  min-height: 58px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: 1px solid #dbe3ee;
  border-radius: 13px;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input-wrapper:focus-within {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
}

.form-input-wrapper .md-icon {
  margin-right: 12px;
  color: #dc2626 !important;
  font-size: 25px !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  color: #1f2937;
  font-size: 17px;
  border: 0;
  outline: none;
  background: transparent;
}

.form-input-wrapper input::placeholder {
  color: #94a3b8;
}

.form-input-wrapper input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.form-information {
  min-height: 34px;
  display: flex;
  align-items: flex-start;
  padding-top: 7px;
}

.form-error {
  color: #dc2626;
  font-size: 14px;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  margin-left: auto;
  color: #64748b;
  font-size: 14px;
}

.form-hint {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  padding: 13px 14px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.form-hint .md-icon {
  min-width: 21px;
  margin-right: 9px;
  color: #dc2626 !important;
  font-size: 21px !important;
}

.modal-error {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 13px;
  color: #991b1b;
  font-size: 15px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
}

.modal-error .md-icon {
  margin-right: 8px;
  color: #dc2626 !important;
  font-size: 22px !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 17px 25px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 48px;
  padding: 0 21px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 11px;
  cursor: pointer;
}

.cancel-button {
  color: #475569;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.cancel-button:hover:not(:disabled) {
  background: #f1f5f9;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #ffffff;
  border: 0;
  background: linear-gradient(
    135deg,
    #b91c1c,
    #ef4444
  );
  box-shadow: 0 9px 20px rgba(220, 38, 38, 0.24);
}

.save-button:hover:not(:disabled) {
  box-shadow: 0 12px 25px rgba(220, 38, 38, 0.3);
}

.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.save-button .md-icon {
  color: #ffffff !important;
  font-size: 22px !important;
}

/* =========================================================
   TRANSITIONS AND ANIMATIONS
   ========================================================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .district-modal,
.modal-fade-leave-active .district-modal {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .district-modal,
.modal-fade-leave-to .district-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

.rotating {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   SCROLLBAR
   ========================================================= */

.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-responsive::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd5e1;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1200px) {
  .page-header {
    padding: 34px;
  }

  .search-control {
    width: 290px;
  }
}

@media (max-width: 991px) {
  .page-header {
    padding: 30px;
  }

  .statistics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .records-toolbar {
    align-items: flex-start;
  }

  .toolbar-actions {
    display: block;
  }

  .search-control {
    width: 290px;
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
}

@media (max-width: 767px) {
  .page-header,
  .records-toolbar {
    display: block;
  }

  .header-add-button {
    width: 100%;
    justify-content: center;
    margin-top: 22px;
    margin-left: 0;
  }

  .toolbar-actions {
    margin-top: 18px;
    margin-left: 0;
  }

  .search-control {
    width: 100%;
  }

  .identifier-column,
  .records-table td:nth-child(3) {
    display: none;
  }

  .error-banner {
    display: block;
  }

  .error-banner button {
    width: 100%;
    margin-top: 14px;
    margin-left: 0;
  }
}

@media (max-width: 575px) {
  .districts-page {
    padding-bottom: 20px;
  }

  .page-header {
    padding: 25px 20px;
    border-radius: 17px;
  }

  .page-header-content {
    align-items: flex-start;
  }

  .page-header-icon {
    min-width: 59px;
    width: 59px;
    height: 59px;
    margin-right: 14px;
  }

  .page-header-icon .md-icon {
    font-size: 34px !important;
  }

  .page-header-label {
    font-size: 11px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-header p {
    font-size: 15px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .records-toolbar {
    padding: 22px 18px;
  }

  .records-toolbar h2 {
    font-size: 21px;
  }

  .records-table th,
  .records-table td {
    padding-right: 13px;
    padding-left: 13px;
  }

  .records-table th {
    font-size: 12px;
  }

  .district-description {
    display: none;
  }

  .district-name {
    font-size: 16px;
  }

  .number-column {
    width: 58px;
  }

  .actions-column {
    width: 115px;
  }

  .row-number {
    width: 34px;
    height: 34px;
    font-size: 13px;
  }

  .district-icon {
    min-width: 42px;
    width: 42px;
    height: 42px;
    margin-right: 10px;
  }

  .record-action-button {
    width: 38px;
    height: 38px;
  }

  .pagination-footer {
    display: block;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
    margin-top: 15px;
    margin-left: 0;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .district-modal {
    max-width: none;
    border-radius: 22px 22px 0 0;
  }

  .modal-header {
    padding: 22px 18px;
  }

  .modal-header-icon {
    min-width: 52px;
    width: 52px;
    height: 52px;
    margin-right: 13px;
  }

  .modal-heading h2 {
    font-size: 21px;
  }

  .modal-heading p {
    max-width: 230px;
    font-size: 13px;
  }

  .modal-body {
    padding: 26px 19px 20px;
  }

  .modal-footer {
    padding: 14px 17px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>