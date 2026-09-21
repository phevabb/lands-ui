<template>
  <div class="leave-types-page">
    <section class="leave-types-header">
      <div class="leave-types-header-content">
        <div class="leave-types-header-icon">
          <md-icon>event_busy</md-icon>
        </div>

        <div class="leave-types-header-text">
          <span class="leave-types-header-label">
            SYSTEM CONFIGURATION
          </span>

          <h1 class="leave-types-header-title">
            On Leave Types
          </h1>

          <p class="leave-types-header-description">
            Create, update, search, and manage the leave types available
            when creating and updating staff accounts.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="leave-types-header-button"
        :disabled="loading"
        @click="openCreateModal"
      >
        <md-icon>add_circle</md-icon>
        <span>Add Leave Type</span>
      </button>
    </section>

    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>event_busy</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ leaveTypes.length }}
          </span>

          <span class="statistic-label">
            Total Leave Types
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredLeaveTypes.length }}
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

    <section class="records-card">
      <div class="records-toolbar">
        <div class="records-heading">
          <h2>Leave Type Records</h2>

          <p>
            Manage all staff leave types available in the HR system.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search leave types..."
              aria-label="Search leave types"
            />

            <button
              v-if="search"
              type="button"
              class="clear-search-button"
              title="Clear search"
              aria-label="Clear leave type search"
              @click="clearSearch"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading || refreshing"
            @click="refreshLeaveTypes"
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

      <div class="records-divider" />

      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>error_outline</md-icon>

          <div>
            <strong>Unable to load leave types</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="loadLeaveTypes"
        >
          Try Again
        </button>
      </div>

      <div
        v-if="loading && !leaveTypes.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>Loading leave types</h3>

        <p>
          Please wait while the leave type records are retrieved.
        </p>
      </div>

      <div
        v-else-if="paginatedLeaveTypes.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                Leave Type
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
              v-for="(leaveType, index) in paginatedLeaveTypes"
              :key="leaveType.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="leave-type-cell">
                  <div class="leave-type-icon">
                    <md-icon>event_busy</md-icon>
                  </div>

                  <div class="leave-type-information">
                    <span class="leave-type-name">
                      {{ leaveType.name }}
                    </span>

                    <span class="leave-type-description">
                      Staff leave type record
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="record-id">
                  #{{ leaveType.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit leave type"
                    :disabled="deletingId === leaveType.id"
                    @click="openEditModal(leaveType)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete leave type"
                    :disabled="deletingId === leaveType.id"
                    @click="deleteLeaveType(leaveType)"
                  >
                    <span
                      v-if="deletingId === leaveType.id"
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

      <div
        v-else
        class="empty-state"
      >
        <div class="empty-state-icon">
          <md-icon>
            {{ search ? "search_off" : "event_busy" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching leave type found"
              : "No leave types created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with a different leave type name."
              : "Create the first staff leave type."
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
          <span>Add Leave Type</span>
        </button>
      </div>

      <div
        v-if="filteredLeaveTypes.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredLeaveTypes.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="leave-types-page-size">
            Rows:
          </label>

          <select
            id="leave-types-page-size"
            v-model.number="pageSize"
            @change="handlePageSizeChange"
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

    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="leave-type-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="modalTitle"
        >
          <div class="modal-header">
            <div class="modal-header-icon">
              <md-icon>
                {{
                  editingId !== null
                    ? "edit"
                    : "add_circle"
                }}
              </md-icon>
            </div>

            <div class="modal-heading">
              <span class="modal-label">
                LEAVE TYPE
              </span>

              <h2>{{ modalTitle }}</h2>
              <p>{{ modalDescription }}</p>
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

          <form @submit.prevent="saveLeaveType">
            <div class="modal-body">
              <label
                class="form-label"
                for="leave-type-name"
              >
                Leave Type Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid: formSubmitted && nameError
                }"
              >
                <md-icon>event_busy</md-icon>

                <input
                  id="leave-type-name"
                  ref="nameInput"
                  v-model="form.name"
                  type="text"
                  maxlength="100"
                  autocomplete="off"
                  placeholder="Example: Annual Leave"
                  :disabled="saving"
                  @input="clearFormError"
                />
              </div>

              <div class="form-information">
                <span
                  class="form-error"
                  :class="{
                    visible: formSubmitted && nameError
                  }"
                >
                  {{ nameError || " " }}
                </span>

                <span class="character-count">
                  {{ form.name.length }} / 100
                </span>
              </div>

              <div class="form-hint">
                <md-icon>info_outline</md-icon>

                <span>
                  Enter a unique leave type name containing no more
                  than 100 characters.
                </span>
              </div>

              <div
                v-if="formError"
                class="modal-error"
              >
                <md-icon>error_outline</md-icon>
                <span>{{ formError }}</span>
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
                  {{ editingId !== null ? "save" : "add" }}
                </md-icon>

                <span>{{ submitButtonText }}</span>
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
const API_BASE_URL = "http://127.0.0.1:8888/api";

export default {
  name: "SuperOnLeaveTypes",

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

      leaveTypes: [],

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      form: {
        name: ""
      }
    };
  },

  computed: {
    filteredLeaveTypes() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.leaveTypes;
      }

      return this.leaveTypes.filter(leaveType => {
        const name = leaveType.name || "";

        return name
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedLeaveTypes() {
      return [...this.filteredLeaveTypes].sort(
        (first, second) => {
          const firstName = first.name
            ? first.name.trim().toLowerCase()
            : "";

          const secondName = second.name
            ? second.name.trim().toLowerCase()
            : "";

          return firstName.localeCompare(
            secondName
          );
        }
      );
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedLeaveTypes.length /
            this.pageSize
        )
      );
    },

    paginatedLeaveTypes() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      return this.sortedLeaveTypes.slice(
        start,
        start + this.pageSize
      );
    },

    paginationStart() {
      if (!this.sortedLeaveTypes.length) {
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
        this.sortedLeaveTypes.length
      );
    },

    modalTitle() {
      return this.editingId !== null
        ? "Edit Leave Type"
        : "Add Leave Type";
    },

    modalDescription() {
      return this.editingId !== null
        ? "Update the selected staff leave type."
        : "Create a new leave type for staff accounts.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId !== null
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId !== null
        ? "Update Leave Type"
        : "Create Leave Type";
    },

    nameError() {
      const name = this.form.name
        ? this.form.name.trim()
        : "";

      if (!name) {
        return "Leave type name is required.";
      }

      if (name.length < 2) {
        return "Leave type name must contain at least 2 characters.";
      }

      if (name.length > 100) {
        return "Leave type name cannot exceed 100 characters.";
      }

      const duplicate = this.leaveTypes.some(
        leaveType => {
          const existingName = leaveType.name
            ? leaveType.name
                .trim()
                .toLowerCase()
            : "";

          return (
            Number(leaveType.id) !==
              Number(this.editingId) &&
            existingName === name.toLowerCase()
          );
        }
      );

      if (duplicate) {
        return "This leave type already exists.";
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
    this.loadLeaveTypes();
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

    normalizeLeaveType(leaveType) {
      return {
        id: leaveType.id,
        name:
          leaveType.name ||
          leaveType.leaveTypeName ||
          ""
      };
    },

    getResponseRecords(responseData) {
      if (Array.isArray(responseData)) {
        return responseData;
      }

      if (
        responseData &&
        Array.isArray(responseData.data)
      ) {
        return responseData.data;
      }

      if (
        responseData &&
        Array.isArray(responseData.leaveTypes)
      ) {
        return responseData.leaveTypes;
      }

      return [];
    },

    async loadLeaveTypes() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/on-leave-types`,
          this.getRequestConfig()
        );

        const records =
          this.getResponseRecords(
            response.data
          );

        this.leaveTypes = records.map(
          leaveType => {
            return this.normalizeLeaveType(
              leaveType
            );
          }
        );

        this.lastUpdated = new Date();

        if (
          this.currentPage >
          this.totalPages
        ) {
          this.currentPage =
            this.totalPages;
        }
      } catch (error) {
        this.leaveTypes = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load leave types."
          );
      } finally {
        this.loading = false;
      }
    },

    async refreshLeaveTypes() {
      this.refreshing = true;

      try {
        await this.loadLeaveTypes();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusNameInput();
    },

    openEditModal(leaveType) {
      this.resetForm();

      this.editingId = leaveType.id;
      this.form.name = leaveType.name || "";

      this.showModal = true;
      this.focusNameInput();
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
        name: ""
      };

      this.formSubmitted = false;
      this.formError = "";
    },

    clearFormError() {
      this.formError = "";
    },

    focusNameInput() {
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
        }
      });
    },

    async saveLeaveType() {
      this.formSubmitted = true;
      this.formError = "";

      if (this.nameError) {
        this.focusNameInput();
        return;
      }

      this.saving = true;

      const payload = {
        name: this.form.name.trim()
      };

      try {
        if (this.editingId !== null) {
          await axios.put(
            `${API_BASE_URL}/on-leave-types/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Leave type updated",
            `"${payload.name}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/on-leave-types`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Leave type created",
            `"${payload.name}" was created successfully.`
          );
        }

        this.resetForm();
        await this.loadLeaveTypes();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the leave type."
          );
      } finally {
        this.saving = false;
      }
    },

    async deleteLeaveType(leaveType) {
      const leaveTypeName =
        leaveType.name ||
        "this leave type";

      const result = await Swal.fire({
        title: "Delete leave type?",

        html: `
          <div style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.7;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(leaveTypeName)}
            </strong>?
            <br><br>
            This action cannot be undone.
          </div>
        `,

        icon: "warning",
        showCancelButton: true,

        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",

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

      this.deletingId = leaveType.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/on-leave-types/${leaveType.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "Leave type deleted",

          text:
            `"${leaveTypeName}" was deleted successfully.`,

          icon: "success",

          confirmButtonColor: "#ea580c",

          confirmButtonText:
            '<span style="color: white;">Done</span>',

          timer: 2200,
          timerProgressBar: true
        });

        await this.loadLeaveTypes();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",

          text: this.getErrorMessage(
            error,
            "Unable to delete the leave type."
          ),

          icon: "error",

          confirmButtonColor: "#dc2626",

          confirmButtonText:
            '<span style="color: white;">Close</span>'
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

        confirmButtonColor: "#ea580c",

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

      if (
        responseData &&
        typeof responseData.error ===
          "string"
      ) {
        return responseData.error;
      }

      if (
        responseData &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length
      ) {
        return responseData.errors.join(", ");
      }

      if (status === 400) {
        return "Please check the submitted leave type name.";
      }

      if (status === 401) {
        return "Your session is no longer valid.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The leave type record or endpoint was not found.";
      }

      if (status === 409) {
        return "This leave type already exists.";
      }

      if (status === 422) {
        return "The submitted leave type could not be processed.";
      }

      if (status === 500) {
        return "The server could not process this request.";
      }

      return fallbackMessage;
    },

    escapeHtml(value) {
      const element =
        document.createElement("div");

      element.textContent = value || "";

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
.leave-types-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 32px;
  color: #1f2937;
  font-size: 16px;
}

/* Header */

.leave-types-header {
  position: relative !important;
  width: 100%;
  min-height: 0 !important;
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 0 20px !important;
  padding: 15px 18px !important;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #f5dfd0;
  border-left: 5px solid #ea580c;
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(234, 88, 12, 0.07),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fffefd 70%,
      #fff7ed 100%
    );
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.leave-types-header::before {
  content: "";
  position: absolute;
  top: -56px;
  right: 125px;
  width: 125px;
  height: 125px;
  border: 20px solid rgba(234, 88, 12, 0.035);
  border-radius: 50%;
  pointer-events: none;
}

.leave-types-header-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.leave-types-header-icon {
  min-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border-radius: 13px;
  background: linear-gradient(
    135deg,
    #c2410c,
    #ea580c
  );
  box-shadow: 0 7px 16px rgba(234, 88, 12, 0.23);
}

.leave-types-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 27px !important;
}

.leave-types-header-text {
  min-width: 0;
  flex: 1;
}

.leave-types-header-label {
  display: block;
  margin-bottom: 3px;
  color: #c2410c;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
}

.leave-types-header-title {
  margin: 0 !important;
  color: #172033;
  font-size: 25px !important;
  font-weight: 800;
  line-height: 1.25 !important;
}

.leave-types-header-description {
  max-width: 700px;
  margin: 5px 0 0 !important;
  color: #64748b;
  font-size: 16px !important;
  line-height: 1.5 !important;
}

.leave-types-header-button {
  position: relative;
  z-index: 2;
  min-height: 44px;
  height: 44px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-left: auto;
  padding: 0 17px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(
    135deg,
    #c2410c,
    #ea580c
  );
  box-shadow: 0 7px 16px rgba(234, 88, 12, 0.23);
  cursor: pointer;
}

.leave-types-header-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.leave-types-header-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

/* Statistics */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.statistic-card {
  min-height: 104px;
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
}

.statistic-icon {
  min-width: 54px;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
}

.statistic-icon .md-icon {
  color: inherit !important;
  font-size: 29px !important;
}

.statistic-icon-primary {
  color: #ea580c;
  background: #ffedd5;
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
  display: flex;
  flex-direction: column;
  margin-left: 15px;
}

.statistic-value {
  color: #111827;
  font-size: 25px;
  font-weight: 800;
}

.statistic-time {
  font-size: 19px;
}

.statistic-label {
  margin-top: 5px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
}

/* Records */

.records-card {
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

.records-toolbar h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
}

.records-toolbar p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-left: auto;
}

.records-divider {
  height: 1px;
  background: #e5e7eb;
}

.search-control {
  width: 320px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #f8fafc;
}

.search-control:focus-within {
  border-color: #ea580c;
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.09);
}

.search-control > .md-icon {
  color: #94a3b8 !important;
  font-size: 23px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  margin-left: 9px;
  color: #1f2937;
  font-size: 16px;
  border: 0;
  outline: none;
  background: transparent;
}

.clear-search-button {
  width: 31px;
  height: 31px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.clear-search-button .md-icon {
  color: #64748b !important;
  font-size: 20px !important;
}

.refresh-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  color: #c2410c;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #fed7aa;
  border-radius: 11px;
  background: #fff7ed;
  cursor: pointer;
}

.refresh-button .md-icon {
  color: #ea580c !important;
  font-size: 21px !important;
}

/* Error */

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
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-banner-content .md-icon {
  color: #dc2626 !important;
  font-size: 25px !important;
}

.error-banner-content div {
  display: flex;
  flex-direction: column;
}

.error-banner-content strong {
  font-size: 17px;
}

.error-banner-content span {
  margin-top: 4px;
  font-size: 16px;
}

.error-banner button {
  margin-left: auto;
  padding: 9px 14px;
  color: #ffffff;
  font-size: 16px;
  border: 0;
  border-radius: 9px;
  background: #dc2626;
  cursor: pointer;
}

/* Table */

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
  height: 58px;
  padding: 0 22px;
  color: #526176;
  font-size: 16px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 78px;
  padding: 12px 22px;
  color: #475569;
  font-size: 16px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr:hover {
  background: #fff7ed;
  box-shadow: inset 4px 0 0 #ea580c;
}

.number-column {
  width: 84px;
}

.identifier-column {
  width: 150px;
}

.actions-column {
  width: 160px;
  text-align: right !important;
}

.row-number {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c2410c;
  font-size: 16px;
  font-weight: 800;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  background: #fff7ed;
}

.leave-type-cell {
  display: flex;
  align-items: center;
}

.leave-type-icon {
  min-width: 47px;
  width: 47px;
  height: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border-radius: 13px;
  background: #ffedd5;
}

.leave-type-icon .md-icon {
  color: #ea580c !important;
  font-size: 25px !important;
}

.leave-type-information {
  display: flex;
  flex-direction: column;
}

.leave-type-name {
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
}

.leave-type-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 16px;
}

.record-id {
  display: inline-block;
  padding: 7px 10px;
  color: #475569;
  font-size: 16px;
  font-weight: 700;
  border-radius: 9px;
  background: #f1f5f9;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.record-action-button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}

.record-action-button .md-icon {
  color: inherit !important;
  font-size: 22px !important;
}

.edit-button {
  color: #2563eb;
  background: #dbeafe;
}

.delete-button {
  color: #dc2626;
  background: #fee2e2;
}

/* States */

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

.loading-spinner,
.button-spinner,
.small-spinner {
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #ffedd5;
  border-top-color: #ea580c;
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
  font-size: 20px;
}

.loading-state p,
.empty-state p {
  margin: 8px 0 18px;
  color: #64748b;
  font-size: 16px;
}

.empty-state-icon {
  width: 78px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  background: #ffedd5;
}

.empty-state-icon .md-icon {
  color: #ea580c !important;
  font-size: 42px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 17px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #ea580c;
}

.empty-secondary-button {
  color: #c2410c;
  border: 1px solid #fed7aa;
  background: #fff7ed;
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

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
}

.pagination-controls label,
.pagination-controls select,
.pagination-page {
  font-size: 16px;
}

.pagination-controls select {
  height: 38px;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
}

.pagination-button {
  width: 38px;
  height: 38px;
  color: #ea580c;
  border: 1px solid #fed7aa;
  border-radius: 9px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-button:disabled {
  color: #cbd5e1;
  border-color: #e5e7eb;
}

.pagination-button .md-icon {
  color: inherit !important;
  font-size: 23px !important;
}

/* Modal */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
}

.leave-type-modal {
  width: 100%;
  max-width: 620px;
  max-height: calc(100vh - 44px);
  overflow-y: auto;
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 32px 85px rgba(15, 23, 42, 0.34);
}

.modal-header {
  min-height: 118px;
  display: flex;
  align-items: center;
  padding: 24px 26px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #7c2d12,
    #c2410c,
    #ea580c
  );
}

.modal-header-icon {
  min-width: 56px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
}

.modal-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 30px !important;
}

.modal-heading {
  min-width: 0;
  flex: 1;
}

.modal-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  font-weight: 800;
}

.modal-heading h2 {
  margin: 5px 0 4px;
  color: #ffffff;
  font-size: 23px;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
}

.modal-close-button {
  width: 42px;
  height: 42px;
  margin-left: 16px;
  color: #ffffff;
  border: 0;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.modal-close-button .md-icon {
  color: #ffffff !important;
  font-size: 24px !important;
}

.modal-body {
  padding: 30px 27px 23px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.form-label span {
  color: #dc2626;
}

.form-input-wrapper {
  min-height: 57px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border: 1px solid #d4dce8;
  border-radius: 13px;
}

.form-input-wrapper:focus-within {
  border-color: #ea580c;
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
}

.form-input-wrapper .md-icon {
  margin-right: 11px;
  color: #ea580c !important;
  font-size: 24px !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  color: #1f2937;
  font-size: 16px;
  border: 0;
  outline: none;
}

.form-information {
  min-height: 34px;
  display: flex;
  padding-top: 7px;
}

.form-error,
.character-count {
  font-size: 16px;
}

.form-error {
  color: #dc2626;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  margin-left: auto;
  color: #64748b;
}

.form-hint {
  display: flex;
  margin-top: 8px;
  padding: 13px 14px;
  color: #526176;
  font-size: 16px;
  border: 1px solid #fed7aa;
  border-radius: 11px;
  background: #fff7ed;
}

.form-hint .md-icon {
  margin-right: 9px;
  color: #ea580c !important;
  font-size: 21px !important;
}

.modal-error {
  margin-top: 16px;
  padding: 13px 14px;
  color: #991b1b;
  font-size: 16px;
  background: #fef2f2;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 11px;
  padding: 15px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 47px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 11px;
  cursor: pointer;
}

.cancel-button {
  color: #526176;
  border: 1px solid #d4dce8;
  background: #ffffff;
}

.save-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #ffffff;
  border: 0;
  background: #ea580c;
}

.rotating,
.button-spinner,
.small-spinner {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */

@media (max-width: 991px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar-actions {
    display: block;
  }

  .refresh-button {
    width: 100%;
    margin-top: 10px;
  }
}

@media (max-width: 767px) {
  .leave-types-header,
  .records-toolbar {
    display: block;
  }

  .leave-types-header-button {
    width: 100%;
    margin-top: 14px;
    margin-left: 0;
  }

  .toolbar-actions {
    margin-top: 16px;
    margin-left: 0;
  }

  .search-control {
    width: 100%;
  }

  .identifier-column,
  .records-table td:nth-child(3) {
    display: none;
  }
}

@media (max-width: 575px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .leave-type-description {
    display: none;
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

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .leave-type-modal {
    max-width: none;
    max-height: 94vh;
    border-radius: 21px 21px 0 0;
  }

  .cancel-button,
  .save-button {
    flex: 1;
  }
}
</style>