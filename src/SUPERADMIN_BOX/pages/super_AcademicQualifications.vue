<template>
  <div class="academic-qualifications-page">
    <!-- Page heading -->
    <section class="page-header">
      <div class="page-header-decoration decoration-one" />
      <div class="page-header-decoration decoration-two" />

      <div class="page-header-content">
        <div class="page-header-icon">
          <md-icon>school</md-icon>
        </div>

        <div class="page-header-text">
          <span class="page-header-label">
            SYSTEM CONFIGURATION
          </span>

          <h1>
            Academic Qualifications
          </h1>

          <p>
            Create, update, search, and manage academic qualification
            records used by staff accounts.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="header-add-button"
        :disabled="loading"
        @click="openCreateModal"
      >
        <md-icon>add_circle</md-icon>

        <span>
          Add Qualification
        </span>
      </button>
    </section>

    <!-- Statistics -->
    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>school</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ qualifications.length }}
          </span>

          <span class="statistic-label">
            Total Qualifications
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredQualifications.length }}
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

    <!-- Main card -->
    <section class="records-card">
      <!-- Controls -->
      <div class="records-toolbar">
        <div>
          <h2>
            Qualification Records
          </h2>

          <p>
            Manage all available academic qualifications.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search qualifications..."
              aria-label="Search academic qualifications"
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
            :disabled="loading"
            @click="loadQualifications"
          >
            <md-icon :class="{ rotating: loading }">
              refresh
            </md-icon>

            <span>
              Refresh
            </span>
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
            <strong>
              Unable to load records
            </strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="loadQualifications"
        >
          Try Again
        </button>
      </div>

      <!-- Loading state -->
      <div
        v-if="loading && !qualifications.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>
          Loading qualifications
        </h3>

        <p>
          Please wait while the records are retrieved.
        </p>
      </div>

      <!-- Table -->
      <div
        v-else-if="paginatedQualifications.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                Qualification
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
              v-for="(qualification, index) in paginatedQualifications"
              :key="qualification.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="qualification-cell">
                  <div class="qualification-icon">
                    <md-icon>school</md-icon>
                  </div>

                  <div class="qualification-information">
                    <span class="qualification-name">
                      {{ qualification.name }}
                    </span>

                    <span class="qualification-description">
                      Academic qualification record
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="record-id">
                  #{{ qualification.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit qualification"
                    @click="openEditModal(qualification)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete qualification"
                    @click="deleteQualification(qualification)"
                  >
                    <md-icon>delete_outline</md-icon>
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
            {{ search ? "search_off" : "school" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching qualification found"
              : "No academic qualifications yet"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with a different qualification name."
              : "Create the first academic qualification record."
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
          Add Qualification
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredQualifications.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredQualifications.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="academic-page-size">
            Rows:
          </label>

          <select
            id="academic-page-size"
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
          class="qualification-modal"
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
                ACADEMIC QUALIFICATION
              </span>

              <h2>
                {{ modalTitle }}
              </h2>

              <p>
                {{
                  editingId
                    ? "Update the selected qualification record."
                    : "Enter a new qualification for staff accounts."
                }}
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

          <form @submit.prevent="saveQualification">
            <div class="modal-body">
              <label
                class="form-label"
                for="qualification-name"
              >
                Qualification Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid: formSubmitted && nameError
                }"
              >
                <md-icon>school</md-icon>

                <input
                  id="qualification-name"
                  ref="nameInput"
                  v-model="form.name"
                  type="text"
                  maxlength="100"
                  autocomplete="off"
                  placeholder="Example: Bachelor's Degree"
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
                  Qualification names must be unique and cannot exceed
                  100 characters.
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
                  {{
                    saving
                      ? "Saving..."
                      : editingId
                        ? "Update Qualification"
                        : "Create Qualification"
                  }}
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

// Local/testing API
 const API_BASE_URL = "http://127.0.0.1:8888/api";

export default {
  name: "SuperAcademicQualifications",

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

      qualifications: [],

      currentPage: 1,
      pageSize: 10,

      lastUpdated: null,

      form: {
        name: ""
      }
    };
  },

  computed: {
    filteredQualifications() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.qualifications;
      }

      return this.qualifications.filter(qualification => {
        const name = qualification.name || "";

        return name
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedQualifications() {
      return [...this.filteredQualifications].sort(
        (first, second) => {
          const firstName = first.name
            ? first.name.trim().toLowerCase()
            : "";

          const secondName = second.name
            ? second.name.trim().toLowerCase()
            : "";

          return firstName.localeCompare(secondName);
        }
      );
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedQualifications.length /
            this.pageSize
        )
      );
    },

    paginatedQualifications() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      const end =
        start + this.pageSize;

      return this.sortedQualifications.slice(
        start,
        end
      );
    },

    paginationStart() {
      if (!this.sortedQualifications.length) {
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
        this.sortedQualifications.length
      );
    },

    modalTitle() {
      return this.editingId
        ? "Edit Qualification"
        : "Add Qualification";
    },

    modalDescription() {
      return this.editingId
        ? "Update the selected academic qualification."
        : "Create a new academic qualification for staff accounts.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId
        ? "Update Qualification"
        : "Create Qualification";
    },

    nameError() {
      const name = this.form.name
        ? this.form.name.trim()
        : "";

      if (!name) {
        return "Qualification name is required.";
      }

      if (name.length < 2) {
        return "Qualification name must contain at least 2 characters.";
      }

      if (name.length > 100) {
        return "Qualification name cannot exceed 100 characters.";
      }

      const duplicate =
        this.qualifications.some(
          qualification => {
            const qualificationName =
              qualification.name
                ? qualification.name
                    .trim()
                    .toLowerCase()
                : "";

            return (
              qualification.id !==
                this.editingId &&
              qualificationName ===
                name.toLowerCase()
            );
          }
        );

      if (duplicate) {
        return "This academic qualification already exists.";
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
    },

    hasSearch() {
      return Boolean(
        this.search &&
          this.search.trim()
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
    this.loadQualifications();
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

    async loadQualifications() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/academic-qualifications`,
          this.getRequestConfig()
        );

        this.qualifications =
          Array.isArray(response.data)
            ? response.data
            : [];

        this.lastUpdated = new Date();

        if (
          this.currentPage >
          this.totalPages
        ) {
          this.currentPage =
            this.totalPages;
        }
      } catch (error) {
        this.qualifications = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load academic qualifications."
          );

        console.error(
          "Unable to load academic qualifications",
          error
        );
      } finally {
        this.loading = false;
      }
    },

    async refreshQualifications() {
      this.refreshing = true;

      try {
        await this.loadQualifications();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusNameInput();
    },

    openEditModal(qualification) {
      this.resetForm();

      this.editingId =
        qualification.id;

      this.form.name =
        qualification.name || "";

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

    async saveQualification() {
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
        if (this.editingId) {
          await axios.put(
            `${API_BASE_URL}/academic-qualifications/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Qualification updated",
            `"${payload.name}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/academic-qualifications`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Qualification created",
            `"${payload.name}" was created successfully.`
          );
        }

        this.resetForm();

        await this.loadQualifications();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the academic qualification."
          );

        console.error(
          "Unable to save academic qualification",
          error
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteQualification(
      qualification
    ) {
      const qualificationName =
        qualification.name ||
        "this qualification";

      const result = await Swal.fire({
        title: "Delete qualification?",
        html: `
          <div style="
            color: #64748b;
            font-size: 13px;
            line-height: 1.6;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(
                qualificationName
              )}
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
          "Yes, delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true
      });

      if (!result.isConfirmed) {
        return;
      }

      this.deletingId =
        qualification.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/academic-qualifications/${qualification.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "Qualification deleted",
          text: `"${qualificationName}" was deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#16a34a",
          confirmButtonText: "Done",
          timer: 2200,
          timerProgressBar: true
        });

        await this.loadQualifications();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",
          text: this.getErrorMessage(
            error,
            "Unable to delete the academic qualification."
          ),
          icon: "error",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "Close"
        });

        console.error(
          "Unable to delete academic qualification",
          error
        );
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

      if (status === 400) {
        return "Please check the submitted qualification name.";
      }

      if (status === 401) {
        return "Your session is no longer valid. Please sign in again.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The academic qualification was not found.";
      }

      if (status === 409) {
        return "This academic qualification already exists.";
      }

      if (status === 500) {
        return "The server could not process the request.";
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

    goToPage(page) {
      if (
        page >= 1 &&
        page <= this.totalPages
      ) {
        this.currentPage = page;
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
.academic-qualifications-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 30px;
}

/* =========================================================
   PAGE HEADER
   ========================================================= */

.page-header {
  position: relative;
  min-height: 190px;
  display: flex;
  align-items: center;
  margin-bottom: 22px;
  padding: 31px 36px;
  overflow: hidden;
  color: #ffffff;
  border-radius: 19px;
  background:
    radial-gradient(
      circle at 88% 15%,
      rgba(255, 255, 255, 0.18),
      transparent 25%
    ),
    linear-gradient(
      135deg,
      #14532d 0%,
      #15803d 35%,
      #16a34a 68%,
      #22c55e 100%
    );
  box-shadow: 0 17px 38px rgba(22, 163, 74, 0.22);
}

.page-header-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  min-width: 0;
}

.page-header-icon {
  min-width: 67px;
  width: 67px;
  height: 67px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(9px);
}

.page-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 37px !important;
}

.page-header-text {
  min-width: 0;
}

.page-header-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 7px 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
}

.page-header p {
  max-width: 640px;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  line-height: 1.6;
}

.header-add-button {
  position: relative;
  z-index: 3;
  min-height: 45px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 0 18px;
  color: #15803d;
  font-size: 10px;
  font-weight: 800;
  border: 0;
  border-radius: 11px;
  outline: none;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.header-add-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24);
}

.header-add-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.header-add-button .md-icon {
  color: #15803d !important;
  font-size: 20px !important;
}

.page-header-decoration {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  pointer-events: none;
}

.decoration-one {
  top: -90px;
  right: 190px;
  width: 210px;
  height: 210px;
}

.decoration-two {
  right: -55px;
  bottom: -105px;
  width: 250px;
  height: 250px;
  border-width: 36px;
  opacity: 0.55;
}

/* =========================================================
   STATISTICS
   ========================================================= */

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
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.statistic-card:hover {
  border-color: #bbf7d0;
  box-shadow: 0 13px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
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
  font-size: 20px;
  font-weight: 800;
}

.statistic-label {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 600;
}

/* =========================================================
   RECORDS CARD
   ========================================================= */

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
  font-size: 15px;
  font-weight: 800;
}

.records-toolbar p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 9px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

/* =========================================================
   SEARCH
   ========================================================= */

.search-control {
  width: 285px;
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 11px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-control:focus-within {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.09);
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
  font-size: 10px;
  border: 0;
  outline: none;
  background: transparent;
}

.search-control input::placeholder {
  color: #94a3b8;
}

.clear-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  outline: none;
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
  color: #15803d;
  font-size: 9px;
  font-weight: 700;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  outline: none;
  background: #f0fdf4;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #dcfce7;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-button .md-icon {
  color: #16a34a !important;
  font-size: 19px !important;
}

.records-divider {
  height: 1px;
  background: #edf2f7;
}

/* =========================================================
   ERROR BANNER
   ========================================================= */

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
  font-size: 10px;
}

.error-banner-content span {
  margin-top: 3px;
  font-size: 9px;
}

.error-banner button {
  margin-left: auto;
  padding: 7px 11px;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  border: 0;
  border-radius: 8px;
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
  height: 52px;
  padding: 0 20px;
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  text-align: left;
  letter-spacing: 0.65px;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 69px;
  padding: 10px 20px;
  color: #475569;
  font-size: 10px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.records-table tbody tr:nth-child(even) {
  background: #fbfdff;
}

.records-table tbody tr:hover {
  background: #f0fdf4;
  box-shadow: inset 4px 0 0 #16a34a;
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
  color: #15803d;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid #bbf7d0;
  border-radius: 9px;
  background: #f0fdf4;
}

.qualification-cell {
  display: flex;
  align-items: center;
}

.qualification-icon {
  min-width: 39px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  border-radius: 11px;
  background: #dcfce7;
}

.qualification-icon .md-icon {
  color: #16a34a !important;
  font-size: 21px !important;
}

.qualification-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.qualification-name {
  color: #1f2937;
  font-size: 11px;
  font-weight: 700;
}

.qualification-description {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 8px;
}

.record-id {
  display: inline-block;
  padding: 5px 8px;
  color: #475569;
  font-size: 9px;
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
  padding: 0;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.record-action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(15, 23, 42, 0.12);
}

.record-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.record-action-button .md-icon {
  font-size: 18px !important;
}

.edit-button {
  background: #dbeafe;
}

.edit-button .md-icon {
  color: #2563eb !important;
}

.delete-button {
  background: #fee2e2;
}

.delete-button .md-icon {
  color: #dc2626 !important;
}

/* =========================================================
   LOADING AND EMPTY STATES
   ========================================================= */

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

.loading-spinner {
  width: 43px;
  height: 43px;
  border: 4px solid #dcfce7;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state h3,
.empty-state h3 {
  margin: 15px 0 0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.loading-state p,
.empty-state p {
  margin: 6px 0 15px;
  color: #94a3b8;
  font-size: 9px;
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
  color: #94a3b8 !important;
  font-size: 38px !important;
}

.empty-primary-button,
.empty-secondary-button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 13px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 9px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #16a34a;
}

.empty-primary-button .md-icon {
  color: #ffffff !important;
  font-size: 17px !important;
}

.empty-secondary-button {
  color: #15803d;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}

/* =========================================================
   PAGINATION
   ========================================================= */

.pagination-footer {
  min-height: 64px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #64748b;
  font-size: 9px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
}

.pagination-information strong {
  color: #334155;
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
  font-size: 9px;
}

.pagination-controls select {
  height: 31px;
  padding: 0 23px 0 8px;
  color: #475569;
  font-size: 9px;
  border: 1px solid #dbe3ee;
  border-radius: 7px;
  outline: none;
  background: #ffffff;
}

.pagination-button {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
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
  font-size: 19px !important;
}

.pagination-page {
  min-width: 50px;
  color: #475569;
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
  padding: 18px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
}

.qualification-modal {
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  border-radius: 19px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.3);
}

.modal-header {
  position: relative;
  min-height: 105px;
  display: flex;
  align-items: center;
  padding: 21px 23px;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #14532d,
    #15803d,
    #16a34a,
    #22c55e
  );
}

.modal-header::after {
  content: "";
  position: absolute;
  top: -65px;
  right: -35px;
  width: 165px;
  height: 165px;
  border: 29px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.modal-header-icon {
  position: relative;
  z-index: 2;
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

.modal-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 26px !important;
}

.modal-heading {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.modal-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

.modal-heading h2 {
  margin: 4px 0 3px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.modal-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 9px;
}

.modal-close-button {
  position: relative;
  z-index: 2;
  width: 36px;
  height: 36px;
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

.modal-close-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-close-button .md-icon {
  color: #ffffff !important;
  font-size: 20px !important;
}

.modal-body {
  padding: 27px 24px 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 10px;
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
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input-wrapper:focus-within {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

.form-input-wrapper .md-icon {
  margin-right: 10px;
  color: #94a3b8 !important;
  font-size: 20px !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  color: #1f2937;
  font-size: 11px;
  font-weight: 500;
  border: 0;
  outline: none;
  background: transparent;
}

.form-input-wrapper input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.form-information {
  min-height: 26px;
  display: flex;
  align-items: flex-start;
  padding-top: 5px;
}

.form-error {
  color: #dc2626;
  font-size: 8px;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  margin-left: auto;
  color: #94a3b8;
  font-size: 8px;
}

.form-hint {
  display: flex;
  align-items: flex-start;
  margin-top: 6px;
  padding: 10px 11px;
  color: #64748b;
  font-size: 8px;
  line-height: 1.5;
  border: 1px solid #dcfce7;
  border-radius: 9px;
  background: #f0fdf4;
}

.form-hint .md-icon {
  min-width: 17px;
  margin-right: 7px;
  color: #16a34a !important;
  font-size: 17px !important;
}

.modal-error {
  display: flex;
  align-items: center;
  margin-top: 13px;
  padding: 10px 11px;
  color: #991b1b;
  font-size: 9px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
}

.modal-error .md-icon {
  margin-right: 7px;
  color: #dc2626 !important;
  font-size: 18px !important;
}

.modal-footer {
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  padding: 13px 21px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 40px;
  padding: 0 16px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 9px;
  cursor: pointer;
}

.cancel-button {
  color: #64748b;
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
    #15803d,
    #16a34a,
    #22c55e
  );
  box-shadow: 0 8px 18px rgba(22, 163, 74, 0.22);
}

.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.save-button .md-icon {
  color: #ffffff !important;
  font-size: 18px !important;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* =========================================================
   TRANSITIONS
   ========================================================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .qualification-modal,
.modal-fade-leave-active .qualification-modal {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .qualification-modal,
.modal-fade-leave-to .qualification-modal {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
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
   RESPONSIVE
   ========================================================= */

@media (max-width: 991px) {
  .page-header {
    padding: 27px;
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
    width: 250px;
  }

  .refresh-button {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
}

@media (max-width: 767px) {
  .page-header {
    display: block;
  }

  .header-add-button {
    width: 100%;
    justify-content: center;
    margin-top: 20px;
    margin-left: 0;
  }

  .page-header h1 {
    font-size: 23px;
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
}

@media (max-width: 575px) {
  .page-header {
    padding: 22px 18px;
  }

  .page-header-content {
    align-items: flex-start;
  }

  .page-header-icon {
    min-width: 52px;
    width: 52px;
    height: 52px;
  }

  .page-header-icon .md-icon {
    font-size: 29px !important;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .records-table th,
  .records-table td {
    padding-right: 11px;
    padding-left: 11px;
  }

  .qualification-description {
    display: none;
  }

  .number-column {
    width: 55px;
  }

  .actions-column {
    width: 100px;
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

  .qualification-modal {
    max-width: none;
    border-radius: 19px 19px 0 0;
  }

  .modal-header {
    padding: 18px;
  }

  .modal-heading p {
    max-width: 230px;
  }

  .modal-body {
    padding: 23px 18px 17px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
  }
}
</style>








