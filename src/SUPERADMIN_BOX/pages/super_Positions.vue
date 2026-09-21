<template>
  <div class="positions-page">
    <section class="positions-header">
      <div class="positions-header-content">
        <div class="positions-header-icon">
          <md-icon>work</md-icon>
        </div>

        <div class="positions-header-text">
          <span class="positions-header-label">
            SYSTEM CONFIGURATION
          </span>

          <h1 class="positions-header-title">
            Positions
          </h1>

          <p class="positions-header-description">
            Create, update, search, and manage the staff positions
            available when creating and updating staff accounts.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="positions-header-button"
        :disabled="loading"
        @click="openCreateModal"
      >
        <md-icon>add_circle</md-icon>

        <span>Add Position</span>
      </button>
    </section>

    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>work</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ positions.length }}
          </span>

          <span class="statistic-label">
            Total Positions
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>visibility</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ filteredPositions.length }}
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
          <h2>
            Position Records
          </h2>

          <p>
            Manage all staff positions available in the HR system.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search positions..."
              aria-label="Search positions"
            />

            <button
              v-if="search"
              type="button"
              class="clear-search-button"
              title="Clear search"
              aria-label="Clear position search"
              @click="clearSearch"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading || refreshing"
            @click="refreshPositions"
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
            <strong>
              Unable to load positions
            </strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="loadPositions"
        >
          Try Again
        </button>
      </div>

      <div
        v-if="loading && !positions.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>
          Loading positions
        </h3>

        <p>
          Please wait while the position records are retrieved.
        </p>
      </div>

      <div
        v-else-if="paginatedPositions.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                Position
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
              v-for="(position, index) in paginatedPositions"
              :key="position.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="position-cell">
                  <div class="position-icon">
                    <md-icon>work</md-icon>
                  </div>

                  <div class="position-information">
                    <span class="position-name">
                      {{ position.name }}
                    </span>

                    <span class="position-description">
                      Staff position record
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="record-id">
                  #{{ position.id }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit position"
                    aria-label="Edit position"
                    :disabled="deletingId === position.id"
                    @click="openEditModal(position)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete position"
                    aria-label="Delete position"
                    :disabled="deletingId === position.id"
                    @click="deletePosition(position)"
                  >
                    <span
                      v-if="deletingId === position.id"
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
            {{ search ? "search_off" : "work" }}
          </md-icon>
        </div>

        <h3>
          {{
            search
              ? "No matching position found"
              : "No positions created"
          }}
        </h3>

        <p>
          {{
            search
              ? "Try searching with a different position name."
              : "Create the first staff position for the HR system."
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

          <span>Add Position</span>
        </button>
      </div>

      <div
        v-if="filteredPositions.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredPositions.length }}</strong>
          records
        </div>

        <div class="pagination-controls">
          <label for="positions-page-size">
            Rows:
          </label>

          <select
            id="positions-page-size"
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
            aria-label="Previous page"
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
            aria-label="Next page"
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
          class="position-modal"
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
                STAFF POSITION
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
              aria-label="Close modal"
              @click="closeModal"
            >
              <md-icon>close</md-icon>
            </button>
          </div>

          <form @submit.prevent="savePosition">
            <div class="modal-body">
              <label
                class="form-label"
                for="position-name"
              >
                Position Name
                <span>*</span>
              </label>

              <div
                class="form-input-wrapper"
                :class="{
                  invalid:
                    formSubmitted &&
                    nameError
                }"
              >
                <md-icon>work</md-icon>

                <input
                  id="position-name"
                  ref="nameInput"
                  v-model="form.name"
                  type="text"
                  maxlength="150"
                  autocomplete="off"
                  placeholder="Example: Human Resource Manager"
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
                      nameError
                  }"
                >
                  {{ nameError || " " }}
                </span>

                <span class="character-count">
                  {{ form.name.length }} / 150
                </span>
              </div>

              <div class="form-hint">
                <md-icon>info_outline</md-icon>

                <span>
                  Enter a unique position name containing no more
                  than 150 characters.
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
                  {{
                    editingId !== null
                      ? "save"
                      : "add"
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
const API_BASE_URL = "http://127.0.0.1:8888/api";

export default {
  name: "SuperPositions",

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

      positions: [],

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      form: {
        name: ""
      }
    };
  },

  computed: {
    filteredPositions() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      if (!searchValue) {
        return this.positions;
      }

      return this.positions.filter(position => {
        const positionName =
          position.name || "";

        return positionName
          .trim()
          .toLowerCase()
          .includes(searchValue);
      });
    },

    sortedPositions() {
      return [...this.filteredPositions].sort(
        (first, second) => {
          const firstName =
            first.name
              ? first.name
                  .trim()
                  .toLowerCase()
              : "";

          const secondName =
            second.name
              ? second.name
                  .trim()
                  .toLowerCase()
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
          this.sortedPositions.length /
            this.pageSize
        )
      );
    },

    paginatedPositions() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      const end =
        start + this.pageSize;

      return this.sortedPositions.slice(
        start,
        end
      );
    },

    paginationStart() {
      if (!this.sortedPositions.length) {
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
        this.sortedPositions.length
      );
    },

    modalTitle() {
      return this.editingId !== null
        ? "Edit Position"
        : "Add Position";
    },

    modalDescription() {
      return this.editingId !== null
        ? "Update the selected staff position."
        : "Create a new position for staff accounts.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId !== null
          ? "Updating..."
          : "Creating...";
      }

      return this.editingId !== null
        ? "Update Position"
        : "Create Position";
    },

    nameError() {
      const name =
        this.form.name
          ? this.form.name.trim()
          : "";

      if (!name) {
        return "Position name is required.";
      }

      if (name.length < 2) {
        return "Position name must contain at least 2 characters.";
      }

      if (name.length > 150) {
        return "Position name cannot exceed 150 characters.";
      }

      const duplicate =
        this.positions.some(position => {
          const existingName =
            position.name
              ? position.name
                  .trim()
                  .toLowerCase()
              : "";

          return (
            Number(position.id) !==
              Number(this.editingId) &&
            existingName ===
              name.toLowerCase()
          );
        });

      if (duplicate) {
        return "This position already exists.";
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
    this.loadPositions();
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

    normalizePosition(position) {
      return {
        id: position.id,

        name:
          position.name ||
          position.positionName ||
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
        Array.isArray(
          responseData.positions
        )
      ) {
        return responseData.positions;
      }

      return [];
    },

    async loadPositions() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/positions`,
          this.getRequestConfig()
        );

        const records =
          this.getResponseRecords(
            response.data
          );

        this.positions =
          records.map(position => {
            return this.normalizePosition(
              position
            );
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
        this.positions = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load positions."
          );

        console.error(
          "Unable to load positions",
          error
        );
      } finally {
        this.loading = false;
      }
    },

    async refreshPositions() {
      this.refreshing = true;

      try {
        await this.loadPositions();
      } finally {
        this.refreshing = false;
      }
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
      this.focusNameInput();
    },

    openEditModal(position) {
      this.resetForm();

      this.editingId =
        position.id;

      this.form.name =
        position.name || "";

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

    async savePosition() {
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
            `${API_BASE_URL}/positions/${this.editingId}`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Position updated",
            `"${payload.name}" was updated successfully.`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}/positions`,
            payload,
            this.getRequestConfig()
          );

          this.showModal = false;

          await this.showSuccess(
            "Position created",
            `"${payload.name}" was created successfully.`
          );
        }

        this.resetForm();

        await this.loadPositions();
      } catch (error) {
        this.formError =
          this.getErrorMessage(
            error,
            "Unable to save the position."
          );

        console.error(
          "Unable to save position",
          error
        );
      } finally {
        this.saving = false;
      }
    },

    async deletePosition(position) {
      const positionName =
        position.name ||
        "this position";

      const result = await Swal.fire({
        title: "Delete position?",

        html: `
          <div style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.7;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(positionName)}
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

      this.deletingId =
        position.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/positions/${position.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "Position deleted",

          text:
            `"${positionName}" was deleted successfully.`,

          icon: "success",

          confirmButtonColor:
            "#0369a1",

          confirmButtonText:
            '<span style="color: white;">Done</span>',

          timer: 2200,

          timerProgressBar: true
        });

        await this.loadPositions();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",

          text: this.getErrorMessage(
            error,
            "Unable to delete the position."
          ),

          icon: "error",

          confirmButtonColor:
            "#dc2626",

          confirmButtonText:
            '<span style="color: white;">Close</span>'
        });

        console.error(
          "Unable to delete position",
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
          "#0369a1",

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
        Array.isArray(responseData.errors) &&
        responseData.errors.length
      ) {
        return responseData.errors
          .map(item => {
            if (typeof item === "string") {
              return item;
            }

            if (
              item &&
              typeof item.message === "string"
            ) {
              return item.message;
            }

            return "";
          })
          .filter(Boolean)
          .join(", ");
      }

      if (
        responseData &&
        responseData.errors &&
        typeof responseData.errors ===
          "object" &&
        !Array.isArray(responseData.errors)
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
        return "Please check the submitted position name.";
      }

      if (status === 401) {
        return "Your session is no longer valid. Please sign in again.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The position record or endpoint was not found.";
      }

      if (status === 409) {
        return "This position already exists.";
      }

      if (status === 422) {
        return "The submitted position could not be processed.";
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
      const targetPage =
        Number(page);

      if (
        Number.isInteger(targetPage) &&
        targetPage >= 1 &&
        targetPage <= this.totalPages
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
.positions-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 32px;
  color: #1f2937;
  font-size: 16px;
}

/* Positions header */

.positions-header {
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
  border: 1px solid #d9e9f2;
  border-left: 5px solid #0369a1;
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(3, 105, 161, 0.07),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #fcfeff 70%,
      #f0f9ff 100%
    );
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.positions-header::before {
  content: "";
  position: absolute;
  top: -56px;
  right: 125px;
  width: 125px;
  height: 125px;
  border: 20px solid rgba(3, 105, 161, 0.035);
  border-radius: 50%;
  pointer-events: none;
}

.positions-header-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.positions-header-icon {
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
    #075985,
    #0369a1
  );
  box-shadow: 0 7px 16px rgba(3, 105, 161, 0.23);
}

.positions-header-icon .md-icon {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #ffffff !important;
  font-size: 27px !important;
  line-height: 1 !important;
}

.positions-header-text {
  min-width: 0;
  flex: 1;
}

.positions-header-label {
  display: block;
  margin: 0 0 3px;
  padding: 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.positions-header-title {
  margin: 0 !important;
  padding: 0 !important;
  color: #172033;
  font-size: 25px !important;
  font-weight: 800;
  line-height: 1.25 !important;
}

.positions-header-description {
  max-width: 700px;
  margin: 5px 0 0 !important;
  padding: 0 !important;
  color: #64748b;
  font-size: 16px !important;
  line-height: 1.5 !important;
}

.positions-header-button {
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
    #075985,
    #0369a1
  );
  box-shadow: 0 7px 16px rgba(3, 105, 161, 0.23);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.positions-header-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 11px 22px rgba(3, 105, 161, 0.3);
}

.positions-header-button:active:not(:disabled) {
  transform: translateY(0);
}

.positions-header-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(3, 105, 161, 0.15),
    0 7px 16px rgba(3, 105, 161, 0.23);
}

.positions-header-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.positions-header-button .md-icon {
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
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.statistic-card:hover {
  border-color: #bae6fd;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
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
  color: #0369a1;
  background: #e0f2fe;
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
  margin-left: 15px;
}

.statistic-value {
  color: #111827;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.25;
}

.statistic-time {
  font-size: 19px;
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

.records-toolbar h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.records-toolbar p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
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

/* Search and refresh */

.search-control {
  width: 320px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #f8fafc;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-control:focus-within {
  border-color: #0369a1;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(3, 105, 161, 0.09);
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
  color: #64748b !important;
  font-size: 20px !important;
}

.refresh-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  color: #0369a1;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #bae6fd;
  border-radius: 11px;
  outline: none;
  background: #f0f9ff;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #e0f2fe;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.refresh-button .md-icon {
  color: #0369a1 !important;
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

.error-banner-content .md-icon {
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
  font-size: 17px;
  font-weight: 800;
}

.error-banner-content span {
  margin-top: 4px;
  font-size: 16px;
  line-height: 1.5;
}

.error-banner button {
  flex-shrink: 0;
  margin-left: auto;
  padding: 9px 14px;
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
  letter-spacing: 0.45px;
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 78px;
  padding: 12px 22px;
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
  background: #f0f9ff;
  box-shadow: inset 4px 0 0 #0369a1;
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
  color: #0369a1;
  font-size: 16px;
  font-weight: 800;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  background: #f0f9ff;
}

.position-cell {
  min-width: 0;
  display: flex;
  align-items: center;
}

.position-icon {
  min-width: 47px;
  width: 47px;
  height: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border-radius: 13px;
  background: #e0f2fe;
}

.position-icon .md-icon {
  color: #0369a1 !important;
  font-size: 25px !important;
}

.position-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.position-name {
  overflow: hidden;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position-description {
  margin-top: 4px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
}

.record-id {
  display: inline-block;
  padding: 7px 10px;
  color: #475569;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
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

.loading-spinner,
.button-spinner,
.small-spinner {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0f2fe;
  border-top-color: #0369a1;
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
  font-weight: 700;
  line-height: 1.4;
}

.loading-state p,
.empty-state p {
  max-width: 480px;
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
  background: #e0f2fe;
}

.empty-state-icon .md-icon {
  color: #0369a1 !important;
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
  background: #0369a1;
  box-shadow: 0 7px 16px rgba(3, 105, 161, 0.22);
}

.empty-primary-button:hover {
  background: #075985;
  transform: translateY(-1px);
}

.empty-primary-button .md-icon {
  color: #ffffff !important;
  font-size: 20px !important;
}

.empty-secondary-button {
  color: #0369a1;
  border: 1px solid #bae6fd;
  background: #f0f9ff;
}

.empty-secondary-button:hover {
  background: #e0f2fe;
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
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.09);
}

.pagination-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #0369a1;
  border: 1px solid #bae6fd;
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
  background: #f0f9ff;
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* Position modal */

.position-modal {
  width: 100%;
  max-width: 630px;
  max-height: calc(100vh - 44px);
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 32px 85px rgba(15, 23, 42, 0.34);
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
      rgba(255, 255, 255, 0.18),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #0c4a6e 0%,
      #075985 48%,
      #0369a1 100%
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

/* Modal body */

.modal-body {
  padding: 30px 27px 23px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
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
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input-wrapper:focus-within {
  border-color: #0369a1;
  box-shadow: 0 0 0 4px rgba(3, 105, 161, 0.1);
}

.form-input-wrapper.invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
}

.form-input-wrapper .md-icon {
  flex-shrink: 0;
  margin-right: 11px;
  color: #0369a1 !important;
  font-size: 24px !important;
}

.form-input-wrapper input {
  min-width: 0;
  flex: 1;
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  border: 0;
  outline: none;
  background: transparent;
}

.form-input-wrapper input::placeholder {
  color: #94a3b8;
  font-size: 16px;
}

.form-input-wrapper input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-information {
  min-height: 34px;
  display: flex;
  align-items: flex-start;
  padding-top: 7px;
}

.form-error {
  color: #dc2626;
  font-size: 16px;
  line-height: 1.4;
  visibility: hidden;
}

.form-error.visible {
  visibility: visible;
}

.character-count {
  flex-shrink: 0;
  margin-left: auto;
  color: #64748b;
  font-size: 16px;
  line-height: 1.4;
}

.form-hint {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  padding: 13px 14px;
  color: #526176;
  font-size: 16px;
  line-height: 1.55;
  border: 1px solid #bae6fd;
  border-radius: 11px;
  background: #f0f9ff;
}

.form-hint .md-icon {
  min-width: 21px;
  flex-shrink: 0;
  margin-right: 9px;
  color: #0369a1 !important;
  font-size: 21px !important;
}

.modal-error {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 13px 14px;
  color: #991b1b;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #fecaca;
  border-radius: 11px;
  background: #fef2f2;
}

.modal-error .md-icon {
  flex-shrink: 0;
  margin-right: 9px;
  color: #dc2626 !important;
  font-size: 22px !important;
}

/* Modal footer */

.modal-footer {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 11px;
  padding: 15px 24px;
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

.save-button {
  gap: 9px;
  color: #ffffff;
  border: 0;
  background: linear-gradient(
    135deg,
    #075985,
    #0369a1
  );
  box-shadow: 0 9px 20px rgba(3, 105, 161, 0.24);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(3, 105, 161, 0.3);
}

.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.save-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

/* Transitions and animations */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .position-modal,
.modal-fade-leave-active .position-modal {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .position-modal,
.modal-fade-leave-to .position-modal {
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

/* Scrollbars */

.table-responsive::-webkit-scrollbar {
  height: 9px;
}

.position-modal::-webkit-scrollbar {
  width: 9px;
}

.table-responsive::-webkit-scrollbar-track,
.position-modal::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-responsive::-webkit-scrollbar-thumb,
.position-modal::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd5e1;
}

.table-responsive::-webkit-scrollbar-thumb:hover,
.position-modal::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Tablet */

@media (max-width: 991px) {
  .positions-header-description {
    max-width: 440px;
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
    width: 280px;
  }

  .refresh-button {
    width: 100%;
    margin-top: 10px;
  }
}

/* Mobile */

@media (max-width: 767px) {
  .positions-header {
    display: block;
    padding: 15px !important;
  }

  .positions-header-content {
    align-items: flex-start;
  }

  .positions-header-button {
    width: 100%;
    margin: 14px 0 0 !important;
  }

  .records-toolbar {
    display: block;
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
  .positions-page {
    padding-bottom: 20px;
  }

  .positions-header {
    margin-bottom: 16px !important;
    padding: 13px !important;
    border-radius: 12px;
  }

  .positions-header::before {
    display: none;
  }

  .positions-header-icon {
    min-width: 45px;
    width: 45px;
    height: 45px;
    margin-right: 11px;
  }

  .positions-header-title {
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

  .records-toolbar h2 {
    font-size: 20px;
  }

  .records-table th,
  .records-table td {
    padding-right: 13px;
    padding-left: 13px;
  }

  .position-description {
    display: none;
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
  }

  .position-icon {
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
    padding: 15px;
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

  .position-modal {
    max-width: none;
    max-height: 94vh;
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

  .modal-body {
    padding: 25px 19px 20px;
  }

  .form-information {
    display: block;
  }

  .character-count {
    display: block;
    margin-top: 5px;
    margin-left: 0;
    text-align: right;
  }

  .modal-footer {
    padding: 14px 17px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    padding-right: 11px;
    padding-left: 11px;
  }
}

</style>