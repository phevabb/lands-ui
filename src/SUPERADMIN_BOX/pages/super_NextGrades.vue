<template>
  <div class="next-grades-page">
    <!-- Page header -->
    <section class="ng-header">
  <div class="ng-header-content">
    <div class="ng-header-icon">
      <md-icon>trending_up</md-icon>
    </div>

    <div class="ng-header-text">
      <span class="ng-header-label">
        SYSTEM CONFIGURATION
      </span>

      <h1 class="ng-header-title">
        Next Grades
      </h1>

      <p class="ng-header-description">
        Create, edit, search, and manage the next grades used for
        staff promotions and career progression.
      </p>
    </div>
  </div>

  <button
    type="button"
    class="ng-header-button"
    :disabled="loading"
    @click="openCreateModal"
  >
    <md-icon>add_circle</md-icon>

    <span>Add Next Grade</span>
  </button>
</section>

    <!-- Statistics -->
    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>trending_up</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ nextGrades.length }}
          </span>

          <span class="statistic-label">
            Total Next Grades
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredNextGrades.length }}
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

    <!-- Records card -->
    <section class="records-card">
      <div class="records-toolbar">
        <div>
          <h2>Next Grade Records</h2>

          <p>
            Manage all promotion and career progression grades.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search next grades..."
              aria-label="Search next grades"
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
            @click="refreshNextGrades"
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
            <strong>Unable to load next grades</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="loadNextGrades"
        >
          Try Again
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading && !nextGrades.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>Loading next grades</h3>

        <p>
          Please wait while the next-grade records are retrieved.
        </p>
      </div>

      <!-- Records table -->
      <div
        v-else-if="paginatedNextGrades.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Next Grade</th>
              <th class="identifier-column">Record ID</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(grade, index) in paginatedNextGrades"
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
                    <md-icon>trending_up</md-icon>
                  </div>

                  <div class="grade-information">
                    <span class="grade-name">
                      {{ grade.nextGrade }}
                    </span>

                    <span class="grade-description">
                      Next promotion grade record
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
                    title="Edit next grade"
                    :disabled="deletingId === grade.id"
                    @click="openEditModal(grade)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete next grade"
                    :disabled="deletingId === grade.id"
                    @click="deleteNextGrade(grade)"
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
            {{ search ? "search_off" : "trending_up" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching next grade found"
              : "No next grades created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with another grade name."
              : "Create the first next grade for staff promotion."
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
          Add Next Grade
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredNextGrades.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredNextGrades.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="next-grades-page-size">
            Rows:
          </label>

          <select
            id="next-grades-page-size"
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
                NEXT GRADE
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

          <form @submit.prevent="saveNextGrade">
            <div class="modal-body">
              <label
                class="form-label"
                for="next-grade-name"
              >
                Next Grade Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid:
                    formSubmitted &&
                    nextGradeError
                }"
              >
                <md-icon>trending_up</md-icon>

                <input
                  id="next-grade-name"
                  ref="nextGradeInput"
                  v-model="form.nextGrade"
                  type="text"
                  maxlength="100"
                  autocomplete="off"
                  placeholder="Example: Deputy Director"
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
                      nextGradeError
                  }"
                >
                  {{ nextGradeError || " " }}
                </span>

                <span class="character-count">
                  {{ form.nextGrade.length }} / 100
                </span>
              </div>

              <div class="form-hint">
                <md-icon>info_outline</md-icon>

                <span>
                  Next grade names must be unique and cannot exceed
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
const API_BASE_URL  = "http://127.0.0.1:8888/api";

export default {
  name: "SuperNextGrades",

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

      nextGrades: [],

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      form: {
        nextGrade: ""
      }
    };
  },

  computed: {
    filteredNextGrades() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.nextGrades;
      }

      return this.nextGrades.filter(grade => {
        const gradeName =
          grade.nextGrade || "";

        return gradeName
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedNextGrades() {
      return [...this.filteredNextGrades].sort(
        (first, second) => {
          const firstName =
            first.nextGrade
              ? first.nextGrade
                  .trim()
                  .toLowerCase()
              : "";

          const secondName =
            second.nextGrade
              ? second.nextGrade
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
          this.sortedNextGrades.length /
            this.pageSize
        )
      );
    },

    paginatedNextGrades() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      return this.sortedNextGrades.slice(
        start,
        start + this.pageSize
      );
    },

    paginationStart() {
      if (!this.sortedNextGrades.length) {
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
        this.sortedNextGrades.length
      );
    },

    modalTitle() {
      return this.editingId
        ? "Edit Next Grade"
        : "Add Next Grade";
    },

    modalDescription() {
      return this.editingId
        ? "Update the selected next promotion grade."
        : "Create a new next grade for staff progression.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId
        ? "Update Next Grade"
        : "Create Next Grade";
    },

    nextGradeError() {
      const gradeName =
        this.form.nextGrade
          ? this.form.nextGrade.trim()
          : "";

      if (!gradeName) {
        return "Next grade is required.";
      }

      if (gradeName.length < 2) {
        return "Next grade must contain at least 2 characters.";
      }

      if (gradeName.length > 100) {
        return "Next grade cannot exceed 100 characters.";
      }

      const duplicate =
        this.nextGrades.some(grade => {
          const existingName =
            grade.nextGrade
              ? grade.nextGrade
                  .trim()
                  .toLowerCase()
              : "";

          return (
            grade.id !== this.editingId &&
            existingName ===
              gradeName.toLowerCase()
          );
        });

      if (duplicate) {
        return "This next grade already exists.";
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
    this.loadNextGrades();
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

    async loadNextGrades() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/next-grades`,
          this.getRequestConfig()
        );

        this.nextGrades =
          Array.isArray(response.data)
            ? response.data
            : [];

        this.lastUpdated = new Date();
      } catch (error) {
        this.nextGrades = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load next grades."
          );

        console.error(
          "Unable to load next grades",
          error
        );
      } finally {
        this.loading = false;
      }
    },

    async refreshNextGrades() {
      this.refreshing = true;

      try {
        await this.loadNextGrades();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusNextGradeInput();
    },

    openEditModal(grade) {
      this.resetForm();

      this.editingId = grade.id;

      this.form.nextGrade =
        grade.nextGrade || "";

      this.showModal = true;
      this.focusNextGradeInput();
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
        nextGrade: ""
      };

      this.formSubmitted = false;
      this.formError = "";
    },

    clearFormError() {
      this.formError = "";
    },

    focusNextGradeInput() {
      this.$nextTick(() => {
        if (
          this.$refs.nextGradeInput
        ) {
          this.$refs.nextGradeInput.focus();
        }
      });
    },

    async saveNextGrade() {
      this.formSubmitted = true;
      this.formError = "";

      if (this.nextGradeError) {
        this.focusNextGradeInput();
        return;
      }

      this.saving = true;

      const payload = {
        nextGrade:
          this.form.nextGrade.trim()
      };

      try {
        if (this.editingId) {
          await axios.put(
            `${API_BASE_URL}/next-grades/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Next grade updated",
            `"${payload.nextGrade}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/next-grades`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Next grade created",
            `"${payload.nextGrade}" was created successfully.`
          );
        }

        this.resetForm();
        await this.loadNextGrades();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the next grade."
          );

        console.error(
          "Unable to save next grade",
          error
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteNextGrade(grade) {
      const gradeName =
        grade.nextGrade ||
        "this next grade";

      const result = await Swal.fire({
        title: "Delete next grade?",
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
          `${API_BASE_URL}/next-grades/${grade.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "Next grade deleted",
          text: `"${gradeName}" was deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#0891b2",
          confirmButtonText: "Done",
          timer: 2200,
          timerProgressBar: true
        });

        await this.loadNextGrades();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",
          text: this.getErrorMessage(
            error,
            "Unable to delete the next grade."
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
        confirmButtonColor: "#0891b2",
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
        return "Please check the submitted next grade name.";
      }

      if (status === 401) {
        return "Your session is no longer valid.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The next grade was not found.";
      }

      if (status === 409) {
        return "This next grade already exists.";
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

.next-grades-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 30px;
  color: #1f2937;
}

/* Next Grades compact header */

.ng-header {
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

  border: 1px solid #d9edf2;
  border-left: 4px solid #0891b2;
  border-radius: 12px;

  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(8, 145, 178, 0.06),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fcfeff 70%,
      #ecfeff 100%
    );

  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.055);
}

.ng-header::before {
  content: "";
  position: absolute;
  top: -52px;
  right: 120px;
  width: 115px;
  height: 115px;
  border: 18px solid rgba(8, 145, 178, 0.035);
  border-radius: 50%;
  pointer-events: none;
}

.ng-header-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.ng-header-icon {
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
    #0e7490,
    #0891b2
  );

  box-shadow: 0 6px 14px rgba(8, 145, 178, 0.22);
}

.ng-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 24px !important;
  line-height: 1 !important;
}

.ng-header-text {
  min-width: 0;
  flex: 1;
}

.ng-header-label {
  display: block;
  margin: 0 0 2px;
  padding: 0;
  color: #0e7490;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.ng-header-title {
  margin: 0 !important;
  padding: 0 !important;
  color: #172033;
  font-size: 20px !important;
  font-weight: 800;
  line-height: 1.25 !important;
  letter-spacing: -0.2px;
}

.ng-header-description {
  max-width: 620px;
  margin: 3px 0 0 !important;
  padding: 0 !important;
  color: #64748b;
  font-size: 12px !important;
  font-weight: 400;
  line-height: 1.4 !important;
}

.ng-header-button {
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
    #0e7490,
    #0891b2
  );

  box-shadow: 0 6px 14px rgba(8, 145, 178, 0.22);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.ng-header-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 9px 18px rgba(8, 145, 178, 0.28);
}

.ng-header-button:active:not(:disabled) {
  transform: translateY(0);
}

.ng-header-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(8, 145, 178, 0.14),
    0 6px 14px rgba(8, 145, 178, 0.22);
}

.ng-header-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ng-header-button .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 18px !important;
  line-height: 1 !important;
}

/* Statistics */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 21px;
}

.statistic-card {
  min-height: 96px;
  display: flex;
  align-items: center;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 8px 21px rgba(15, 23, 42, 0.045);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.statistic-card:hover {
  border-color: #a5f3fc;
  transform: translateY(-2px);
  box-shadow: 0 13px 28px rgba(15, 23, 42, 0.08);
}

.statistic-icon {
  min-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
}

.statistic-icon .md-icon {
  color: inherit !important;
  font-size: 27px !important;
}

.statistic-icon-primary {
  color: #0891b2;
  background: #cffafe;
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
  margin-left: 13px;
}

.statistic-value {
  color: #111827;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.25;
}

.statistic-label {
  margin-top: 4px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

/* Records card */

.records-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 13px 32px rgba(15, 23, 42, 0.065);
}

.records-toolbar {
  min-height: 86px;
  display: flex;
  align-items: center;
  padding: 19px 23px;
}

.records-toolbar h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
}

.records-toolbar p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.records-divider {
  height: 1px;
  background: #edf2f7;
}

/* Search */

.search-control {
  width: 300px;
  height: 45px;
  display: flex;
  align-items: center;
  padding: 0 13px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.search-control:focus-within {
  border-color: #0891b2;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.09);
}

.search-control > .md-icon {
  color: #94a3b8 !important;
  font-size: 21px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  margin-left: 8px;
  color: #334155;
  font-size: 14px;
  border: 0;
  outline: none;
  background: transparent;
}

.search-control input::placeholder {
  color: #94a3b8;
}

.clear-search-button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 7px;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.clear-search-button:hover {
  background: #e2e8f0;
}

.clear-search-button .md-icon {
  color: #64748b !important;
  font-size: 18px !important;
}

.refresh-button {
  min-height: 45px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 15px;
  color: #0e7490;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #a5f3fc;
  border-radius: 10px;
  outline: none;
  background: #ecfeff;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #cffafe;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.refresh-button .md-icon {
  color: #0891b2 !important;
  font-size: 20px !important;
}

/* Error */

.error-banner {
  display: flex;
  align-items: center;
  margin: 18px;
  padding: 14px 16px;
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
  font-size: 24px !important;
}

.error-banner-content div {
  display: flex;
  flex-direction: column;
}

.error-banner-content strong {
  font-size: 15px;
  font-weight: 800;
}

.error-banner-content span {
  margin-top: 3px;
  font-size: 14px;
  line-height: 1.4;
}

.error-banner button {
  margin-left: auto;
  padding: 8px 13px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
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
  height: 54px;
  padding: 0 20px;
  color: #526176;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
  letter-spacing: 0.55px;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 72px;
  padding: 11px 20px;
  color: #475569;
  font-size: 14px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.records-table tbody tr:nth-child(even) {
  background: #fcfdfe;
}

.records-table tbody tr:hover {
  background: #ecfeff;
  box-shadow: inset 4px 0 0 #0891b2;
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
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0e7490;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid #a5f3fc;
  border-radius: 9px;
  background: #ecfeff;
}

.grade-cell {
  display: flex;
  align-items: center;
}

.grade-icon {
  min-width: 42px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  background: #cffafe;
}

.grade-icon .md-icon {
  color: #0891b2 !important;
  font-size: 22px !important;
}

.grade-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.grade-name {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
}

.grade-description {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.35;
}

.record-id {
  display: inline-block;
  padding: 6px 9px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  background: #f1f5f9;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.record-action-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
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
    opacity 0.2s ease;
}

.record-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.11);
}

.record-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.record-action-button .md-icon {
  color: inherit !important;
  font-size: 19px !important;
}

.edit-button {
  color: #2563eb;
  background: #dbeafe;
}

.delete-button {
  color: #dc2626;
  background: #fee2e2;
}

/* Loading and empty states */

.loading-state,
.empty-state {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner,
.button-spinner,
.small-spinner {
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 46px;
  height: 46px;
  border: 4px solid #cffafe;
  border-top-color: #0891b2;
}

.button-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
}

.small-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid #fecaca;
  border-top-color: #dc2626;
}

.loading-state h3,
.empty-state h3 {
  margin: 16px 0 0;
  color: #334155;
  font-size: 18px;
  font-weight: 700;
}

.loading-state p,
.empty-state p {
  max-width: 430px;
  margin: 7px 0 17px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #f1f5f9;
}

.empty-state-icon .md-icon {
  color: #0891b2 !important;
  font-size: 39px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 41px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #0891b2;
}

.empty-primary-button .md-icon {
  color: #ffffff !important;
  font-size: 18px !important;
}

.empty-secondary-button {
  color: #0e7490;
  border: 1px solid #a5f3fc;
  background: #ecfeff;
}

/* Pagination */

.pagination-footer {
  min-height: 68px;
  display: flex;
  align-items: center;
  padding: 13px 21px;
  color: #64748b;
  font-size: 13px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
}

.pagination-information strong {
  color: #1f2937;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.pagination-controls label {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.pagination-controls select {
  height: 34px;
  padding: 0 24px 0 9px;
  color: #334155;
  font-size: 13px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
}

.pagination-button {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #0891b2;
  border: 1px solid #a5f3fc;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
  cursor: pointer;
}

.pagination-button:hover:not(:disabled) {
  background: #ecfeff;
}

.pagination-button:disabled {
  color: #cbd5e1;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.pagination-button .md-icon {
  color: inherit !important;
  font-size: 20px !important;
}

.pagination-page {
  min-width: 58px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

/* Modal */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(6px);
}

.grade-modal {
  width: 100%;
  max-width: 560px;
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.32);
}

.modal-header {
  position: relative;
  min-height: 106px;
  display: flex;
  align-items: center;
  padding: 21px 23px;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(255, 255, 255, 0.18),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #164e63,
      #0e7490,
      #0891b2
    );
}

.modal-header::after {
  content: "";
  position: absolute;
  top: -80px;
  right: -40px;
  width: 175px;
  height: 175px;
  border: 28px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

.modal-header-icon {
  position: relative;
  z-index: 2;
  min-width: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
}

.modal-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 27px !important;
}

.modal-heading {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.modal-label {
  display: block;
  color: rgba(255, 255, 255, 0.74);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.modal-heading h2 {
  margin: 4px 0 3px;
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.4;
}

.modal-close-button {
  position: relative;
  z-index: 2;
  width: 37px;
  height: 37px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0;
  color: #ffffff;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.modal-close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.modal-close-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.modal-close-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.modal-body {
  padding: 27px 25px 21px;
}

.form-label {
  display: block;
  margin-bottom: 9px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.form-label span {
  color: #dc2626;
}

.form-input-wrapper {
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #d4dce8;
  border-radius: 12px;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input-wrapper:focus-within {
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

.form-input-wrapper .md-icon {
  margin-right: 10px;
  color: #0891b2 !important;
  font-size: 21px !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  color: #1f2937;
  font-size: 15px;
  font-weight: 500;
  border: 0;
  outline: none;
  background: transparent;
}

.form-input-wrapper input::placeholder {
  color: #94a3b8;
}

.form-input-wrapper input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-information {
  min-height: 28px;
  display: flex;
  align-items: flex-start;
  padding-top: 6px;
}

.form-error {
  color: #dc2626;
  font-size: 12px;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}

.form-hint {
  display: flex;
  align-items: flex-start;
  margin-top: 7px;
  padding: 11px 12px;
  color: #526176;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid #a5f3fc;
  border-radius: 10px;
  background: #ecfeff;
}

.form-hint .md-icon {
  min-width: 19px;
  margin-right: 8px;
  color: #0891b2 !important;
  font-size: 19px !important;
}

.modal-error {
  display: flex;
  align-items: center;
  margin-top: 14px;
  padding: 11px 12px;
  color: #991b1b;
  font-size: 13px;
  line-height: 1.4;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
}

.modal-error .md-icon {
  margin-right: 8px;
  color: #dc2626 !important;
  font-size: 20px !important;
}

.modal-footer {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 42px;
  padding: 0 17px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
}

.cancel-button {
  color: #526176;
  border: 1px solid #d4dce8;
  background: #ffffff;
}

.cancel-button:hover:not(:disabled) {
  background: #f1f5f9;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ffffff;
  border: 0;
  background: linear-gradient(
    135deg,
    #0e7490,
    #0891b2
  );
  box-shadow: 0 8px 18px rgba(8, 145, 178, 0.22);
}

.save-button:hover:not(:disabled) {
  box-shadow: 0 11px 22px rgba(8, 145, 178, 0.28);
}

.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.save-button .md-icon {
  color: #ffffff !important;
  font-size: 19px !important;
}

/* Transitions */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .grade-modal,
.modal-fade-leave-active .grade-modal {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .grade-modal,
.modal-fade-leave-to .grade-modal {
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

/* Table scrollbar */

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

/* Tablet */

@media (max-width: 991px) {
  .ng-header {
    min-height: 0 !important;
    padding: 11px 14px !important;
  }

  .ng-header-description {
    max-width: 430px;
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
    width: 260px;
  }

  .refresh-button {
    width: 100%;
    margin-top: 9px;
  }
}

/* Mobile */

@media (max-width: 767px) {
  .ng-header {
    display: block;
    height: auto !important;
    min-height: 0 !important;
    padding: 13px !important;
  }

  .ng-header-content {
    align-items: flex-start;
  }

  .ng-header-button {
    width: 100%;
    height: 40px;
    margin: 12px 0 0 !important;
  }

  .records-toolbar {
    display: block;
  }

  .toolbar-actions {
    margin-top: 15px;
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
    margin-top: 13px;
    margin-left: 0;
  }
}

@media (max-width: 575px) {
  .next-grades-page {
    padding-bottom: 20px;
  }

  .ng-header {
    margin-bottom: 14px !important;
    padding: 11px !important;
    border-radius: 11px;
  }

  .ng-header::before {
    display: none;
  }

  .ng-header-icon {
    min-width: 40px;
    width: 40px;
    height: 40px;
    margin-right: 10px;
    border-radius: 10px;
  }

  .ng-header-icon .md-icon {
    font-size: 22px !important;
  }

  .ng-header-label {
    font-size: 8px;
  }

  .ng-header-title {
    font-size: 17px !important;
  }

  .ng-header-description {
    margin-top: 2px !important;
    font-size: 10px !important;
    line-height: 1.35 !important;
  }

  .ng-header-button {
    min-height: 38px;
    height: 38px;
    font-size: 11px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .statistic-card {
    min-height: 84px;
    padding: 15px;
  }

  .records-toolbar {
    padding: 18px 15px;
  }

  .records-toolbar h2 {
    font-size: 18px;
  }

  .records-toolbar p {
    font-size: 12px;
  }

  .records-table th,
  .records-table td {
    padding-right: 12px;
    padding-left: 12px;
  }

  .grade-description {
    display: none;
  }

  .grade-name {
    font-size: 14px;
  }

  .number-column {
    width: 54px;
  }

  .actions-column {
    width: 105px;
  }

  .row-number {
    width: 30px;
    height: 30px;
  }

  .grade-icon {
    min-width: 38px;
    width: 38px;
    height: 38px;
    margin-right: 9px;
  }

  .record-action-button {
    width: 34px;
    height: 34px;
  }

  .pagination-footer {
    display: block;
    padding: 14px;
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
    max-width: none;
    border-radius: 20px 20px 0 0;
  }

  .modal-header {
    padding: 19px 17px;
  }

  .modal-header-icon {
    min-width: 46px;
    width: 46px;
    height: 46px;
    margin-right: 11px;
  }

  .modal-heading h2 {
    font-size: 18px;
  }

  .modal-heading p {
    max-width: 230px;
    font-size: 11px;
  }

  .modal-body {
    padding: 23px 18px 18px;
  }

  .modal-footer {
    padding: 13px 15px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    padding-right: 10px;
    padding-left: 10px;
    font-size: 12px;
  }
}



</style>




