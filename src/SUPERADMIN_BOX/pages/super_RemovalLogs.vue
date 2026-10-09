<template>
  <div class="removal-logs-page">
    <section class="page-header">
      <div class="page-header-content">
        <div class="page-header-icon">
          <md-icon>
            history
          </md-icon>
        </div>

        <div class="page-header-text">
          <span class="page-header-label">
            ACCOUNT AUDIT
          </span>

          <h1>
            User Removal Logs
          </h1>

          <p>
            Review account removals performed by authorized
            administrators, managers, and super administrators.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="export-button"
          :disabled="
            loading ||
            filteredLogs.length === 0
          "
          @click="exportCurrentPage"
        >
          <md-icon>
            download
          </md-icon>

          <span>
            Export Page
          </span>
        </button>

        <button
          type="button"
          class="refresh-button"
          :disabled="
            loading ||
            refreshing
          "
          @click="refreshLogs"
        >
          <md-icon
            :class="{
              rotating:
                loading ||
                refreshing
            }"
          >
            refresh
          </md-icon>

          <span>
            {{
              refreshing
                ? "Refreshing..."
                : "Refresh"
            }}
          </span>
        </button>
      </div>
    </section>

    <section class="statistics-grid">
      <article class="statistic-card">
        <div class="statistic-icon primary">
          <md-icon>
            history
          </md-icon>
        </div>

        <div class="statistic-content">
          <strong>
            {{ totalRecords }}
          </strong>

          <span>
            Total Removal Logs
          </span>
        </div>
      </article>

      <article class="statistic-card">
        <div class="statistic-icon success">
          <md-icon>
            table_rows
          </md-icon>
        </div>

        <div class="statistic-content">
          <strong>
            {{ logs.length }}
          </strong>

          <span>
            Records on This Page
          </span>
        </div>
      </article>

      <article class="statistic-card">
        <div class="statistic-icon warning">
          <md-icon>
            admin_panel_settings
          </md-icon>
        </div>

        <div class="statistic-content">
          <strong>
            {{ administratorCount }}
          </strong>

          <span>
            Admin Actions on Page
          </span>
        </div>
      </article>

      <article class="statistic-card">
        <div class="statistic-icon purple">
          <md-icon>
            manage_accounts
          </md-icon>
        </div>

        <div class="statistic-content">
          <strong>
            {{ managerCount }}
          </strong>

          <span>
            Manager Actions on Page
          </span>
        </div>
      </article>
    </section>

    <section class="records-card">
      <div class="records-toolbar">
        <div class="records-heading">
          <h2>
            Removal History
          </h2>

          <p>
            Removal logs are ordered from the most recent
            activity to the oldest activity.
          </p>
        </div>

        <div class="toolbar-controls">
          <div class="search-control">
            <md-icon>
              search
            </md-icon>

            <input
              v-model.trim="search"
              type="search"
              placeholder="Search account, role or reason..."
              aria-label="Search removal logs on this page"
            />

            <button
              v-if="search"
              type="button"
              title="Clear search"
              aria-label="Clear search"
              @click="clearSearch"
            >
              <md-icon>
                close
              </md-icon>
            </button>
          </div>

          <button
            type="button"
            class="filter-button"
            :class="{
              active:
                showFilters
            }"
            @click="
              showFilters =
                !showFilters
            "
          >
            <md-icon>
              filter_alt
            </md-icon>

            <span>
              Filters
            </span>
          </button>
        </div>
      </div>

      <transition name="filter-slide">
        <div
          v-if="showFilters"
          class="filters-panel"
        >
          <div class="filter-control">
            <label for="remover-role">
              Remover Role
            </label>

            <select
              id="remover-role"
              v-model="filters.role"
            >
              <option value="">
                All Roles
              </option>

              <option
                v-for="role in roleOptions"
                :key="role"
                :value="role"
              >
                {{ role }}
              </option>
            </select>
          </div>

          <div class="filter-control">
            <label for="removal-reason">
              Removal Reason
            </label>

            <select
              id="removal-reason"
              v-model="filters.reason"
            >
              <option value="">
                All Reasons
              </option>

              <option
                v-for="reason in reasonOptions"
                :key="reason"
                :value="reason"
              >
                {{ reason }}
              </option>
            </select>
          </div>

          <button
            type="button"
            class="clear-filters-button"
            :disabled="
              !hasActiveFilters
            "
            @click="clearFilters"
          >
            <md-icon>
              filter_alt_off
            </md-icon>

            <span>
              Clear Filters
            </span>
          </button>
        </div>
      </transition>

      <div class="records-divider"></div>

      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>
            error_outline
          </md-icon>

          <div>
            <strong>
              Unable to load removal logs
            </strong>

            <span>
              {{ errorMessage }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="
            loadRemovalLogs(
              currentPage
            )
          "
        >
          Try Again
        </button>
      </div>

      <div
        v-if="
          loading &&
          logs.length === 0
        "
        class="loading-state"
      >
        <div class="loading-spinner"></div>

        <h3>
          Loading removal logs
        </h3>

        <p>
          Please wait while the audit records are retrieved.
        </p>
      </div>

      <div
        v-else-if="
          filteredLogs.length > 0
        "
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                Removed Account
              </th>

              <th>
                Removed By
              </th>

              <th>
                Role
              </th>

              <th>
                Reason
              </th>

              <th>
                Removal Date
              </th>

              <th class="action-column">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(
                log,
                index
              ) in filteredLogs"
              :key="log.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="account-reference">
                  <div class="account-reference-icon removed">
                    <md-icon>
                      person_off
                    </md-icon>
                  </div>

                  <div>
                    <span class="account-reference-label">
                      Account ID
                    </span>

                    <strong>
                      #{{ log.accountId }}
                    </strong>
                  </div>
                </div>
              </td>

              <td>
                <div class="account-reference">
                  <div class="account-reference-icon actor">
                    <md-icon>
                      admin_panel_settings
                    </md-icon>
                  </div>

                  <div>
                    <span class="account-reference-label">
                      Account ID
                    </span>

                    <strong>
                      {{
                        log.removedByAccountId !==
                          null &&
                        log.removedByAccountId !==
                          undefined
                          ? `#${log.removedByAccountId}`
                          : "Historical"
                      }}
                    </strong>
                  </div>
                </div>
              </td>

              <td>
                <span
                  class="role-badge"
                  :class="
                    getRoleClass(
                      log.removedByRole
                    )
                  "
                >
                  {{
                    log.removedByRole ||
                    "Unknown"
                  }}
                </span>
              </td>

              <td>
                <span
                  class="reason-badge"
                  :class="
                    getReasonClass(
                      log.reason
                    )
                  "
                >
                  {{
                    log.reason ||
                    "Not specified"
                  }}
                </span>
              </td>

              <td>
                <div class="date-cell">
                  <md-icon>
                    event
                  </md-icon>

                  <div>
                    <strong>
                      {{
                        formatDate(
                          log.removedAt
                        )
                      }}
                    </strong>

                    <span>
                      {{
                        formatTime(
                          log.removedAt
                        )
                      }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <button
                  type="button"
                  class="view-button"
                  title="View removal details"
                  aria-label="View removal details"
                  @click="
                    openDetails(
                      log
                    )
                  "
                >
                  <md-icon>
                    visibility
                  </md-icon>
                </button>
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
              search ||
              hasActiveFilters
                ? "search_off"
                : "history_toggle_off"
            }}
          </md-icon>
        </div>

        <h3>
          {{
            search ||
            hasActiveFilters
              ? "No matching removal logs"
              : "No removal logs available"
          }}
        </h3>

        <p>
          {{
            search ||
            hasActiveFilters
              ? "Try changing the search term or clearing the active filters."
              : "Account removal activity will appear here."
          }}
        </p>

        <button
          v-if="
            search ||
            hasActiveFilters
          "
          type="button"
          class="empty-action-button"
          @click="
            resetSearchAndFilters
          "
        >
          Clear Search and Filters
        </button>
      </div>

      <footer
        v-if="totalRecords > 0"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing

          <strong>
            {{ paginationStart }}
          </strong>

          to

          <strong>
            {{ paginationEnd }}
          </strong>

          of

          <strong>
            {{ totalRecords }}
          </strong>

          removal logs
        </div>

        <div class="pagination-controls">
          <label for="removal-log-page-size">
            Rows:
          </label>

          <select
            id="removal-log-page-size"
            v-model.number="pageSize"
            :disabled="loading"
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
            :disabled="
              loading ||
              currentPage <= 1
            "
            @click="previousPage"
          >
            <md-icon>
              chevron_left
            </md-icon>
          </button>

          <span class="pagination-page">
            {{ currentPage }}
            /
            {{ totalPages }}
          </span>

          <button
            type="button"
            class="pagination-button"
            :disabled="
              loading ||
              currentPage >=
                totalPages
            "
            @click="nextPage"
          >
            <md-icon>
              chevron_right
            </md-icon>
          </button>
        </div>
      </footer>

      <div
        v-if="
          loading &&
          logs.length > 0
        "
        class="table-loading-overlay"
      >
        <div class="small-loading-spinner"></div>

        <span>
          Loading page...
        </span>
      </div>
    </section>

    <transition name="modal-fade">
      <div
        v-if="
          showDetailsModal &&
          selectedLog
        "
        class="modal-overlay"
        @click.self="closeDetails"
      >
        <article class="details-modal">
          <header class="details-modal-header">
            <div class="details-modal-heading">
              <div class="details-modal-icon">
                <md-icon>
                  history
                </md-icon>
              </div>

              <div>
                <span>
                  REMOVAL LOG
                </span>

                <h2>
                  Removal Record
                  #{{ selectedLog.id }}
                </h2>

                <p>
                  Account-removal audit information
                </p>
              </div>
            </div>

            <button
              type="button"
              class="modal-close-button"
              title="Close"
              aria-label="Close"
              @click="closeDetails"
            >
              <md-icon>
                close
              </md-icon>
            </button>
          </header>

          <div class="details-modal-body">
            <div class="details-summary">
              <div class="details-summary-item removed">
                <md-icon>
                  person_off
                </md-icon>

                <div>
                  <span>
                    Removed Account
                  </span>

                  <strong>
                    #{{ selectedLog.accountId }}
                  </strong>
                </div>
              </div>

              <div class="details-summary-arrow">
                <md-icon>
                  arrow_forward
                </md-icon>
              </div>

              <div class="details-summary-item actor">
                <md-icon>
                  admin_panel_settings
                </md-icon>

                <div>
                  <span>
                    Removed By
                  </span>

                  <strong>
                    {{
                      selectedLog.removedByAccountId !==
                        null &&
                      selectedLog.removedByAccountId !==
                        undefined
                        ? `#${selectedLog.removedByAccountId}`
                        : "Historical"
                    }}
                  </strong>
                </div>
              </div>
            </div>

            <section class="details-section">
              <h3>
                <md-icon>
                  description
                </md-icon>

                Removal Information
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>
                    Log ID
                  </span>

                  <strong>
                    #{{ selectedLog.id }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>
                    Removed Account ID
                  </span>

                  <strong>
                    #{{ selectedLog.accountId }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>
                    Remover Account ID
                  </span>

                  <strong>
                    {{
                      selectedLog.removedByAccountId !==
                        null &&
                      selectedLog.removedByAccountId !==
                        undefined
                        ? `#${selectedLog.removedByAccountId}`
                        : "Not recorded"
                    }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>
                    Remover Role
                  </span>

                  <strong>
                    {{
                      selectedLog.removedByRole ||
                      "Not recorded"
                    }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>
                    Reason
                  </span>

                  <strong>
                    {{
                      selectedLog.reason ||
                      "Not recorded"
                    }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>
                    Removed At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        selectedLog.removedAt
                      )
                    }}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <footer class="details-modal-footer">
            <button
              type="button"
              class="modal-done-button"
              @click="closeDetails"
            >
              Done
            </button>
          </footer>
        </article>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  get_removal_logs
} from "@/services/api";

export default {
  name:
    "SuperAdminRemovalLogs",

  data() {
    return {
      loading:
        false,

      refreshing:
        false,

      errorMessage:
        "",

      search:
        "",

      showFilters:
        false,

      showDetailsModal:
        false,

      selectedLog:
        null,

      logs:
        [],

      currentPage:
        1,

      pageSize:
        10,

      totalRecords:
        0,

      totalPages:
        1,

      nextPageUrl:
        null,

      previousPageUrl:
        null,

      lastUpdated:
        null,

      filters: {
        role:
          "",

        reason:
          ""
      },

      roleOptions: [
        "Admin",
        "Manager",
        "SuperAdmin"
      ],

      reasonOptions: [
        "Resigned",
        "Retired",
        "Terminated",
        "Other"
      ]
    };
  },

  computed: {
    hasActiveFilters() {
      return Boolean(
        this.filters.role ||
        this.filters.reason
      );
    },

    filteredLogs() {
      const query =
        String(
          this.search ||
          ""
        )
          .trim()
          .toLowerCase();

      return this.logs.filter(
        log => {
          const searchableValues = [
            log.id,
            log.accountId,
            log.removedByAccountId,
            log.removedByRole,
            log.reason,
            log.removedAt
          ]
            .filter(value => {
              return (
                value !== null &&
                value !== undefined
              );
            })
            .map(value => {
              return String(
                value
              ).toLowerCase();
            });

          const matchesSearch =
            !query ||
            searchableValues.some(
              value => {
                return value.includes(
                  query
                );
              }
            );

          const matchesRole =
            !this.filters.role ||
            String(
              log.removedByRole ||
              ""
            ).toLowerCase() ===
              this.filters.role
                .toLowerCase();

          const matchesReason =
            !this.filters.reason ||
            String(
              log.reason ||
              ""
            ).toLowerCase() ===
              this.filters.reason
                .toLowerCase();

          return (
            matchesSearch &&
            matchesRole &&
            matchesReason
          );
        }
      );
    },

    administratorCount() {
      return this.logs.filter(
        log => {
          const role =
            String(
              log.removedByRole ||
              ""
            )
              .trim()
              .toLowerCase();

          return (
            role === "admin" ||
            role === "superadmin" ||
            role === "super_admin" ||
            role === "super admin"
          );
        }
      ).length;
    },

    managerCount() {
      return this.logs.filter(
        log => {
          return String(
            log.removedByRole ||
            ""
          )
            .trim()
            .toLowerCase() ===
            "manager";
        }
      ).length;
    },

    paginationStart() {
      if (
        this.totalRecords === 0 ||
        this.logs.length === 0
      ) {
        return 0;
      }

      return (
        (
          this.currentPage -
          1
        ) *
        this.pageSize
      ) + 1;
    },

    paginationEnd() {
      if (
        this.totalRecords === 0 ||
        this.logs.length === 0
      ) {
        return 0;
      }

      return Math.min(
        this.paginationStart +
          this.logs.length -
          1,

        this.totalRecords
      );
    }
  },

  created() {
    this.loadRemovalLogs(
      1
    );
  },

  beforeDestroy() {
    document.body.style.overflow =
      "";
  },

  methods: {
    async loadRemovalLogs(
      requestedPage = 1
    ) {
      if (this.loading) {
        return;
      }

      const page =
        Math.max(
          1,
          Number(
            requestedPage
          ) || 1
        );

      this.loading =
        true;

      this.errorMessage =
        "";

      try {
        console.log(
          "Loading removal logs:",
          {
            page,
            pageSize:
              this.pageSize
          }
        );

        const response =
          await get_removal_logs(
            page,
            this.pageSize
          );

        const responseData =
          response.data &&
          typeof response.data ===
            "object"
            ? response.data
            : {};

        const records =
          Array.isArray(
            responseData.results
          )
            ? responseData.results
            : [];

        this.logs =
          records.map(
            record => {
              return this.normalizeLog(
                record
              );
            }
          );

        this.totalRecords =
          this.normalizePositiveNumber(
            responseData.count,
            this.logs.length
          );

        const responseTotalPages =
          Number(
            responseData.totalPages
          );

        this.totalPages =
          Number.isInteger(
            responseTotalPages
          ) &&
          responseTotalPages > 0
            ? responseTotalPages
            : Math.max(
                1,
                Math.ceil(
                  this.totalRecords /
                  this.pageSize
                )
              );

        const responseCurrentPage =
          Number(
            responseData.currentPage
          );

        this.currentPage =
          Number.isInteger(
            responseCurrentPage
          ) &&
          responseCurrentPage > 0
            ? responseCurrentPage
            : Math.min(
                page,
                this.totalPages
              );

        this.nextPageUrl =
          responseData.next ??
          null;

        this.previousPageUrl =
          responseData.previous ??
          null;

        this.lastUpdated =
          new Date();

        console.log(
          "Removal logs loaded:",
          {
            currentPage:
              this.currentPage,

            totalPages:
              this.totalPages,

            totalRecords:
              this.totalRecords,

            returned:
              this.logs.length,

            recordIds:
              this.logs.map(
                log => log.id
              )
          }
        );
      } catch (error) {
        console.error(
          "Unable to load removal logs:",
          {
            status:
              error.response?.status,

            response:
              error.response?.data,

            message:
              error.message,

            code:
              error.code
          }
        );

        this.errorMessage =
          this.getErrorMessage(
            error
          );
      } finally {
        this.loading =
          false;
      }
    },

    normalizeLog(
      record
    ) {
      return {
        id:
          this.normalizeIdentifier(
            record.id
          ),

        accountId:
          this.normalizeIdentifier(
            record.accountId ??
            record.account_id
          ),

        removedByAccountId:
          this.normalizeOptionalIdentifier(
            record.removedByAccountId ??
            record.removed_by_account_id
          ),

        removedByRole:
          record.removedByRole ??
          record.removed_by_role ??
          "",

        reason:
          record.reason ??
          "",

        removedAt:
          record.removedAt ??
          record.removed_at ??
          null
      };
    },

    normalizeIdentifier(
      value
    ) {
      const numberValue =
        Number(value);

      return Number.isFinite(
        numberValue
      )
        ? numberValue
        : 0;
    },

    normalizeOptionalIdentifier(
      value
    ) {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      const numberValue =
        Number(value);

      return Number.isFinite(
        numberValue
      )
        ? numberValue
        : null;
    },

    normalizePositiveNumber(
      value,
      fallback = 0
    ) {
      const numberValue =
        Number(value);

      return (
        Number.isFinite(
          numberValue
        ) &&
        numberValue >= 0
      )
        ? numberValue
        : fallback;
    },

    async refreshLogs() {
      if (
        this.refreshing ||
        this.loading
      ) {
        return;
      }

      this.refreshing =
        true;

      try {
        await this.loadRemovalLogs(
          this.currentPage
        );
      } finally {
        this.refreshing =
          false;
      }
    },

    async handlePageSizeChange() {
      if (this.loading) {
        return;
      }

      this.currentPage =
        1;

      await this.loadRemovalLogs(
        1
      );
    },

    async previousPage() {
      if (
        this.loading ||
        this.currentPage <= 1
      ) {
        return;
      }

      await this.loadRemovalLogs(
        this.currentPage -
        1
      );
    },

    async nextPage() {
      if (
        this.loading ||
        this.currentPage >=
          this.totalPages
      ) {
        return;
      }

      await this.loadRemovalLogs(
        this.currentPage +
        1
      );
    },

    rowNumber(
      index
    ) {
      return (
        (
          this.currentPage -
          1
        ) *
        this.pageSize
      ) + index + 1;
    },

    clearSearch() {
      this.search =
        "";
    },

    clearFilters() {
      this.filters = {
        role:
          "",

        reason:
          ""
      };
    },

    resetSearchAndFilters() {
      this.search =
        "";

      this.clearFilters();
    },

    openDetails(
      log
    ) {
      this.selectedLog = {
        ...log
      };

      this.showDetailsModal =
        true;

      document.body.style.overflow =
        "hidden";
    },

    closeDetails() {
      this.showDetailsModal =
        false;

      this.selectedLog =
        null;

      document.body.style.overflow =
        "";
    },

    getRoleClass(
      role
    ) {
      const value =
        String(
          role ||
          ""
        )
          .trim()
          .toLowerCase()
          .replace(
            /[\s_-]+/g,
            ""
          );

      if (
        value ===
        "superadmin"
      ) {
        return "superadmin";
      }

      if (
        value ===
        "admin"
      ) {
        return "admin";
      }

      if (
        value ===
        "manager"
      ) {
        return "manager";
      }

      return "unknown";
    },

    getReasonClass(
      reason
    ) {
      const value =
        String(
          reason ||
          ""
        )
          .trim()
          .toLowerCase();

      if (
        value ===
        "resigned"
      ) {
        return "resigned";
      }

      if (
        value ===
        "retired"
      ) {
        return "retired";
      }

      if (
        value ===
        "terminated"
      ) {
        return "terminated";
      }

      return "other";
    },

    formatDate(
      value
    ) {
      const date =
        this.parseDate(
          value
        );

      if (!date) {
        return "Not recorded";
      }

      return new Intl.DateTimeFormat(
        "en-GH",
        {
          year:
            "numeric",

          month:
            "short",

          day:
            "2-digit"
        }
      ).format(
        date
      );
    },

    formatTime(
      value
    ) {
      const date =
        this.parseDate(
          value
        );

      if (!date) {
        return "";
      }

      return new Intl.DateTimeFormat(
        "en-GH",
        {
          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      ).format(
        date
      );
    },

    formatDateTime(
      value
    ) {
      const date =
        this.parseDate(
          value
        );

      if (!date) {
        return "Not recorded";
      }

      return new Intl.DateTimeFormat(
        "en-GH",
        {
          year:
            "numeric",

          month:
            "long",

          day:
            "2-digit",

          hour:
            "2-digit",

          minute:
            "2-digit",

          second:
            "2-digit"
        }
      ).format(
        date
      );
    },

    parseDate(
      value
    ) {
      if (!value) {
        return null;
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return null;
      }

      return date;
    },

    exportCurrentPage() {
      if (
        this.filteredLogs.length ===
        0
      ) {
        return;
      }

      const rows = [
        [
          "Log ID",
          "Removed Account ID",
          "Removed By Account ID",
          "Removed By Role",
          "Reason",
          "Removed At"
        ],

        ...this.filteredLogs.map(
          log => {
            return [
              log.id,
              log.accountId,
              log.removedByAccountId ??
                "",
              log.removedByRole ||
                "",
              log.reason ||
                "",
              log.removedAt ||
                ""
            ];
          }
        )
      ];

      const csvContent =
        rows
          .map(row => {
            return row
              .map(value => {
                return this.escapeCsvValue(
                  value
                );
              })
              .join(",");
          })
          .join("\n");

      const blob =
        new Blob(
          [
            "\uFEFF",
            csvContent
          ],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );

      const downloadUrl =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        downloadUrl;

      link.download =
        `removal-logs-page-${this.currentPage}.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        downloadUrl
      );
    },

    escapeCsvValue(
      value
    ) {
      const text =
        String(
          value ??
          ""
        );

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
    },

    getErrorMessage(
      error
    ) {
      if (
        error.code ===
          "ECONNABORTED" ||
        error.message
          ?.toLowerCase()
          .includes(
            "timeout"
          )
      ) {
        return "The server took too long to retrieve the removal logs.";
      }

      if (
        error.code ===
          "ERR_NETWORK" ||
        error.message?.includes(
          "Network Error"
        )
      ) {
        return "Please check the backend connection and try again.";
      }

      const status =
        error.response?.status;

      const responseData =
        error.response?.data;

      const backendMessage =
        responseData?.error ||
        responseData?.detail ||
        responseData?.message;

      if (backendMessage) {
        return String(
          backendMessage
        );
      }

      if (status === 401) {
        return "Authentication is required.";
      }

      if (status === 403) {
        return "You do not have permission to view removal logs.";
      }

      if (status === 404) {
        return "The removal-log endpoint could not be found.";
      }

      if (status === 500) {
        return "The server could not retrieve the removal logs.";
      }

      return "Unable to retrieve the removal logs.";
    }
  }
};
</script>

<style scoped>
.removal-logs-page {
  width: 100%;
  padding: 22px;
  box-sizing: border-box;
  color: #1e293b;
}

.page-header {
  min-height: 150px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px;
  margin-bottom: 22px;
  border-radius: 20px;
  background:
    linear-gradient(
      135deg,
      #312e81,
      #4338ca 55%,
      #6366f1
    );
  box-shadow:
    0 18px 45px
    rgba(67, 56, 202, 0.24);
}

.page-header-content {
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 19px;
}

.page-header-icon {
  width: 70px;
  height: 70px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border:
    1px solid
    rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  background:
    rgba(255, 255, 255, 0.14);
}

.page-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 36px !important;
}

.page-header-text {
  min-width: 0;
}

.page-header-label {
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 5px 0 7px;
  color: #ffffff;
  font-size: 31px;
  font-weight: 900;
}

.page-header p {
  max-width: 690px;
  margin: 0;
  color:
    rgba(255, 255, 255, 0.82);
  font-size: 15px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.export-button,
.refresh-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  border:
    1px solid
    rgba(255, 255, 255, 0.28);
  border-radius: 11px;
  background:
    rgba(255, 255, 255, 0.13);
  cursor: pointer;
}

.export-button:hover,
.refresh-button:hover {
  background:
    rgba(255, 255, 255, 0.22);
}

.export-button:disabled,
.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.export-button .md-icon,
.refresh-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
  gap: 16px;
  margin-bottom: 22px;
}

.statistic-card {
  min-height: 110px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 8px 22px
    rgba(15, 23, 42, 0.06);
}

.statistic-icon {
  width: 52px;
  height: 52px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.statistic-icon.primary {
  color: #4338ca;
  background: #eef2ff;
}

.statistic-icon.success {
  color: #15803d;
  background: #dcfce7;
}

.statistic-icon.warning {
  color: #b45309;
  background: #fef3c7;
}

.statistic-icon.purple {
  color: #7e22ce;
  background: #f3e8ff;
}

.statistic-icon .md-icon {
  color: inherit !important;
  font-size: 27px !important;
}

.statistic-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.statistic-content strong {
  color: #0f172a;
  font-size: 27px;
  font-weight: 900;
  line-height: 1;
}

.statistic-content span {
  margin-top: 7px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.records-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 12px 30px
    rgba(15, 23, 42, 0.07);
}

.records-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 21px;
}

.records-heading {
  min-width: 0;
  flex: 1;
}

.records-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
}

.records-heading p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 14px;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-control {
  min-width: 310px;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 11px;
  border: 1px solid #cbd5e1;
  border-radius: 11px;
  background: #f8fafc;
}

.search-control > .md-icon {
  margin-right: 8px;
  color: #64748b !important;
  font-size: 21px !important;
}

.search-control input {
  min-width: 0;
  flex: 1;
  padding: 0;
  color: #1e293b;
  font-size: 14px;
  border: 0;
  outline: none;
  background: transparent;
}

.search-control button {
  width: 29px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #64748b;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
}

.search-control button:hover {
  background: #e2e8f0;
}

.filter-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  color: #475569;
  font-weight: 800;
  border: 1px solid #cbd5e1;
  border-radius: 11px;
  background: #ffffff;
  cursor: pointer;
}

.filter-button.active {
  color: #ffffff;
  border-color: #4338ca;
  background: #4338ca;
}

.filter-button .md-icon {
  color: inherit !important;
}

.filters-panel {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 17px 21px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.filter-control {
  min-width: 210px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filter-control label {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.filter-control select {
  min-height: 42px;
  padding: 0 11px;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
  background: #ffffff;
}

.clear-filters-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  color: #b91c1c;
  font-weight: 800;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
  cursor: pointer;
}

.clear-filters-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.records-divider {
  height: 1px;
  background: #e2e8f0;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.records-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

.records-table th {
  height: 54px;
  padding: 10px 14px;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.records-table td {
  padding: 13px 14px;
  color: #334155;
  font-size: 14px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.records-table tbody tr:hover {
  background: #f8fafc;
  box-shadow:
    inset 4px 0 0
    #4338ca;
}

.number-column {
  width: 70px;
  text-align: center !important;
}

.action-column {
  width: 85px;
  text-align: center !important;
}

.row-number {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4338ca;
  font-weight: 900;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  background: #eef2ff;
}

.account-reference {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-reference-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
}

.account-reference-icon.removed {
  color: #b91c1c;
  background: #fee2e2;
}

.account-reference-icon.actor {
  color: #4338ca;
  background: #eef2ff;
}

.account-reference-icon .md-icon {
  color: inherit !important;
  font-size: 22px !important;
}

.account-reference > div:last-child {
  display: flex;
  flex-direction: column;
}

.account-reference-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.account-reference strong {
  margin-top: 2px;
  color: #1e293b;
  font-size: 14px;
}

.role-badge,
.reason-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 31px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 900;
  border-radius: 999px;
}

.role-badge.admin {
  color: #1d4ed8;
  background: #dbeafe;
}

.role-badge.manager {
  color: #15803d;
  background: #dcfce7;
}

.role-badge.superadmin {
  color: #7e22ce;
  background: #f3e8ff;
}

.role-badge.unknown {
  color: #475569;
  background: #e2e8f0;
}

.reason-badge.resigned {
  color: #9a3412;
  background: #ffedd5;
}

.reason-badge.retired {
  color: #1d4ed8;
  background: #dbeafe;
}

.reason-badge.terminated {
  color: #b91c1c;
  background: #fee2e2;
}

.reason-badge.other {
  color: #475569;
  background: #e2e8f0;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.date-cell .md-icon {
  color: #64748b !important;
  font-size: 20px !important;
}

.date-cell > div {
  display: flex;
  flex-direction: column;
}

.date-cell strong {
  color: #334155;
  font-size: 13px;
}

.date-cell span {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}

.view-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  background: #eef2ff;
  cursor: pointer;
}

.view-button:hover {
  color: #ffffff;
  background: #4338ca;
}

.view-button .md-icon {
  color: inherit !important;
  font-size: 21px !important;
}

.pagination-footer {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 13px 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-information {
  flex: 1;
  color: #64748b;
  font-size: 14px;
}

.pagination-information strong {
  color: #1e293b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 9px;
}

.pagination-controls label {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.pagination-controls select {
  min-height: 38px;
  padding: 0 9px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
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
  background: #eef2ff;
  cursor: pointer;
}

.pagination-button:disabled {
  color: #94a3b8;
  border-color: #e2e8f0;
  background: #f1f5f9;
  cursor: not-allowed;
}

.pagination-button .md-icon {
  color: inherit !important;
}

.pagination-page {
  min-width: 76px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 900;
  text-align: center;
}

.loading-state,
.empty-state {
  min-height: 310px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.loading-state h3,
.empty-state h3 {
  margin: 16px 0 6px;
  color: #1e293b;
  font-size: 19px;
}

.loading-state p,
.empty-state p {
  max-width: 500px;
  margin: 0;
  color: #64748b;
}

.loading-spinner,
.small-loading-spinner {
  border-radius: 50%;
  border-style: solid;
  animation:
    spin 0.8s linear infinite;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border-width: 4px;
  border-color: #c7d2fe;
  border-top-color: #4338ca;
}

.small-loading-spinner {
  width: 19px;
  height: 19px;
  border-width: 3px;
  border-color: #c7d2fe;
  border-top-color: #4338ca;
}

.empty-state-icon {
  width: 68px;
  height: 68px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 18px;
  background: #f1f5f9;
}

.empty-state-icon .md-icon {
  color: inherit !important;
  font-size: 35px !important;
}

.empty-action-button {
  min-height: 42px;
  margin-top: 18px;
  padding: 0 15px;
  color: #ffffff;
  font-weight: 800;
  border: 0;
  border-radius: 9px;
  background: #4338ca;
  cursor: pointer;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 20px;
  padding: 14px;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
}

.error-banner-content {
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 11px;
}

.error-banner-content .md-icon {
  color: #dc2626 !important;
}

.error-banner-content > div {
  display: flex;
  flex-direction: column;
}

.error-banner-content span {
  margin-top: 3px;
  font-size: 13px;
}

.error-banner button {
  min-height: 37px;
  padding: 0 12px;
  color: #ffffff;
  font-weight: 800;
  border: 0;
  border-radius: 8px;
  background: #dc2626;
  cursor: pointer;
}

.table-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #4338ca;
  font-size: 14px;
  font-weight: 800;
  background:
    rgba(255, 255, 255, 0.74);
  backdrop-filter:
    blur(1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(15, 23, 42, 0.7);
  backdrop-filter:
    blur(4px);
}

.details-modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 40px);
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 30px 80px
    rgba(15, 23, 42, 0.4);
}

.details-modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 21px;
  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      #312e81,
      #4338ca
    );
}

.details-modal-heading {
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 13px;
}

.details-modal-icon {
  width: 49px;
  height: 49px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background:
    rgba(255, 255, 255, 0.15);
}

.details-modal-icon .md-icon {
  color: #ffffff !important;
}

.details-modal-heading span {
  color: #c7d2fe;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
}

.details-modal-heading h2 {
  margin: 2px 0;
  color: #ffffff;
  font-size: 21px;
}

.details-modal-heading p {
  margin: 0;
  color:
    rgba(255, 255, 255, 0.76);
  font-size: 13px;
}

.modal-close-button {
  width: 39px;
  height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #ffffff;
  border:
    1px solid
    rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  background:
    rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.modal-close-button .md-icon {
  color: #ffffff !important;
}

.details-modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  padding: 22px;
}

.details-summary {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.details-summary-item {
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 13px;
}

.details-summary-item.removed {
  color: #b91c1c;
  background: #fef2f2;
}

.details-summary-item.actor {
  color: #4338ca;
  background: #eef2ff;
}

.details-summary-item .md-icon {
  color: inherit !important;
  font-size: 29px !important;
}

.details-summary-item > div {
  display: flex;
  flex-direction: column;
}

.details-summary-item span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.details-summary-item strong {
  margin-top: 3px;
  color: inherit;
  font-size: 18px;
}

.details-summary-arrow .md-icon {
  color: #94a3b8 !important;
}

.details-section {
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #f8fafc;
}

.details-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  color: #1e293b;
  font-size: 16px;
}

.details-section h3 .md-icon {
  color: #4338ca !important;
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
}

.detail-item span {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-item strong {
  margin-top: 5px;
  color: #1e293b;
  font-size: 14px;
  word-break: break-word;
}

.details-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 21px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-done-button {
  min-height: 42px;
  padding: 0 20px;
  color: #ffffff;
  font-weight: 800;
  border: 0;
  border-radius: 9px;
  background: #4338ca;
  cursor: pointer;
}

.filter-slide-enter-active,
.filter-slide-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.filter-slide-enter,
.filter-slide-leave-to {
  opacity: 0;
  transform:
    translateY(-8px);
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.rotating {
  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .statistics-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .page-header {
    align-items: flex-start;
  }

  .header-actions {
    flex-direction: column;
  }
}

@media (max-width: 800px) {
  .removal-logs-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    padding: 21px;
  }

  .header-actions {
    width: 100%;
    flex-direction: row;
  }

  .export-button,
  .refresh-button {
    flex: 1;
    justify-content: center;
  }

  .records-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-controls {
    width: 100%;
  }

  .search-control {
    min-width: 0;
    flex: 1;
  }

  .filters-panel {
    flex-wrap: wrap;
  }

  .filter-control {
    min-width:
      calc(
        50% -
        7px
      );
    flex: 1;
  }

  .pagination-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-information,
  .pagination-controls {
    justify-content: center;
    text-align: center;
  }
}

@media (max-width: 560px) {
  .statistics-grid {
    grid-template-columns:
      1fr;
  }

  .page-header-content {
    align-items: flex-start;
  }

  .page-header-icon {
    width: 55px;
    height: 55px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .header-actions {
    flex-direction: column;
  }

  .export-button,
  .refresh-button {
    width: 100%;
  }

  .toolbar-controls {
    flex-direction: column;
  }

  .search-control,
  .filter-button {
    width: 100%;
    box-sizing: border-box;
  }

  .filter-control {
    min-width: 100%;
  }

  .clear-filters-button {
    width: 100%;
    justify-content: center;
  }

  .details-summary {
    grid-template-columns:
      1fr;
  }

  .details-summary-arrow {
    display: none;
  }

  .details-grid {
    grid-template-columns:
      1fr;
  }
}
</style>