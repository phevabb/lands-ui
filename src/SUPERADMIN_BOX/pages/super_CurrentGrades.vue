<template>
  <div class="current-grades-page">
    <!-- Page header -->
   <section class="cg-header">
  <div class="cg-header-content">
    <div class="cg-header-icon">
      <md-icon>grade</md-icon>
    </div>

    <div class="cg-header-text">
      <span class="cg-header-label">
        SYSTEM CONFIGURATION
      </span>

      <h1 class="cg-header-title">
        Current Grades
      </h1>

      <p class="cg-header-description">
        Create, update, search, and manage current staff grades
        used when creating and updating staff accounts.
      </p>
    </div>
  </div>

  <button
    type="button"
    class="cg-header-button"
    :disabled="loading"
    @click="openCreateModal"
  >
    <md-icon>add_circle</md-icon>
    <span>Add Current Grade</span>
  </button>
</section>

    <!-- Statistics -->
    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>grade</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ currentGrades.length }}
          </span>

          <span class="statistic-label">
            Total Current Grades
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredCurrentGrades.length }}
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
          <span class="statistic-value">
            {{ lastUpdatedLabel }}
          </span>

          <span class="statistic-label">
            Last Refreshed
          </span>
        </div>
      </div>
    </section>

    <!-- Records -->
    <section class="records-card">
      <div class="records-toolbar">
        <div>
          <h2>Current Grade Records</h2>

          <p>
            Manage all current staff grades available in the HR system.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search current grades..."
              aria-label="Search current grades"
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
            @click="refreshCurrentGrades"
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

      <!-- Error -->
      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>error_outline</md-icon>

          <div>
            <strong>Unable to load current grades</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="loadCurrentGrades"
        >
          Try Again
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading && !currentGrades.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>Loading current grades</h3>

        <p>
          Please wait while the records are retrieved.
        </p>
      </div>

      <!-- Data table -->
      <div
        v-else-if="paginatedCurrentGrades.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Current Grade</th>
              <th class="identifier-column">Record ID</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(grade, index) in paginatedCurrentGrades"
              :key="grade.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="grade-cell">
                  <div class="grade-icon">
                    <md-icon>grade</md-icon>
                  </div>

                  <div class="grade-information">
                    <span class="grade-name">
                      {{ grade.currentGrade }}
                    </span>

                    <span class="grade-description">
                      Current staff grade record
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="record-id">
                  #{{ grade.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit current grade"
                    :disabled="deletingId === grade.id"
                    @click="openEditModal(grade)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete current grade"
                    :disabled="deletingId === grade.id"
                    @click="deleteCurrentGrade(grade)"
                  >
                    <span
                      v-if="deletingId === grade.id"
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
            {{ search ? "search_off" : "grade" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching current grade found"
              : "No current grades created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with a different grade name."
              : "Create the first current grade for the HR system."
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
          Add Current Grade
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredCurrentGrades.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredCurrentGrades.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="current-grades-page-size">
            Rows:
          </label>

          <select
            id="current-grades-page-size"
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

    <!-- Create/Edit modal -->
    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="grade-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="modalTitle"
        >
          <div class="modal-header">
            <div class="modal-header-icon">
              <md-icon>
                {{ editingId ? "edit" : "add_circle" }}
              </md-icon>
            </div>

            <div class="modal-heading">
              <span class="modal-label">
                CURRENT GRADE
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

          <form @submit.prevent="saveCurrentGrade">
            <div class="modal-body">
              <label
                class="form-label"
                for="current-grade-name"
              >
                Current Grade Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid:
                    formSubmitted &&
                    currentGradeError
                }"
              >
                <md-icon>grade</md-icon>

                <input
                  id="current-grade-name"
                  ref="currentGradeInput"
                  v-model="form.currentGrade"
                  type="text"
                  maxlength="100"
                  autocomplete="off"
                  placeholder="Example: Assistant Director"
                  :disabled="saving"
                  @input="clearFormError"
                />
              </div>

              <div class="form-information">
                <span
                  class="form-error"
                  :class="{
                    visible:
                      formSubmitted &&
                      currentGradeError
                  }"
                >
                  {{ currentGradeError || " " }}
                </span>

                <span class="character-count">
                  {{ form.currentGrade.length }} / 100
                </span>
              </div>

              <div class="form-hint">
                <md-icon>info_outline</md-icon>

                <span>
                  Current grade names must be unique and cannot exceed
                  100 characters.
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
                  {{ editingId ? "save" : "add" }}
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

// Local/testing API
 const API_BASE_URL = "http://127.0.0.1:8888/api";

export default {
  name: "SuperCurrentGrades",

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

      currentGrades: [],

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      form: {
        currentGrade: ""
      }
    };
  },

  computed: {
    filteredCurrentGrades() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.currentGrades;
      }

      return this.currentGrades.filter(grade => {
        const gradeName =
          grade.currentGrade || "";

        return gradeName
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedCurrentGrades() {
      return [...this.filteredCurrentGrades].sort(
        (first, second) => {
          const firstName =
            first.currentGrade
              ? first.currentGrade
                  .trim()
                  .toLowerCase()
              : "";

          const secondName =
            second.currentGrade
              ? second.currentGrade
                  .trim()
                  .toLowerCase()
              : "";

          return firstName.localeCompare(secondName);
        }
      );
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedCurrentGrades.length /
            this.pageSize
        )
      );
    },

    paginatedCurrentGrades() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      return this.sortedCurrentGrades.slice(
        start,
        start + this.pageSize
      );
    },

    paginationStart() {
      if (!this.sortedCurrentGrades.length) {
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
        this.sortedCurrentGrades.length
      );
    },

    modalTitle() {
      return this.editingId
        ? "Edit Current Grade"
        : "Add Current Grade";
    },

    modalDescription() {
      return this.editingId
        ? "Update the selected current staff grade."
        : "Create a new current grade for staff accounts.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId
        ? "Update Current Grade"
        : "Create Current Grade";
    },

    currentGradeError() {
      const currentGrade =
        this.form.currentGrade
          ? this.form.currentGrade.trim()
          : "";

      if (!currentGrade) {
        return "Current grade name is required.";
      }

      if (currentGrade.length < 2) {
        return "Current grade name must contain at least 2 characters.";
      }

      if (currentGrade.length > 100) {
        return "Current grade name cannot exceed 100 characters.";
      }

      const duplicate =
        this.currentGrades.some(grade => {
          const existingName =
            grade.currentGrade
              ? grade.currentGrade
                  .trim()
                  .toLowerCase()
              : "";

          return (
            grade.id !== this.editingId &&
            existingName ===
              currentGrade.toLowerCase()
          );
        });

      if (duplicate) {
        return "This current grade already exists.";
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
    this.loadCurrentGrades();
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

    async loadCurrentGrades() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/current-grades`,
          this.getRequestConfig()
        );

        this.currentGrades =
          Array.isArray(response.data)
            ? response.data
            : [];

        this.lastUpdated = new Date();
      } catch (error) {
        this.currentGrades = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load current grades."
          );

        console.error(
          "Unable to load current grades",
          error
        );
      } finally {
        this.loading = false;
      }
    },

    async refreshCurrentGrades() {
      this.refreshing = true;

      try {
        await this.loadCurrentGrades();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusCurrentGradeInput();
    },

    openEditModal(grade) {
      this.resetForm();

      this.editingId = grade.id;

      this.form.currentGrade =
        grade.currentGrade || "";

      this.showModal = true;
      this.focusCurrentGradeInput();
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
        currentGrade: ""
      };

      this.formSubmitted = false;
      this.formError = "";
    },

    clearFormError() {
      this.formError = "";
    },

    focusCurrentGradeInput() {
      this.$nextTick(() => {
        if (
          this.$refs.currentGradeInput
        ) {
          this.$refs.currentGradeInput.focus();
        }
      });
    },

    async saveCurrentGrade() {
      this.formSubmitted = true;
      this.formError = "";

      if (this.currentGradeError) {
        this.focusCurrentGradeInput();
        return;
      }

      this.saving = true;

      const payload = {
        currentGrade:
          this.form.currentGrade.trim()
      };

      try {
        if (this.editingId) {
          await axios.put(
            `${API_BASE_URL}/current-grades/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Current grade updated",
            `"${payload.currentGrade}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/current-grades`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Current grade created",
            `"${payload.currentGrade}" was created successfully.`
          );
        }

        this.resetForm();
        await this.loadCurrentGrades();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the current grade."
          );

        console.error(
          "Unable to save current grade",
          error
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteCurrentGrade(grade) {
      const gradeName =
        grade.currentGrade ||
        "this current grade";

      const result = await Swal.fire({
        title: "Delete current grade?",
        html: `
          <div style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(gradeName)}
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

      this.deletingId = grade.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/current-grades/${grade.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "Current grade deleted",
          text: `"${gradeName}" was deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#16a34a",
          confirmButtonText: "Done",
          timer: 2200,
          timerProgressBar: true
        });

        await this.loadCurrentGrades();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",
          text: this.getErrorMessage(
            error,
            "Unable to delete the current grade."
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
        confirmButtonColor: "#16a34a",
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
        typeof responseData.message === "string"
      ) {
        return responseData.message;
      }

      if (status === 400) {
        return "Please check the submitted current grade name.";
      }

      if (status === 401) {
        return "Your session is no longer valid.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The current grade was not found.";
      }

      if (status === 409) {
        return "This current grade already exists.";
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
.current-grades-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 30px;
}

/* Header */


.cg-header {
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

  border: 1px solid #dcebe4;
  border-left: 4px solid #059669;
  border-radius: 12px;

  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(5, 150, 105, 0.06),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fcfefd 70%,
      #ecfdf5 100%
    );

  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.055);
}

.cg-header::before {
  content: "";
  position: absolute;
  top: -52px;
  right: 120px;

  width: 115px;
  height: 115px;

  border: 18px solid rgba(5, 150, 105, 0.035);
  border-radius: 50%;

  pointer-events: none;
}

.cg-header-content {
  position: relative;
  z-index: 2;

  min-width: 0;

  display: flex;
  flex: 1;
  align-items: center;
}

.cg-header-icon {
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
    #047857,
    #10b981
  );

  box-shadow: 0 6px 14px rgba(5, 150, 105, 0.22);
}

.cg-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;

  margin: 0 !important;
  padding: 0 !important;

  color: #ffffff !important;
  font-size: 24px !important;
  line-height: 1 !important;
}

.cg-header-text {
  min-width: 0;
  flex: 1;
}

.cg-header-label {
  display: block;

  margin: 0 0 2px;
  padding: 0;

  color: #047857;

  font-size: 9px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.cg-header-title {
  margin: 0 !important;
  padding: 0 !important;

  color: #172033;

  font-size: 20px !important;
  font-weight: 800;
  line-height: 1.25 !important;
  letter-spacing: -0.2px;
}

.cg-header-description {
  max-width: 620px;

  margin: 3px 0 0 !important;
  padding: 0 !important;

  color: #64748b;

  font-size: 12px !important;
  font-weight: 400;
  line-height: 1.4 !important;
}

.cg-header-button {
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
    #047857,
    #10b981
  );

  box-shadow: 0 6px 14px rgba(5, 150, 105, 0.22);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.cg-header-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 9px 18px rgba(5, 150, 105, 0.28);
}

.cg-header-button:active:not(:disabled) {
  transform: translateY(0);
}

.cg-header-button:focus-visible {
  box-shadow:
    0 0 0 3px rgba(5, 150, 105, 0.15),
    0 6px 14px rgba(5, 150, 105, 0.22);
}






/* Statistics */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 21px;
}

.statistic-card {
  display: flex;
  align-items: center;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 8px 21px rgba(15, 23, 42, 0.045);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.statistic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 13px 28px rgba(15, 23, 42, 0.08);
}

.statistic-icon {
  min-width: 48px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
}

.statistic-icon .md-icon {
  color: inherit !important;
  font-size: 26px !important;
}

.statistic-icon-primary {
  color: #2563eb;
  background: #dbeafe;
}

.statistic-icon-success {
  color: #059669;
  background: #d1fae5;
}

.statistic-icon-purple {
  color: #7c3aed;
  background: #ede9fe;
}

.statistic-content {
  display: flex;
  flex-direction: column;
  margin-left: 13px;
}

.statistic-value {
  color: #111827;
  font-size: 20px;
  font-weight: 800;
}

.statistic-label {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 16px;
  font-weight: 600;
}

/* Records */

.records-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 13px 32px rgba(15, 23, 42, 0.065);
}

.records-toolbar {
  min-height: 82px;
  display: flex;
  align-items: center;
  padding: 19px 23px;
}

.records-toolbar h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
}

.records-toolbar p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.search-control {
  width: 285px;
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #f8fafc;
}

.search-control:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.09);
}

.search-control > .md-icon {
  color: #94a3b8 !important;
  font-size: 20px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  margin-left: 8px;
  color: #334155;
  font-size: 16px;
  border: 0;
  outline: none;
  background: transparent;
}

.clear-search-button {
  display: flex;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.clear-search-button .md-icon {
  color: #94a3b8 !important;
  font-size: 17px !important;
}

.refresh-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  color: #047857;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  background: #ecfdf5;
  cursor: pointer;
}

.refresh-button .md-icon {
  color: #059669 !important;
  font-size: 19px !important;
}

.records-divider {
  height: 1px;
  background: #edf2f7;
}

/* Error */

.error-banner {
  display: flex;
  align-items: center;
  margin: 18px;
  padding: 13px 15px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.error-banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-banner-content .md-icon {
  color: #dc2626 !important;
}

.error-banner-content div {
  display: flex;
  flex-direction: column;
}

.error-banner-content strong {
  font-size: 16px;
}

.error-banner-content span {
  margin-top: 3px;
  font-size: 16px;
}

.error-banner button {
  margin-left: auto;
  padding: 7px 11px;
  color: #ffffff;
  font-size: 16px;
  border: 0;
  border-radius: 8px;
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
  height: 52px;
  padding: 0 20px;
  color: #64748b;
  font-size: 16px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 69px;
  padding: 10px 20px;
  color: #475569;
  font-size: 16px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr:hover {
  background: #ecfdf5;
  box-shadow: inset 4px 0 0 #059669;
}

.number-column {
  width: 80px;
}

.identifier-column {
  width: 140px;
}

.actions-column {
  width: 150px;
  text-align: right !important;
}

.row-number {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #047857;
  font-size: 16px;
  font-weight: 800;
  border: 1px solid #a7f3d0;
  border-radius: 9px;
  background: #ecfdf5;
}

.grade-cell {
  display: flex;
  align-items: center;
}

.grade-icon {
  min-width: 39px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  border-radius: 11px;
  background: #d1fae5;
}

.grade-icon .md-icon {
  color: #059669 !important;
  font-size: 21px !important;
}

.grade-information {
  display: flex;
  flex-direction: column;
}

.grade-name {
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.grade-description {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 16px;
}

.record-id {
  display: inline-block;
  padding: 5px 8px;
  color: #475569;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  background: #f1f5f9;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
}

.record-action-button {
  width: 33px;
  height: 33px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.record-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
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
  font-size: 18px !important;
}

/* States */

.loading-state,
.empty-state {
  min-height: 310px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 38px 20px;
  text-align: center;
}

.loading-spinner,
.button-spinner,
.small-spinner {
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 43px;
  height: 43px;
  border: 4px solid #d1fae5;
  border-top-color: #059669;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
}

.small-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid #fecaca;
  border-top-color: #dc2626;
}

.loading-state h3,
.empty-state h3 {
  margin: 15px 0 0;
  color: #475569;
  font-size: 16px;
}

.loading-state p,
.empty-state p {
  margin: 6px 0 15px;
  color: #94a3b8;
  font-size: 16px;
}

.empty-state-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #f1f5f9;
}

.empty-state-icon .md-icon {
  color: #059669 !important;
  font-size: 38px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 38px;
  padding: 0 13px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 9px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #059669;
}

.empty-secondary-button {
  color: #047857;
  border: 1px solid #a7f3d0;
  background: #ecfdf5;
}

/* Pagination */

.pagination-footer {
  min-height: 64px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #64748b;
  font-size: 16px;
  background: #f8fafc;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.pagination-button {
  width: 31px;
  height: 31px;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: #ffffff;
}

/* Modal */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
}

.grade-modal {
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  border-radius: 19px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 21px 23px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #064e3b,
    #047857,
    #10b981
  );
}

.modal-header-icon {
  min-width: 49px;
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
}

.modal-header-icon .md-icon,
.modal-close-button .md-icon {
  color: #ffffff !important;
}

.modal-label {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
}

.modal-heading h2 {
  margin: 4px 0 3px;
  color: #ffffff;
  font-size: 17px;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
}

.modal-close-button {
  margin-left: auto;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.modal-body {
  padding: 27px 24px 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 16px;
  font-weight: 700;
}

.form-label span {
  color: #dc2626;
}

.form-input-wrapper {
  min-height: 49px;
  display: flex;
  align-items: center;
  padding: 0 13px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
}

.form-input-wrapper:focus-within {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
}

.form-input-wrapper .md-icon {
  margin-right: 10px;
  color: #059669 !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: none;
}

.form-information {
  min-height: 26px;
  display: flex;
  padding-top: 5px;
}

.form-error {
  color: #dc2626;
  font-size: 16px;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  margin-left: auto;
  color: #94a3b8;
  font-size: 16px;
}

.form-hint {
  display: flex;
  margin-top: 6px;
  padding: 10px 11px;
  color: #64748b;
  font-size: 16px;
  border: 1px solid #a7f3d0;
  border-radius: 9px;
  background: #ecfdf5;
}

.form-hint .md-icon {
  margin-right: 7px;
  color: #059669 !important;
}

.modal-error {
  margin-top: 13px;
  padding: 10px;
  color: #991b1b;
  font-size: 16px;
  background: #fef2f2;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 13px 21px;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 40px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 9px;
}

.cancel-button {
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.save-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #ffffff;
  border: 0;
  background: linear-gradient(
    135deg,
    #047857,
    #10b981
  );
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.rotating {
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
}

@media (max-width: 767px) {
  .page-header,
  .records-toolbar {
    display: block;
  }

  .header-add-button,
  .search-control,
  .refresh-button {
    width: 100%;
    margin-top: 15px;
  }

  .toolbar-actions {
    display: block;
    margin-left: 0;
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

  .page-header {
    padding: 22px 18px;
  }

  .pagination-footer {
    display: block;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
    margin-top: 12px;
    margin-left: 0;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .grade-modal {
    border-radius: 19px 19px 0 0;
  }

  .cancel-button,
  .save-button {
    flex: 1;
  }
}
</style>