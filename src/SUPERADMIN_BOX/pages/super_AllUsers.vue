<template>
  <div class="all-users-page">
    <section class="users-header">
      <div class="users-header-content">
        <div class="users-header-icon">
          <md-icon>manage_accounts</md-icon>
        </div>

        <div class="users-header-text">
          <span class="users-header-label">
            ACCOUNT MANAGEMENT
          </span>

          <h1 class="users-header-title">
            All Users
          </h1>

          <p class="users-header-description">
            Create, view, update, search, filter, and manage all user
            accounts in the HR system.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="users-header-button"
        :disabled="loading"
        @click="openCreateModal"
      >
        <md-icon>person_add</md-icon>
        <span>Add User</span>
      </button>
    </section>

    <section class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-primary">
          <md-icon>groups</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ accounts.length }}
          </span>

          <span class="statistic-label">
            Total Users
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-success">
          <md-icon>verified_user</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ activeUsersCount }}
          </span>

          <span class="statistic-label">
            Active Users
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-warning">
          <md-icon>block</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ inactiveUsersCount }}
          </span>

          <span class="statistic-label">
            Inactive Users
          </span>
        </div>
      </div>

      <div class="statistic-card">
        <div class="statistic-icon statistic-icon-purple">
          <md-icon>admin_panel_settings</md-icon>
        </div>

        <div class="statistic-content">
          <span class="statistic-value">
            {{ superusersCount }}
          </span>

          <span class="statistic-label">
            Superusers
          </span>
        </div>
      </div>
    </section>

    <section class="records-card">
      <div class="records-toolbar">
        <div class="records-heading">
          <h2>User Account Records</h2>

          <p>
            Search and manage every account registered in the HR system.
          </p>
        </div>

        <div class="toolbar-actions">
          <div class="search-control">
            <md-icon>search</md-icon>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Search name, ID, phone or Ghana Card..."
              aria-label="Search users"
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
            class="filter-toggle-button"
            :class="{ active: showFilters }"
            @click="showFilters = !showFilters"
          >
            <md-icon>filter_alt</md-icon>
            <span>Filters</span>
          </button>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading || refreshing"
            @click="refreshAccounts"
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

      <transition name="filter-slide">
        <div
          v-if="showFilters"
          class="filters-panel"
        >
          <div class="filter-control">
            <label for="role-filter">
              Role
            </label>

            <select
              id="role-filter"
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
                {{ formatEnum(role) }}
              </option>
            </select>
          </div>

          <div class="filter-control">
            <label for="status-filter">
              Account Status
            </label>

            <select
              id="status-filter"
              v-model="filters.status"
            >
              <option value="">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <div class="filter-control">
            <label for="staff-filter">
              Staff Account
            </label>

            <select
              id="staff-filter"
              v-model="filters.staff"
            >
              <option value="">
                All Accounts
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="non-staff">
                Non-staff
              </option>
            </select>
          </div>

          <div class="filter-control">
            <label for="superuser-filter">
              Superuser
            </label>

            <select
              id="superuser-filter"
              v-model="filters.superuser"
            >
              <option value="">
                All Accounts
              </option>

              <option value="superuser">
                Superusers
              </option>

              <option value="regular">
                Regular Users
              </option>
            </select>
          </div>

          <button
            type="button"
            class="clear-filters-button"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          >
            <md-icon>filter_alt_off</md-icon>
            <span>Clear Filters</span>
          </button>
        </div>
      </transition>

      <div class="records-divider" />

      <div
        v-if="errorMessage"
        class="error-banner"
      >
        <div class="error-banner-content">
          <md-icon>error_outline</md-icon>

          <div>
            <strong>Unable to load users</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="loadAccounts"
        >
          Try Again
        </button>
      </div>

      <div
        v-if="loading && !accounts.length"
        class="loading-state"
      >
        <div class="loading-spinner" />

        <h3>Loading user accounts</h3>

        <p>
          Please wait while the account records are retrieved.
        </p>
      </div>

      <div
        v-else-if="paginatedAccounts.length"
        class="table-responsive"
      >
        <table class="records-table">
          <thead>
            <tr>
              <th class="number-column">
                #
              </th>

              <th>
                User
              </th>

              <th>
                User ID
              </th>

              <th>
                Role
              </th>

              <th>
                Status
              </th>

            

              <th>
                Last Login
              </th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(account, index) in paginatedAccounts"
              :key="account.id"
            >
              <td>
                <span class="row-number">
                  {{ rowNumber(index) }}
                </span>
              </td>

              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    <img
                      v-if="account.profilePictureUrl"
                      :src="account.profilePictureUrl"
                      :alt="account.displayName"
                    />

                    <span v-else>
                      {{ getInitials(account) }}
                    </span>
                  </div>

                  <div class="user-information">
                    <span class="user-name">
                      {{
                        account.displayName ||
                        account.fullName ||
                        account.userId ||
                        "Unnamed User"
                      }}
                    </span>

                    <span class="user-secondary">
                      {{ account.phoneNumber || "No phone number" }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="user-id-badge">
                  {{ account.userId || "Not assigned" }}
                </span>
              </td>

              <td>
                <span
                  class="role-badge"
                  :class="getRoleClass(account.role)"
                >
                  {{ account.role || "Not assigned" }}
                </span>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{
                    active: account.isActive,
                    inactive: !account.isActive
                  }"
                >
                  <span class="status-dot" />

                  {{
                    account.isActive
                      ? "Active"
                      : "Inactive"
                  }}
                </span>
              </td>

          
              <td>
                <span class="date-value">
                  {{ formatDateTime(account.lastLogin) }}
                </span>
              </td>

              <td>
                <div class="record-actions">
                  <button
                    type="button"
                    class="record-action-button view-button"
                    title="View user details"
                    @click="openDetailsModal(account)"
                  >
                    <md-icon>visibility</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button edit-button"
                    title="Edit user"
                    :disabled="deletingId === account.id"
                    @click="openEditModal(account)"
                  >
                    <md-icon>edit</md-icon>
                  </button>

                  <button
                    type="button"
                    class="record-action-button delete-button"
                    title="Delete user"
                    :disabled="deletingId === account.id"
                    @click="deleteAccount(account)"
                  >
                    <span
                      v-if="deletingId === account.id"
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
            {{
              search || hasActiveFilters
                ? "person_search"
                : "group_off"
            }}
          </md-icon>
        </div>

        <h3>
          {{
            search || hasActiveFilters
              ? "No matching users found"
              : "No user accounts created"
          }}
        </h3>

        <p>
          {{
            search || hasActiveFilters
              ? "Try changing the search term or clearing the active filters."
              : "Create the first user account for the HR system."
          }}
        </p>

        <button
          v-if="search || hasActiveFilters"
          type="button"
          class="empty-secondary-button"
          @click="resetSearchAndFilters"
        >
          Clear Search and Filters
        </button>

        <button
          v-else
          type="button"
          class="empty-primary-button"
          @click="openCreateModal"
        >
          <md-icon>person_add</md-icon>
          <span>Add User</span>
        </button>
      </div>

      <div
        v-if="filteredAccounts.length"
        class="pagination-footer"
      >
        <div class="pagination-information">
          Showing
          <strong>{{ paginationStart }}</strong>
          to
          <strong>{{ paginationEnd }}</strong>
          of
          <strong>{{ filteredAccounts.length }}</strong>
          users
        </div>

        <div class="pagination-controls">
          <label for="accounts-page-size">
            Rows:
          </label>

          <select
            id="accounts-page-size"
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
        v-if="showDetailsModal && selectedAccount"
        class="modal-overlay"
        @click.self="closeDetailsModal"
      >
        <div class="details-modal">
          <div class="details-modal-header">
            <div class="details-profile">
              <div class="details-avatar">
                <img
                  v-if="selectedAccount.profilePictureUrl"
                  :src="selectedAccount.profilePictureUrl"
                  :alt="selectedAccount.displayName"
                />

                <span v-else>
                  {{ getInitials(selectedAccount) }}
                </span>
              </div>

              <div class="details-heading">
                <span class="modal-label">
                  USER ACCOUNT
                </span>

                <h2>
                  {{
                    selectedAccount.displayName ||
                    selectedAccount.fullName ||
                    selectedAccount.userId
                  }}
                </h2>

                <p>
                  {{ selectedAccount.userId || "No user ID" }}
                </p>
              </div>
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
            <div class="details-status-row">
              <span
                class="status-badge"
                :class="{
                  active: selectedAccount.isActive,
                  inactive: !selectedAccount.isActive
                }"
              >
                {{
                  selectedAccount.isActive
                    ? "Active Account"
                    : "Inactive Account"
                }}
              </span>

              <span
                class="role-badge"
                :class="getRoleClass(selectedAccount.role)"
              >
                {{ selectedAccount.role || "No Role" }}
              </span>

              <span
                v-if="selectedAccount.isSuperuser"
                class="account-flag superuser"
              >
                Superuser
              </span>

              <span
                v-if="selectedAccount.isStaff"
                class="account-flag staff"
              >
                Staff
              </span>
            </div>

            <section class="details-section">
              <h3>
                <md-icon>person</md-icon>
                Personal Information
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Full Name</span>
                  <strong>{{ displayValue(selectedAccount.fullName) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Gender</span>
                  <strong>{{ displayValue(selectedAccount.gender) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Date of Birth</span>
                  <strong>{{ formatDate(selectedAccount.dateOfBirth) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Age</span>
                  <strong>{{ displayValue(selectedAccount.age) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Marital Status</span>
                  <strong>{{ displayValue(selectedAccount.maritalStatus) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Retirement Date</span>
                  <strong>{{ formatDate(selectedAccount.dateOfRetirement) }}</strong>
                </div>
              </div>
            </section>

            <section class="details-section">
              <h3>
                <md-icon>contact_phone</md-icon>
                Contact and Identification
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Phone Number</span>
                  <strong>{{ displayValue(selectedAccount.phoneNumber) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Ghana Card</span>
                  <strong>{{ displayValue(selectedAccount.ghanaCardNumber) }}</strong>
                </div>

                <div class="detail-item">
                  <span>SSNIT Number</span>
                  <strong>{{ displayValue(selectedAccount.socialSecurityNumber) }}</strong>
                </div>

                <div class="detail-item">
                  <span>NHIS Number</span>
                  <strong>
                    {{ displayValue(selectedAccount.nationalHealthInsuranceNumber) }}
                  </strong>
                </div>
              </div>
            </section>

            <section class="details-section">
              <h3>
                <md-icon>work</md-icon>
                Employment Information
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Professional Status</span>
                  <strong>{{ formatEnum(selectedAccount.professional) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Staff Category</span>
                  <strong>{{ formatEnum(selectedAccount.staffCategory) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Employment Type</span>
                  <strong>
                    {{ formatEnum(selectedAccount.fulltimeContractStaff) }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>Supervisor</span>
                  <strong>{{ displayValue(selectedAccount.supervisorName) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Years in Service</span>
                  <strong>
                    {{ displayValue(selectedAccount.numberOfYearsInService) }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>Years on Current Grade</span>
                  <strong>
                    {{ displayValue(selectedAccount.yearsOnCurrentGrade) }}
                  </strong>
                </div>
              </div>
            </section>

            <section class="details-section">
              <h3>
                <md-icon>payments</md-icon>
                Salary and Payroll
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Current Salary Level</span>
                  <strong>{{ formatEnum(selectedAccount.currentSalaryLevel) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Current Salary Point</span>
                  <strong>{{ formatEnum(selectedAccount.currentSalaryPoint) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Next Salary Level</span>
                  <strong>{{ formatEnum(selectedAccount.nextSalaryLevel) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Payroll Status</span>
                  <strong>{{ formatEnum(selectedAccount.payrollStatus) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Monthly Gross Pay</span>
                  <strong>{{ formatMoney(selectedAccount.monthlyGrossPay) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Annual Salary</span>
                  <strong>{{ formatMoney(selectedAccount.annualSalary) }}</strong>
                </div>
              </div>
            </section>

            <section class="details-section">
              <h3>
                <md-icon>login</md-icon>
                Account Activity
              </h3>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Date Joined</span>
                  <strong>{{ formatDateTime(selectedAccount.dateJoined) }}</strong>
                </div>

                <div class="detail-item">
                  <span>Last Login</span>
                  <strong>{{ formatDateTime(selectedAccount.lastLogin) }}</strong>
                </div>
              </div>
            </section>
          </div>

          <div class="details-modal-footer">
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
              @click="editSelectedAccount"
            >
              <md-icon>edit</md-icon>
              <span>Edit User</span>
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
        <div class="account-form-modal">
          <div class="modal-header">
            <div class="modal-header-icon">
              <md-icon>
                {{ editingId !== null ? "edit" : "person_add" }}
              </md-icon>
            </div>

            <div class="modal-heading">
              <span class="modal-label">
                USER ACCOUNT
              </span>

              <h2>{{ formModalTitle }}</h2>
              <p>{{ formModalDescription }}</p>
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

          <div class="form-tabs">
            <button
              v-for="tab in formTabs"
              :key="tab.id"
              type="button"
              class="form-tab-button"
              :class="{ active: activeFormTab === tab.id }"
              @click="activeFormTab = tab.id"
            >
              <md-icon>{{ tab.icon }}</md-icon>
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <form
  novalidate
  @submit.prevent="saveAccount"
>
            <div class="modal-body account-form-body">
              <section
                v-show="activeFormTab === 'account'"
                class="form-section"
              >
                <h3>Account Information</h3>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="account-user-id">
                      User ID
                      <span>*</span>
                    </label>

                    <input
                      id="account-user-id"
                      ref="userIdInput"
                      v-model.trim="form.userId"
                      type="text"
                      :disabled="saving"
                    />

                    <span
                      v-if="formSubmitted && userIdError"
                      class="field-error"
                    >
                      {{ userIdError }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label for="account-role">
                      Role
                      <span>*</span>
                    </label>

                    <select
                      id="account-role"
                      v-model="form.role"
                      :disabled="saving"
                    >
                      <option value="" disabled>
                        Select role
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

                  <div class="form-group">
                    <label for="account-retirement-age">
                      Standard Retirement Age
                    </label>

                    <input
                      id="account-retirement-age"
                      v-model.number="form.standardRetirementAge"
                      type="number"
                      min="1"
                      :disabled="saving"
                    />
                  </div>
                </div>

                <div class="switch-grid">
                  <label class="switch-control">
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      :disabled="saving"
                    />

                    <span class="switch-slider" />

                    <span class="switch-content">
                      <strong>Active Account</strong>
                      <small>Allow this user to access the system.</small>
                    </span>
                  </label>

                  <label class="switch-control">
                    <input
                      v-model="form.isStaff"
                      type="checkbox"
                      :disabled="saving"
                    />

                    <span class="switch-slider" />

                    <span class="switch-content">
                      <strong>Staff Account</strong>
                      <small>Mark this account as an internal staff account.</small>
                    </span>
                  </label>

                  <label class="switch-control">
                    <input
                      v-model="form.isSuperuser"
                      type="checkbox"
                      :disabled="saving"
                    />

                    <span class="switch-slider" />

                    <span class="switch-content">
                      <strong>Superuser</strong>
                      <small>Grant full administrative privileges.</small>
                    </span>
                  </label>
                </div>
              </section>

              <section
                v-show="activeFormTab === 'personal'"
                class="form-section"
              >
                <h3>Personal Information</h3>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="first-name">First Name</label>
                    <input
                      id="first-name"
                      v-model="form.firstName"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="middle-name">Middle Name</label>
                    <input
                      id="middle-name"
                      v-model="form.middleName"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="last-name">Last Name</label>
                    <input
                      id="last-name"
                      v-model="form.lastName"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="maiden-name">Maiden Name</label>
                    <input
                      id="maiden-name"
                      v-model="form.maidenName"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="email">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select
                      id="gender"
                      v-model="form.gender"
                      :disabled="saving"
                    >
                      <option :value="null">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="marital-status">Marital Status</label>
                    <select
                      id="marital-status"
                      v-model="form.maritalStatus"
                      :disabled="saving"
                    >
                      <option :value="null">Select marital status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="date-of-birth">Date of Birth</label>
                    <input
                      id="date-of-birth"
                      v-model="form.dateOfBirth"
                      type="date"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="phone-number">Phone Number</label>
                    <input
                      id="phone-number"
                      v-model="form.phoneNumber"
                      type="text"
                      :disabled="saving"
                    />
                  </div>
                </div>
              </section>





<section
  v-show="activeFormTab === 'organization'"
  class="form-section"
>
  <div class="form-section-heading">
    <div class="form-section-icon">
      <md-icon>account_tree</md-icon>
    </div>

    <div>
      <h3>
        Organization and Grade Information
      </h3>

      <p>
        Select the academic qualification, title, directorate,
        location, management unit, and grade information.
      </p>
    </div>
  </div>

  <div class="form-grid">
    <div class="form-group">
      <label for="academic-qualification-id">
        Academic Qualification
      </label>

      <select
        id="academic-qualification-id"
        v-model.number="form.academicQualificationId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select academic qualification
        </option>

        <option
          v-for="qualification in lookupOptions.academicQualifications"
          :key="qualification.id"
          :value="qualification.id"
        >
          {{ qualification.label }}
        </option>
      </select>

      <span
        v-if="
          !lookupsLoading &&
          !lookupOptions.academicQualifications.length
        "
        class="field-information"
      >
        No academic qualifications are available.
      </span>
    </div>

    <div class="form-group">
      <label for="title-id">
        Title
      </label>

      <select
        id="title-id"
        v-model.number="form.titleId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select title
        </option>

        <option
          v-for="item in lookupOptions.titles"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="directorate-id">
        Directorate
      </label>

      <select
        id="directorate-id"
        v-model.number="form.directorateId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select directorate
        </option>

        <option
          v-for="item in lookupOptions.departments"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="category-id">
        Staff Class
      </label>

      <select
        id="category-id"
        v-model.number="form.categoryId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select staff class
        </option>

        <option
          v-for="item in lookupOptions.classes"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="region-id">
        Region
      </label>

      <select
        id="region-id"
        v-model.number="form.regionId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select region
        </option>

        <option
          v-for="item in lookupOptions.regions"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="district-id">
        District
      </label>

      <select
        id="district-id"
        v-model.number="form.districtId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select district
        </option>

        <option
          v-for="item in lookupOptions.districts"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="management-unit-id">
        Management Unit
      </label>

      <select
        id="management-unit-id"
        v-model.number="form.managementUnitCostCentreId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select management unit
        </option>

        <option
          v-for="item in lookupOptions.managementUnits"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="current-grade-id">
        Current Grade
      </label>

      <select
        id="current-grade-id"
        v-model.number="form.currentGradeId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select current grade
        </option>

        <option
          v-for="item in lookupOptions.currentGrades"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="next-grade-id">
        Next Grade
      </label>

      <select
        id="next-grade-id"
        v-model.number="form.nextGradeId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select next grade
        </option>

        <option
          v-for="item in lookupOptions.nextGrades"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="change-grade-id">
        Change of Grade
      </label>

      <select
        id="change-grade-id"
        v-model.number="form.changeOfGradeId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select grade change
        </option>

        <option
          v-for="item in lookupOptions.changeOfGrades"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="leave-type-id">
        Leave Type
      </label>

      <select
        id="leave-type-id"
        v-model.number="form.onLeaveTypeId"
        :disabled="saving || lookupsLoading"
      >
        <option :value="null">
          Select leave type
        </option>

        <option
          v-for="item in lookupOptions.leaveTypes"
          :key="item.id"
          :value="item.id"
        >
          {{ item.label }}
        </option>
      </select>
    </div>
  </div>
</section>







              <section
                v-show="activeFormTab === 'employment'"
                class="form-section"
              >
                <h3>Employment Information</h3>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="professional">Professional Status</label>
                    <select
                      id="professional"
                      v-model="form.professional"
                      :disabled="saving"
                    >
                      <option :value="null">Select status</option>
                      <option value="Professional">Professional</option>
                      <option value="Subprofessional">Subprofessional</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="professional-qualification">
                      Professional Qualification
                    </label>

                    <input
                      id="professional-qualification"
                      v-model="form.professionalQualification"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="staff-category">Staff Category</label>
                    <select
                      id="staff-category"
                      v-model="form.staffCategory"
                      :disabled="saving"
                    >
                      <option :value="null">Select category</option>
                      <option value="SENIOR_STAFF">Senior Staff</option>
                      <option value="JUNIOR_STAFF">Junior Staff</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="employment-type">Employment Type</label>
                    <select
                      id="employment-type"
                      v-model="form.fulltimeContractStaff"
                      :disabled="saving"
                    >
                      <option :value="null">Select employment type</option>
                      <option value="FULLTIME">Full-time</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="at-post-on-leave">Post or Leave Status</label>
                    <select
                      id="at-post-on-leave"
                      v-model="form.atPostOnLeave"
                      :disabled="saving"
                    >
                      <option :value="null">Select status</option>
                      <option value="AT_POST">At Post</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="supervisor-name">Supervisor Name</label>
                    <input
                      id="supervisor-name"
                      v-model="form.supervisorName"
                      type="text"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="first-appointment">First Appointment</label>
                    <input
                      id="first-appointment"
                      v-model="form.dateOfFirstAppointment"
                      type="date"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="assumption-duty">Assumption of Duty</label>
                    <input
                      id="assumption-duty"
                      v-model="form.dateOfAssumptionOfDuty"
                      type="date"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="substantive-date">Substantive Date</label>
                    <input
                      id="substantive-date"
                      v-model="form.substantiveDate"
                      type="date"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="last-promotion">Last Promotion</label>
                    <input
                      id="last-promotion"
                      v-model="form.dateOfLastPromotion"
                      type="date"
                      :disabled="saving"
                    />
                  </div>
                </div>
              </section>

              <section
                v-show="activeFormTab === 'salary'"
                class="form-section"
              >
                <h3>Salary and Payroll Information</h3>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="current-salary-level">
                      Current Salary Level
                    </label>

                    <select
                      id="current-salary-level"
                      v-model="form.currentSalaryLevel"
                      :disabled="saving"
                    >
                      <option :value="null">Select level</option>

                      <option
                        v-for="level in salaryLevelOptions"
                        :key="level"
                        :value="level"
                      >
                        {{ formatEnum(level) }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="current-salary-point">
                      Current Salary Point
                    </label>

                    <select
                      id="current-salary-point"
                      v-model="form.currentSalaryPoint"
                      :disabled="saving"
                    >
                      <option :value="null">Select point</option>

                      <option
                        v-for="point in salaryPointOptions"
                        :key="point"
                        :value="point"
                      >
                        {{ formatEnum(point) }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="next-salary-level">
                      Next Salary Level
                    </label>

                    <select
                      id="next-salary-level"
                      v-model="form.nextSalaryLevel"
                      :disabled="saving"
                    >
                      <option :value="null">Select level</option>

                      <option
                        v-for="level in salaryLevelOptions"
                        :key="level"
                        :value="level"
                      >
                        {{ formatEnum(level) }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="single-spine-salary">
                      Single Spine Monthly Salary
                    </label>

                    <input
                      id="single-spine-salary"
                      v-model="form.singleSpineMonthlySalary"
                      type="number"
                      min="0"
                      step="0.01"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="monthly-gross-pay">Monthly Gross Pay</label>
                    <input
                      id="monthly-gross-pay"
                      v-model="form.monthlyGrossPay"
                      type="number"
                      min="0"
                      step="0.01"
                      :disabled="saving"
                    />
                  </div>

                                    <div class="form-group">
                    <label for="annual-salary">
                      Annual Salary
                    </label>

                    <input
                      id="annual-salary"
                      v-model="form.annualSalary"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter annual salary"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="payroll-status">
                      Payroll Status
                    </label>

                    <select
                      id="payroll-status"
                      v-model="form.payrollStatus"
                      :disabled="saving"
                    >
                      <option :value="null">
                        Select payroll status
                      </option>

                      <option value="ACTIVE_PAID">
                        Active Paid
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>

                      <option value="SUSPENDED">
                        Suspended
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="national-effective-date">
                      National Effective Date
                    </label>

                    <input
                      id="national-effective-date"
                      v-model="form.nationalEffectiveDate"
                      type="date"
                      :disabled="saving"
                    />
                  </div>
                </div>
              </section>

              <section
                v-show="activeFormTab === 'identification'"
                class="form-section"
              >
                <div class="form-section-heading">
                  <div class="form-section-icon">
                    <md-icon>badge</md-icon>
                  </div>

                  <div>
                    <h3>
                      Identification and Banking
                    </h3>

                    <p>
                      Enter identification, accommodation, and bank details.
                    </p>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="ghana-card">
                      Ghana Card Number
                    </label>

                    <input
                      id="ghana-card"
                      v-model="form.ghanaCardNumber"
                      type="text"
                      autocomplete="off"
                      placeholder="Example: GHA-000000000-0"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="ssnit-number">
                      Social Security Number
                    </label>

                    <input
                      id="ssnit-number"
                      v-model="form.socialSecurityNumber"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter social security number"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="nhis-number">
                      National Health Insurance Number
                    </label>

                    <input
                      id="nhis-number"
                      v-model="form.nationalHealthInsuranceNumber"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter NHIS number"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="accommodation-status">
                      Accommodation Status
                    </label>

                    <select
                      id="accommodation-status"
                      v-model="form.accommodationStatus"
                      :disabled="saving"
                    >
                      <option :value="null">
                        Select accommodation status
                      </option>

                      <option value="PERSONAL">
                        Personal
                      </option>

                      <option value="RENTED">
                        Rented
                      </option>

                      <option value="OFFICIAL_RESIDENCE_OASL">
                        Official Residence OASL
                      </option>

                      <option value="OFFICIAL_RESIDENCE_GOG">
                        Official Residence GOG
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="bank-name">
                      Bank Name
                    </label>

                    <input
                      id="bank-name"
                      v-model="form.bankName"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter bank name"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="bank-account-number">
                      Bank Account Number
                    </label>

                    <input
                      id="bank-account-number"
                      v-model="form.bankAccountNumber"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter bank account number"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="bank-account-branch">
                      Bank Account Branch
                    </label>

                    <input
                      id="bank-account-branch"
                      v-model="form.bankAccountBranch"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter bank branch"
                      :disabled="saving"
                    />
                  </div>








                  <div class="form-group full-width">
  <label>
    Profile Picture
  </label>

  <div class="profile-picture-control">
    <div class="profile-picture-preview">
      <img
        v-if="profilePicturePreview"
        :src="profilePicturePreview"
        alt="Selected profile picture preview"
      />

      <md-icon v-else>
        person
      </md-icon>
    </div>

    <div class="profile-picture-content">
      <strong>
        Choose a profile picture
      </strong>

      <p>
        Select a JPG, JPEG, PNG, or WEBP image. The maximum
        allowed file size is 5 MB.
      </p>

      <div class="profile-picture-actions">
        <label
          class="choose-picture-button"
          :class="{
            disabled:
              saving ||
              uploadingProfilePicture
          }"
        >
          <md-icon>photo_library</md-icon>

          <span style="color: white;">
            {{
              selectedProfilePicture
                ? "Change Picture"
                : "Choose Picture"
            }}
          </span>

          <input
            ref="profilePictureInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="
              saving ||
              uploadingProfilePicture
            "
            @change="handleProfilePictureChange"
          />
        </label>

        <button
          v-if="
            selectedProfilePicture ||
            profilePicturePreview
          "
          type="button"
          class="remove-picture-button"
          :disabled="
            saving ||
            uploadingProfilePicture
          "
          @click="removeProfilePicture"
        >
          <md-icon>delete_outline</md-icon>

          <span>Remove</span>
        </button>
      </div>

      <span
        v-if="selectedProfilePicture"
        class="selected-file-name"
      >
        {{ selectedProfilePicture.name }}
      </span>

      <span
        v-if="
          formSubmitted &&
          profilePictureError
        "
        class="field-error"
      >
        {{ profilePictureError }}
      </span>

      <div
        v-if="uploadingProfilePicture"
        class="picture-uploading-message"
      >
        <span class="inline-spinner"></span>

        <span>
          Uploading profile picture...
        </span>
      </div>
    </div>
  </div>
</div>







                                    <div class="form-group">
                    <label for="profile-picture-public-id">
                      Profile Picture Public ID
                    </label>

                    <input
                      id="profile-picture-public-id"
                      v-model="form.profilePicturePublicId"
                      type="text"
                      autocomplete="off"
                      placeholder="Enter image public ID"
                      :disabled="saving"
                    />
                  </div>
                </div>
              </section>

              <section
                v-show="activeFormTab === 'performance'"
                class="form-section"
              >
                <div class="form-section-heading">
                  <div class="form-section-icon">
                    <md-icon>assessment</md-icon>
                  </div>

                  <div>
                    <h3>
                      Performance Information
                    </h3>

                    <p>
                      Record focus areas, targets, results, and
                      the overall staff assessment.
                    </p>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label for="number-of-focus-areas">
                      Number of Focus Areas
                    </label>

                    <input
                      id="number-of-focus-areas"
                      v-model.number="form.numberOfFocusAreas"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter focus areas"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="number-of-targets">
                      Number of Targets
                    </label>

                    <input
                      id="number-of-targets"
                      v-model.number="form.numberOfTargets"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter total targets"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="number-of-targets-met">
                      Number of Targets Met
                    </label>

                    <input
                      id="number-of-targets-met"
                      v-model.number="form.numberOfTargetsMet"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter targets met"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="number-of-targets-not-met">
                      Number of Targets Not Met
                    </label>

                    <input
                      id="number-of-targets-not-met"
                      v-model.number="form.numberOfTargetsNotMet"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter targets not met"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group">
                    <label for="overall-assessment-score">
                      Overall Assessment Score
                    </label>

                    <input
                      id="overall-assessment-score"
                      v-model="form.overallAssessmentScore"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter assessment score"
                      :disabled="saving"
                    />
                  </div>

                  <div class="form-group full-width">
                    <label for="self-assessment-description">
                      Self Assessment Description
                    </label>

                    <textarea
                      id="self-assessment-description"
                      v-model="form.selfAssessmentDescription"
                      rows="5"
                      placeholder="Enter the staff member's self-assessment"
                      :disabled="saving"
                    ></textarea>
                  </div>
                </div>

                <div class="performance-summary">
                  <div class="performance-summary-icon">
                    <md-icon>insights</md-icon>
                  </div>

                  <div class="performance-summary-content">
                    <strong>
                      Performance Summary
                    </strong>

                    <span>
                      {{ performanceSummaryText }}
                    </span>
                  </div>
                </div>
              </section>

              <div
                v-if="lookupsLoading"
                class="lookup-loading-message"
              >
                <span class="inline-spinner"></span>

                <span>
                  Loading dropdown records...
                </span>
              </div>

              <div
                v-if="lookupError"
                class="lookup-error-message"
              >
                <md-icon>warning_amber</md-icon>

                <span>
                  {{ lookupError }}
                </span>

                <button
                  type="button"
                  :disabled="lookupsLoading"
                  @click="loadLookupOptions"
                >
                  Retry
                </button>
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
              <div class="modal-footer-information">
                <md-icon>info_outline</md-icon>

                <span>
                  User ID and role are required. Other information
                  can be completed now or updated later.
                </span>
              </div>

              <div class="modal-footer-actions">
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
                  :disabled="saving || lookupsLoading"
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

function createEmptyForm() {
  return {
    userId: "",
    role: "",

    firstName: "",
    middleName: "",
    lastName: "",
    maidenName: "",
    email:"",

    gender: null,
    dateOfBirth: "",
    maritalStatus: null,

    academicQualificationId: null,
    directorateId: null,
    categoryId: null,
    districtId: null,
    regionId: null,
    currentGradeId: null,
    nextGradeId: null,
    changeOfGradeId: null,
    managementUnitCostCentreId: null,
    titleId: null,
    onLeaveTypeId: null,

    professional: null,
    professionalQualification: "",
    staffCategory: null,
    fulltimeContractStaff: null,

    currentSalaryLevel: null,
    currentSalaryPoint: null,
    nextSalaryLevel: null,

    dateOfAssumptionOfDuty: "",
    substantiveDate: "",
    nationalEffectiveDate: "",
    dateOfLastPromotion: "",
    dateOfFirstAppointment: "",

    singleSpineMonthlySalary: "",
    monthlyGrossPay: "",
    annualSalary: "",

    numberOfFocusAreas: null,
    numberOfTargets: null,
    numberOfTargetsMet: null,
    numberOfTargetsNotMet: null,
    overallAssessmentScore: "",
    selfAssessmentDescription: "",

    phoneNumber: "",
    ghanaCardNumber: "",
    socialSecurityNumber: "",
    nationalHealthInsuranceNumber: "",

    bankName: "",
    bankAccountNumber: "",
    bankAccountBranch: "",

    payrollStatus: null,
    atPostOnLeave: null,
    accommodationStatus: null,
    supervisorName: "",

    profilePictureUrl: "",
    profilePicturePublicId: "",

    standardRetirementAge: 60,
    isActive: true,
    isStaff: false,
    isSuperuser: false
  };
}

function createEmptyLookups() {
  return {
    academicQualifications: [],
    departments: [],
    classes:[],
    staffClasses: [],
    districts: [],
    regions: [],
    currentGrades: [],
    nextGrades: [],
    changeOfGrades: [],
    managementUnits: [],
    titles: [],
    leaveTypes: []
  };
}


export default {
  name: "SuperAllUsers",

  data() {
    return {
      loading: false,
      refreshing: false,
      saving: false,
      deletingId: null,


      selectedProfilePicture: null,
profilePicturePreview: "",
profilePictureError: "",
uploadingProfilePicture: false,
removeExistingProfilePicture: false,

      lookupsLoading: false,
      lookupError: "",

      showFilters: false,
      showDetailsModal: false,
      showFormModal: false,

      selectedAccount: null,
      editingId: null,
      formSubmitted: false,
      activeFormTab: "account",

      search: "",
      errorMessage: "",
      formError: "",

      accounts: [],
      lookupOptions: createEmptyLookups(),

      currentPage: 1,
      pageSize: 10,
      lastUpdated: null,

      filters: {
        role: "",
        status: "",
        staff: "",
        superuser: ""
      },

      form: createEmptyForm(),

      roleOptions: [
        "Admin",
        "Manager",
        "Staff"
      ],

      salaryPointOptions: [
        "POINT_1",
        "POINT_2",
        "POINT_3",
        "POINT_4",
        "POINT_5",
        "POINT_6",
        "POINT_7",
        "POINT_8",
        "POINT_9",
        "POINT_10",
        "POINT_11",
        "POINT_12",
        "POINT_13",
        "POINT_14",
        "POINT_15"
      ],

      salaryLevelOptions: [
        "SS_5",
        "SS_6",
        "SS_7",
        "SS_8",
        "SS_9",
        "SS_10",
        "SS_11",
        "SS_12",
        "SS_13",
        "SS_14",
        "SS_15",
        "SS_16",
        "SS_17",
        "SS_18",
        "SS_19",
        "SS_20",
        "SS_21",
        "SS_22",
        "SS_23",
        "SS_24",
        "SS_25"
      ],

      formTabs: [
        {
          id: "account",
          label: "Account",
          icon: "manage_accounts"
        },
        {
          id: "personal",
          label: "Personal",
          icon: "person"
        },
        {
          id: "organization",
          label: "Organization",
          icon: "account_tree"
        },
        {
          id: "employment",
          label: "Employment",
          icon: "work"
        },
        {
          id: "salary",
          label: "Salary",
          icon: "payments"
        },
        {
          id: "identification",
          label: "Identification",
          icon: "badge"
        },
        {
          id: "performance",
          label: "Performance",
          icon: "assessment"
        }
      ]
    };
  },

  computed: {
    activeUsersCount() {
      return this.accounts.filter(
        account => account.isActive
      ).length;
    },

    inactiveUsersCount() {
      return this.accounts.filter(
        account => !account.isActive
      ).length;
    },

    superusersCount() {
      return this.accounts.filter(
        account => account.isSuperuser
      ).length;
    },

    hasActiveFilters() {
      return Boolean(
        this.filters.role ||
        this.filters.status ||
        this.filters.staff ||
        this.filters.superuser
      );
    },

    filteredAccounts() {
      const searchValue = this.search
        ? this.search.trim().toLowerCase()
        : "";

      return this.accounts.filter(account => {
        const searchableValues = [
          account.userId,
          account.firstName,
          account.middleName,
          account.lastName,
          account.fullName,
          account.displayName,
          account.phoneNumber,
          account.ghanaCardNumber,
          account.socialSecurityNumber,
          account.nationalHealthInsuranceNumber,
          account.role
        ]
          .filter(value => value !== null && value !== undefined)
          .map(value => String(value).toLowerCase());

        const matchesSearch =
          !searchValue ||
          searchableValues.some(value =>
            value.includes(searchValue)
          );

        const matchesRole =
          !this.filters.role ||
          account.role === this.filters.role;

        const matchesStatus =
          !this.filters.status ||
          (
            this.filters.status === "active" &&
            account.isActive
          ) ||
          (
            this.filters.status === "inactive" &&
            !account.isActive
          );

        const matchesStaff =
          !this.filters.staff ||
          (
            this.filters.staff === "staff" &&
            account.isStaff
          ) ||
          (
            this.filters.staff === "non-staff" &&
            !account.isStaff
          );

        const matchesSuperuser =
          !this.filters.superuser ||
          (
            this.filters.superuser === "superuser" &&
            account.isSuperuser
          ) ||
          (
            this.filters.superuser === "regular" &&
            !account.isSuperuser
          );

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          matchesStaff &&
          matchesSuperuser
        );
      });
    },

    sortedAccounts() {
      return [...this.filteredAccounts].sort(
        (first, second) => {
          return Number(second.id) - Number(first.id);
        }
      );
    },

    totalPages() {
      return Math.max(
        1,
        Math.ceil(
          this.sortedAccounts.length /
          this.pageSize
        )
      );
    },

    paginatedAccounts() {
      const start =
        (this.currentPage - 1) *
        this.pageSize;

      return this.sortedAccounts.slice(
        start,
        start + this.pageSize
      );
    },

    paginationStart() {
      if (!this.sortedAccounts.length) {
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
        this.sortedAccounts.length
      );
    },

    formModalTitle() {
      return this.editingId !== null
        ? "Edit User Account"
        : "Create User Account";
    },

    formModalDescription() {
      return this.editingId !== null
        ? "Update the selected user account information."
        : "Create a new account for the HR system.";
    },

    submitButtonText() {
      if (this.saving) {
        return this.editingId !== null
          ? "Updating User..."
          : "Creating User...";
      }

      return this.editingId !== null
        ? "Update User"
        : "Create User";
    },

    userIdError() {
      const userId = this.form.userId
        ? this.form.userId.trim()
        : "";

      if (!userId) {
        return "User ID is required.";
      }

      if (userId.length > 222) {
        return "User ID cannot exceed 222 characters.";
      }

      const duplicate = this.accounts.some(
        account => {
          const existingUserId = account.userId
            ? account.userId.trim().toLowerCase()
            : "";

          return (
            Number(account.id) !==
              Number(this.editingId) &&
            existingUserId ===
              userId.toLowerCase()
          );
        }
      );

      if (duplicate) {
        return "This user ID already exists.";
      }

      return "";
    },



    performanceSummaryText() {
      const targets =
        Number(this.form.numberOfTargets) || 0;

      const targetsMet =
        Number(this.form.numberOfTargetsMet) || 0;

      const targetsNotMet =
        Number(this.form.numberOfTargetsNotMet) || 0;

      if (
        targets === 0 &&
        targetsMet === 0 &&
        targetsNotMet === 0
      ) {
        return "No performance targets have been entered.";
      }

      return `${targetsMet} target(s) met, ${targetsNotMet} target(s) not met, from ${targets} target(s).`;
    }
  },

  watch: {
    search() {
      this.currentPage = 1;
    },

    filters: {
      deep: true,

      handler() {
        this.currentPage = 1;
      }
    },

    totalPages(value) {
      if (this.currentPage > value) {
        this.currentPage = value;
      }
    },

    showDetailsModal() {
      this.updateBodyScroll();
    },

    showFormModal() {
      this.updateBodyScroll();
    }
  },

  created() {
    this.loadAccounts();
  },

beforeDestroy() {
  document.body.style.overflow =
    "";

  this.revokeProfilePicturePreview();
},

  methods: {


    handleProfilePictureChange(event) {
  this.profilePictureError = "";

  const files =
    event.target.files;

  if (!files || !files.length) {
    return;
  }

  const file = files[0];

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    this.profilePictureError =
      "Choose a JPG, JPEG, PNG, or WEBP image.";

    this.clearProfilePictureInput();

    return;
  }

  const maximumFileSize =
    5 * 1024 * 1024;

  if (file.size > maximumFileSize) {
    this.profilePictureError =
      "Profile picture cannot exceed 5 MB.";

    this.clearProfilePictureInput();

    return;
  }

  this.revokeProfilePicturePreview();

  this.selectedProfilePicture =
    file;

  this.profilePicturePreview =
    URL.createObjectURL(file);

  this.removeExistingProfilePicture =
    false;
},

clearProfilePictureInput() {
  this.selectedProfilePicture =
    null;

  if (this.$refs.profilePictureInput) {
    this.$refs.profilePictureInput.value =
      "";
  }
},

revokeProfilePicturePreview() {
  if (
    this.profilePicturePreview &&
    this.profilePicturePreview.startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      this.profilePicturePreview
    );
  }
},

removeProfilePicture() {
  this.revokeProfilePicturePreview();

  this.selectedProfilePicture =
    null;

  this.profilePicturePreview =
    "";

  this.profilePictureError =
    "";

  this.removeExistingProfilePicture =
    true;

  this.form.profilePictureUrl =
    "";

  this.form.profilePicturePublicId =
    "";

  if (this.$refs.profilePictureInput) {
    this.$refs.profilePictureInput.value =
      "";
  }
},


async uploadProfilePicture() {
  if (!this.selectedProfilePicture) {
    return {
      profilePictureUrl:
        this.cleanString(
          this.form.profilePictureUrl
        ),

      profilePicturePublicId:
        this.cleanString(
          this.form.profilePicturePublicId
        )
    };
  }

  this.uploadingProfilePicture =
    true;

  this.profilePictureError =
    "";

  const uploadData =
    new FormData();

  uploadData.append(
    "file",
    this.selectedProfilePicture
  );

  try {
    const requestConfig =
      this.getRequestConfig();

    const headers = {
      ...requestConfig.headers
    };

    delete headers["Content-Type"];

    const response =
      await axios.post(
        `${API_BASE_URL}/media/profile-picture`,
        uploadData,
        {
          headers
        }
      );

    const responseData =
      response.data || {};

    const profilePictureUrl =
      responseData.url ||
      responseData.profilePictureUrl ||
      responseData.secureUrl ||
      "";

    const profilePicturePublicId =
      responseData.publicId ||
      responseData.profilePicturePublicId ||
      "";

    if (!profilePictureUrl) {
      throw new Error(
        "The upload endpoint did not return an image URL."
      );
    }

    this.form.profilePictureUrl =
      profilePictureUrl;

    this.form.profilePicturePublicId =
      profilePicturePublicId;

    return {
      profilePictureUrl,
      profilePicturePublicId
    };
  } catch (error) {
    this.profilePictureError =
      this.getErrorMessage(
        error,
        "Unable to upload the profile picture."
      );

    throw error;
  } finally {
    this.uploadingProfilePicture =
      false;
  }
},




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

    updateBodyScroll() {
      document.body.style.overflow =
        this.showDetailsModal ||
        this.showFormModal
          ? "hidden"
          : "";
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

  const collectionNames = [
    "accounts",
    "academicQualifications",
    "qualifications",
    "departments",
    "classes",
    "staffClasses",
    "districts",
    "regions",
    "currentGrades",
    "nextGrades",
    "changeOfGrades",
    "managementUnits",
    "titles",
    "leaveTypes",
    "onLeaveTypes"
  ];

  for (const collectionName of collectionNames) {
    if (
      responseData &&
      Array.isArray(
        responseData[collectionName]
      )
    ) {
      return responseData[collectionName];
    }
  }

  return [];
},


    normalizeBoolean(value, fallback = false) {
      if (typeof value === "boolean") {
        return value;
      }

      if (value === 1 || value === "1") {
        return true;
      }

      if (value === 0 || value === "0") {
        return false;
      }

      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      return fallback;
    },

    normalizeAccount(account) {
      return {
        ...account,

        id: Number(account.id),

        displayName:
          account.displayName ||
          account.fullName ||
          account.userId ||
          "Unnamed User",

        fullName:
          account.fullName ||
          [
            account.firstName,
            account.middleName,
            account.lastName
          ]
            .filter(Boolean)
            .join(" ")
            .trim(),

        isActive: this.normalizeBoolean(
          account.isActive,
          true
        ),

        isStaff: this.normalizeBoolean(
          account.isStaff,
          false
        ),

        isSuperuser: this.normalizeBoolean(
          account.isSuperuser,
          false
        )
      };
    },

    async loadAccounts() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.get(
          `${API_BASE_URL}/accounts`,
          this.getRequestConfig()
        );

        const records =
          this.getResponseRecords(
            response.data
          );

        this.accounts = records.map(
          account => this.normalizeAccount(account)
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
        this.accounts = [];

        this.errorMessage =
          this.getErrorMessage(
            error,
            "Unable to load user accounts."
          );
      } finally {
        this.loading = false;
      }
    },

    async refreshAccounts() {
      this.refreshing = true;

      try {
        await this.loadAccounts();
      } finally {
        this.refreshing = false;
      }
    },

    async loadLookupOptions() {
      this.lookupsLoading = true;
      this.lookupError = "";

      const lookupDefinitions = [
       {
  key: "academicQualifications",
  endpoint: "academic-qualifications",
  fields: [
    "academicQualificationName",
    "academicQualification",
    "qualificationName",
    "qualification",
    "name"
  ]
},

        {
          key: "departments",
          endpoint: "departments",
          fields: [
            "department",
            "departmentName",
            "name"
          ]
        },
        {
          key: "staffClasses",
          endpoint: "staff-classes",
          fields: [
            "staffClass",
            "staffClassName",
            "name"
          ]
        },
        {
          key: "classes",
          endpoint: "classes",
          fields: [
            "classes",
            "classesName",
            "name"
          ]
        },
        {
          key: "districts",
          endpoint: "districts",
          fields: [
            "district",
            "districtName",
            "name"
          ]
        },
        {
          key: "regions",
          endpoint: "regions",
          fields: [
            "region",
            "regionName",
            "name"
          ]
        },
        {
          key: "currentGrades",
          endpoint: "current-grades",
          fields: [
            "currentGrade",
            "grade",
            "name"
          ]
        },
        {
          key: "nextGrades",
          endpoint: "next-grades",
          fields: [
            "nextGrade",
            "grade",
            "name"
          ]
        },
        {
          key: "changeOfGrades",
          endpoint: "change-of-grades",
          fields: [
            "changeOfGrade",
            "grade",
            "name"
          ]
        },
        {
          key: "managementUnits",
          endpoint: "management-units",
          fields: [
            "managementUnitName",
            "name"
          ]
        },
        {
          key: "titles",
          endpoint: "titles",
          fields: [
            "title",
            "name"
          ]
        },
        {
          key: "leaveTypes",
          endpoint: "on-leave-types",
          fields: [
            "name",
            "leaveTypeName"
          ]
        }
      ];

      try {
        const responses = await Promise.all(
          lookupDefinitions.map(definition =>
            axios.get(
              `${API_BASE_URL}/${definition.endpoint}`,
              this.getRequestConfig()
            )
          )
        );

        lookupDefinitions.forEach(
          (definition, index) => {
            const records =
              this.getResponseRecords(
                responses[index].data
              );

            this.lookupOptions[definition.key] =
              records.map(record => {
                return {
                  id: Number(record.id),

                  label:
                    this.getLookupLabel(
                      record,
                      definition.fields
                    )
                };
              });
          }
        );
      } catch (error) {
        this.lookupError =
          this.getErrorMessage(
            error,
            "Some dropdown records could not be loaded."
          );
      } finally {
        this.lookupsLoading = false;
      }
    },

    getLookupLabel(record, fields) {
      for (const field of fields) {
        if (
          record[field] !== null &&
          record[field] !== undefined &&
          String(record[field]).trim()
        ) {
          return String(record[field]).trim();
        }
      }

      return `Record #${record.id}`;
    },

    openDetailsModal(account) {
      this.selectedAccount =
        this.normalizeAccount(account);

      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedAccount = null;
    },

    editSelectedAccount() {
      const account = this.selectedAccount;

      this.closeDetailsModal();

      if (account) {
        this.openEditModal(account);
      }
    },

    async openCreateModal() {
      this.resetForm();
      this.activeFormTab = "account";
      this.showFormModal = true;

      await this.loadLookupOptions();

      this.focusUserIdInput();
    },





async openEditModal(account) {
  this.resetForm();

  this.editingId =
    account.id;

  Object.keys(this.form).forEach(key => {
    if (
      account[key] !== null &&
      account[key] !== undefined
    ) {
      this.form[key] =
        account[key];
    }
  });

  const relationshipKeys = [
    "academicQualificationId",
    "directorateId",
    "categoryId",
    "districtId",
    "regionId",
    "currentGradeId",
    "nextGradeId",
    "changeOfGradeId",
    "managementUnitCostCentreId",
    "titleId",
    "onLeaveTypeId"
  ];

  relationshipKeys.forEach(key => {
    this.form[key] =
      account[key] !== null &&
      account[key] !== undefined &&
      account[key] !== ""
        ? Number(account[key])
        : null;
  });

  this.form.standardRetirementAge =
    Number(
      account.standardRetirementAge
    ) || 60;

  this.form.isActive =
    this.normalizeBoolean(
      account.isActive,
      true
    );

  this.form.isStaff =
    this.normalizeBoolean(
      account.isStaff,
      false
    );

  this.form.isSuperuser =
    this.normalizeBoolean(
      account.isSuperuser,
      false
    );

  this.profilePicturePreview =
    account.profilePictureUrl || "";

  this.selectedProfilePicture =
    null;

  this.removeExistingProfilePicture =
    false;

  this.activeFormTab =
    "account";

  this.showFormModal =
    true;

  await this.loadLookupOptions();

  this.focusUserIdInput();
},



    closeFormModal() {
      if (this.saving) {
        return;
      }

      this.showFormModal = false;
      this.resetForm();
    },

resetForm() {
  this.revokeProfilePicturePreview();

  this.form =
    createEmptyForm();

  this.editingId =
    null;

  this.formSubmitted =
    false;

  this.formError =
    "";

  this.lookupError =
    "";

  this.profilePictureError =
    "";

  this.profilePicturePreview =
    "";

  this.selectedProfilePicture =
    null;

  this.uploadingProfilePicture =
    false;

  this.removeExistingProfilePicture =
    false;

  this.activeFormTab =
    "account";

  if (this.$refs.profilePictureInput) {
    this.$refs.profilePictureInput.value =
      "";
  }
},

    focusUserIdInput() {
      this.$nextTick(() => {
        if (this.$refs.userIdInput) {
          this.$refs.userIdInput.focus();
        }
      });
    },

    cleanString(value) {
      if (
        value === null ||
        value === undefined
      ) {
        return null;
      }

      const cleaned = String(value).trim();

      return cleaned || null;
    },

    cleanNumber(value) {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      const parsedValue = Number(value);

      return Number.isFinite(parsedValue)
        ? parsedValue
        : null;
    },

    cleanId(value) {
      const parsedValue =
        this.cleanNumber(value);

      return parsedValue === null
        ? null
        : Number.parseInt(
            parsedValue,
            10
          );
    },

    buildPayload() {
      return {
        userId:
          this.form.userId.trim(),

        role:
          this.form.role,

        firstName:
          this.cleanString(
            this.form.firstName
          ),

        middleName:
          this.cleanString(
            this.form.middleName
          ),

        lastName:
          this.cleanString(
            this.form.lastName
          ),

        maidenName:
          this.cleanString(
            this.form.maidenName
          ),

           email:
          this.cleanString(
            this.form.email
          ),


        gender:
          this.form.gender || null,

        dateOfBirth:
          this.cleanString(
            this.form.dateOfBirth
          ),

        maritalStatus:
          this.form.maritalStatus || null,

        directorateId:
          this.cleanId(
            this.form.directorateId
          ),

        categoryId:
          this.cleanId(
            this.form.categoryId
          ),

        districtId:
          this.cleanId(
            this.form.districtId
          ),

        regionId:
          this.cleanId(
            this.form.regionId
          ),

        currentGradeId:
          this.cleanId(
            this.form.currentGradeId
          ),

        nextGradeId:
          this.cleanId(
            this.form.nextGradeId
          ),

        changeOfGradeId:
          this.cleanId(
            this.form.changeOfGradeId
          ),

        managementUnitCostCentreId:
          this.cleanId(
            this.form.managementUnitCostCentreId
          ),

        titleId:
          this.cleanId(
            this.form.titleId
          ),

        onLeaveTypeId:
          this.cleanId(
            this.form.onLeaveTypeId
          ),

        academicQualificationId:
          this.cleanId(
            this.form.academicQualificationId
          ),

        professional:
          this.form.professional || null,

        professionalQualification:
          this.cleanString(
            this.form.professionalQualification
          ),

        staffCategory:
          this.form.staffCategory || null,

        fulltimeContractStaff:
          this.form.fulltimeContractStaff || null,

        currentSalaryLevel:
          this.form.currentSalaryLevel || null,

        currentSalaryPoint:
          this.form.currentSalaryPoint || null,

        nextSalaryLevel:
          this.form.nextSalaryLevel || null,

        dateOfAssumptionOfDuty:
          this.cleanString(
            this.form.dateOfAssumptionOfDuty
          ),

        substantiveDate:
          this.cleanString(
            this.form.substantiveDate
          ),

        nationalEffectiveDate:
          this.cleanString(
            this.form.nationalEffectiveDate
          ),

        dateOfLastPromotion:
          this.cleanString(
            this.form.dateOfLastPromotion
          ),

        dateOfFirstAppointment:
          this.cleanString(
            this.form.dateOfFirstAppointment
          ),

        singleSpineMonthlySalary:
          this.cleanString(
            this.form.singleSpineMonthlySalary
          ),

        monthlyGrossPay:
          this.cleanString(
            this.form.monthlyGrossPay
          ),

        annualSalary:
          this.cleanString(
            this.form.annualSalary
          ),

        numberOfFocusAreas:
          this.cleanNumber(
            this.form.numberOfFocusAreas
          ),

        numberOfTargets:
          this.cleanNumber(
            this.form.numberOfTargets
          ),

        numberOfTargetsMet:
          this.cleanNumber(
            this.form.numberOfTargetsMet
          ),

        numberOfTargetsNotMet:
          this.cleanNumber(
            this.form.numberOfTargetsNotMet
          ),

        overallAssessmentScore:
          this.cleanString(
            this.form.overallAssessmentScore
          ),

        selfAssessmentDescription:
          this.cleanString(
            this.form.selfAssessmentDescription
          ),

        phoneNumber:
          this.cleanString(
            this.form.phoneNumber
          ),

        ghanaCardNumber:
          this.cleanString(
            this.form.ghanaCardNumber
          ),

        socialSecurityNumber:
          this.cleanString(
            this.form.socialSecurityNumber
          ),

        nationalHealthInsuranceNumber:
          this.cleanString(
            this.form.nationalHealthInsuranceNumber
          ),

        bankName:
          this.cleanString(
            this.form.bankName
          ),

        bankAccountNumber:
          this.cleanString(
            this.form.bankAccountNumber
          ),

        bankAccountBranch:
          this.cleanString(
            this.form.bankAccountBranch
          ),

        payrollStatus:
          this.form.payrollStatus || null,

        atPostOnLeave:
          this.form.atPostOnLeave || null,

        accommodationStatus:
          this.form.accommodationStatus || null,

        supervisorName:
          this.cleanString(
            this.form.supervisorName
          ),

        profilePictureUrl:
          this.cleanString(
            this.form.profilePictureUrl
          ),

        profilePicturePublicId:
          this.cleanString(
            this.form.profilePicturePublicId
          ),

        standardRetirementAge:
          Number(
            this.form.standardRetirementAge
          ) || 60,

        isActive:
          Boolean(this.form.isActive),

        isStaff:
          Boolean(this.form.isStaff),

        isSuperuser:
          Boolean(this.form.isSuperuser)
      };
    },


validateForm() {
  this.formError = "";

  if (this.userIdError) {
    this.activeFormTab =
      "account";

    this.formError =
      this.userIdError;

    this.focusUserIdInput();

    return false;
  }

  if (!this.form.role) {
    this.activeFormTab =
      "account";

    this.formError =
      "Role is required.";

    return false;
  }

  if (
    Number(
      this.form.standardRetirementAge
    ) <= 0
  ) {
    this.activeFormTab =
      "account";

    this.formError =
      "Standard retirement age must be greater than zero.";

    return false;
  }

  if (this.profilePictureError) {
    this.activeFormTab =
      "identification";

    this.formError =
      this.profilePictureError;

    return false;
  }

  const targets =
    Number(
      this.form.numberOfTargets
    ) || 0;

  const targetsMet =
    Number(
      this.form.numberOfTargetsMet
    ) || 0;

  const targetsNotMet =
    Number(
      this.form.numberOfTargetsNotMet
    ) || 0;

  if (
    targets > 0 &&
    targetsMet + targetsNotMet >
      targets
  ) {
    this.activeFormTab =
      "performance";

    this.formError =
      "Targets met and targets not met cannot exceed the total targets.";

    return false;
  }

  return true;
},






   async saveAccount() {
  this.formSubmitted = true;
  this.formError = "";

  if (!this.validateForm()) {
    return;
  }

  this.saving = true;

  try {
    let pictureData = {
      profilePictureUrl:
        this.cleanString(
          this.form.profilePictureUrl
        ),

      profilePicturePublicId:
        this.cleanString(
          this.form.profilePicturePublicId
        )
    };

    if (this.selectedProfilePicture) {
      pictureData =
        await this.uploadProfilePicture();
    }

    if (this.removeExistingProfilePicture) {
      pictureData = {
        profilePictureUrl: null,
        profilePicturePublicId: null
      };
    }

    const payload = {
      ...this.buildPayload(),

      profilePictureUrl:
        pictureData.profilePictureUrl,

      profilePicturePublicId:
        pictureData.profilePicturePublicId
    };

    if (this.editingId !== null) {
      await axios.put(
        `${API_BASE_URL}/accounts/${this.editingId}`,
        payload,
        this.getRequestConfig()
      );

      this.showFormModal = false;

      await this.showSuccess(
        "User updated",
        `"${payload.userId}" was updated successfully.`
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/accounts`,
        payload,
        this.getRequestConfig()
      );

      this.showFormModal = false;

      await this.showSuccess(
        "User created",
        `"${payload.userId}" was created successfully.`
      );
    }

    this.resetForm();

    await this.loadAccounts();
  } catch (error) {
    if (!this.profilePictureError) {
      this.formError =
        this.getErrorMessage(
          error,
          "Unable to save the user account."
        );
    } else {
      this.activeFormTab =
        "identification";

      this.formError =
        this.profilePictureError;
    }
  } finally {
    this.saving = false;
  }
},






    async deleteAccount(account) {
      const accountName =
        account.displayName ||
        account.fullName ||
        account.userId ||
        "this account";

      const result = await Swal.fire({
        title: "Delete user account?",

        html: `
          <div style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.7;
          ">
            Are you sure you want to delete
            <strong style="color: #1f2937;">
              ${this.escapeHtml(accountName)}
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

      this.deletingId = account.id;

      try {
        await axios.delete(
          `${API_BASE_URL}/accounts/${account.id}`,
          this.getRequestConfig()
        );

        await Swal.fire({
          title: "User deleted",

          text:
            `"${accountName}" was deleted successfully.`,

          icon: "success",

          confirmButtonColor: "#4338ca",

          confirmButtonText:
            '<span style="color: white;">Done</span>',

          timer: 2200,
          timerProgressBar: true
        });

        await this.loadAccounts();
      } catch (error) {
        await Swal.fire({
          title: "Delete failed",

          text: this.getErrorMessage(
            error,
            "Unable to delete the user account."
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

        confirmButtonColor: "#4338ca",

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
      const err = error
      console.log("error print is ", error)

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

      if (
        responseData &&
        typeof responseData.error === "string"
      ) {
        return responseData.error;
      }

      if (
        responseData &&
        Array.isArray(responseData.errors)
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

      if (status === 400) {
        return "Please check the submitted account information.";
      }

      if (status === 401) {
        return "Your session is no longer valid.";
      }

      if (status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (status === 404) {
        return "The account record or endpoint was not found.";
      }

      if (status === 409) {
        return "The user ID, phone number, or another unique value already exists.";
      }

      if (status === 422) {
        return "The submitted account information could not be processed.";
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

    displayValue(value) {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return "Not provided";
      }

      return value;
    },

    formatEnum(value) {
      if (!value) {
        return "Not provided";
      }

      return String(value)
        .toLowerCase()
        .split("_")
        .map(word => {
          return (
            word.charAt(0).toUpperCase() +
            word.slice(1)
          );
        })
        .join(" ");
    },

    formatDate(value) {
      if (!value) {
        return "Not provided";
      }

      const date = new Date(
        `${String(value).slice(0, 10)}T00:00:00`
      );

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString();
    },

    formatDateTime(value) {
      if (!value) {
        return "Never";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString();
    },

    formatMoney(value) {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return "Not provided";
      }

      const amount = Number(value);

      if (!Number.isFinite(amount)) {
        return String(value);
      }

      return new Intl.NumberFormat(
        "en-GH",
        {
          style: "currency",
          currency: "GHS"
        }
      ).format(amount);
    },

    getInitials(account) {
      const source =
        account.fullName ||
        account.displayName ||
        account.userId ||
        "User";

      return source
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0))
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

    clearSearch() {
      this.search = "";
      this.currentPage = 1;
    },

    clearFilters() {
      this.filters = {
        role: "",
        status: "",
        staff: "",
        superuser: ""
      };

      this.currentPage = 1;
    },

    resetSearchAndFilters() {
      this.search = "";
      this.clearFilters();
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


.profile-picture-control {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 20px;
  border: 1px solid #dbe3ee;
  border-radius: 15px;
  background: #f8fafc;
}

.profile-picture-preview {
  width: 130px;
  height: 130px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #4338ca;
  border: 3px solid #e0e7ff;
  border-radius: 50%;
  background: #eef2ff;
}

.profile-picture-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-preview .md-icon {
  color: #4338ca !important;
  font-size: 62px !important;
}

.profile-picture-content {
  min-width: 0;
  flex: 1;
}

.profile-picture-content > strong {
  display: block;
  color: #1f2937;
  font-size: 18px;
  font-weight: 800;
}

.profile-picture-content > p {
  max-width: 560px;
  margin: 7px 0 15px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.profile-picture-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.choose-picture-button,
.remove-picture-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
}

.choose-picture-button {
  position: relative;
  overflow: hidden;
  color: #ffffff;
  border: 0;
  background: #4338ca;
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.2);
}

.choose-picture-button:hover {
  background: #3730a3;
}

.choose-picture-button.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.choose-picture-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.choose-picture-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.remove-picture-button {
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.remove-picture-button:hover:not(:disabled) {
  background: #fee2e2;
}

.remove-picture-button .md-icon {
  color: #dc2626 !important;
  font-size: 21px !important;
}

.remove-picture-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.selected-file-name {
  display: block;
  max-width: 540px;
  margin-top: 12px;
  overflow: hidden;
  color: #475569;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picture-uploading-message {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  color: #4338ca;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 575px) {
  .profile-picture-control {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-picture-preview {
    width: 110px;
    height: 110px;
    align-self: center;
  }

  .profile-picture-content {
    width: 100%;
  }

  .profile-picture-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .choose-picture-button,
  .remove-picture-button {
    width: 100%;
  }
}




.all-users-page {
  width: 100%;
  min-height: 100%;
  padding: 4px 0 32px;
  color: #1f2937;
  font-size: 16px;
}

.users-header {
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
  border: 1px solid #dddff7;
  border-left: 5px solid #4338ca;
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 87% 0%,
      rgba(67, 56, 202, 0.07),
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

.users-header::before {
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

.users-header-content {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.users-header-icon {
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
    #3730a3,
    #4338ca
  );
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.23);
}

.users-header-icon .md-icon {
  color: #ffffff !important;
  font-size: 27px !important;
}

.users-header-text {
  min-width: 0;
  flex: 1;
}

.users-header-label {
  display: block;
  margin-bottom: 3px;
  color: #4338ca;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
}

.users-header-title {
  margin: 0 !important;
  color: #172033;
  font-size: 25px !important;
  font-weight: 800;
}

.users-header-description {
  max-width: 720px;
  margin: 5px 0 0 !important;
  color: #64748b;
  font-size: 16px !important;
  line-height: 1.5;
}

.users-header-button {
  position: relative;
  z-index: 2;
  min-height: 44px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 0 17px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(
    135deg,
    #3730a3,
    #4338ca
  );
  box-shadow: 0 7px 16px rgba(67, 56, 202, 0.23);
  cursor: pointer;
}

.users-header-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  color: #4338ca;
  background: #e0e7ff;
}

.statistic-icon-success {
  color: #16a34a;
  background: #dcfce7;
}

.statistic-icon-warning {
  color: #dc2626;
  background: #fee2e2;
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

.statistic-label {
  margin-top: 5px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
}

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

.records-heading h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
}

.records-heading p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.search-control {
  width: 370px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #f8fafc;
}

.search-control:focus-within {
  border-color: #4338ca;
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.09);
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

.filter-toggle-button,
.refresh-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  color: #4338ca;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #c7d2fe;
  border-radius: 11px;
  background: #eef2ff;
  cursor: pointer;
}

.filter-toggle-button.active {
  color: #ffffff;
  border-color: #4338ca;
  background: #4338ca;
}

.filter-toggle-button .md-icon,
.refresh-button .md-icon {
  color: inherit !important;
  font-size: 21px !important;
}

.filters-panel {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr))
    auto;
  gap: 14px;
  align-items: end;
  padding: 18px 24px;
  background: #f8fafc;
}

.filter-control {
  display: flex;
  flex-direction: column;
}

.filter-control label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
}

.filter-control select {
  height: 46px;
  padding: 0 12px;
  color: #334155;
  font-size: 16px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  background: #ffffff;
}

.clear-filters-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  color: #b91c1c;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  cursor: pointer;
}

.clear-filters-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.records-divider {
  height: 1px;
  background: #e5e7eb;
}

.error-banner {
  display: flex;
  align-items: center;
  margin: 20px;
  padding: 16px;
  color: #991b1b;
  font-size: 16px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
}

.error-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-banner-content div {
  display: flex;
  flex-direction: column;
}

.error-banner-content span {
  margin-top: 4px;
}

.error-banner button {
  margin-left: auto;
  padding: 9px 14px;
  color: #ffffff;
  font-size: 16px;
  border: 0;
  border-radius: 9px;
  background: #dc2626;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.records-table {
  width: 100%;
  min-width: 1250px;
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
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  height: 82px;
  padding: 12px 18px;
  color: #475569;
  font-size: 16px;
  border-bottom: 1px solid #edf2f7;
}

.records-table tbody tr:hover {
  background: #eef2ff;
  box-shadow: inset 4px 0 0 #4338ca;
}

.number-column {
  width: 75px;
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

.user-cell {
  min-width: 230px;
  display: flex;
  align-items: center;
}

.user-avatar,
.details-avatar {
  overflow: hidden;
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
}

.user-avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.user-avatar img,
.details-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-information {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.user-name {
  max-width: 235px;
  overflow: hidden;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-secondary {
  margin-top: 4px;
  color: #64748b;
  font-size: 16px;
}

.user-id-badge,
.role-badge,
.status-badge,
.account-flag {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  border-radius: 9px;
}

.user-id-badge {
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
  margin-right: 7px;
  border-radius: 50%;
  background: currentColor;
}

.account-flag.superuser {
  color: #6d28d9;
  background: #ede9fe;
}

.account-flag.staff {
  color: #0369a1;
  background: #e0f2fe;
}

.account-flag.regular {
  color: #475569;
  background: #f1f5f9;
}

.date-value {
  color: #64748b;
  font-size: 16px;
  white-space: nowrap;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

.view-button {
  color: #4338ca;
  background: #e0e7ff;
}

.edit-button {
  color: #2563eb;
  background: #dbeafe;
}

.delete-button {
  color: #dc2626;
  background: #fee2e2;
}

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
}

.loading-state p,
.empty-state p {
  max-width: 500px;
  margin: 8px 0 18px;
  color: #64748b;
  font-size: 16px;
}

.loading-spinner,
.button-spinner,
.small-spinner,
.inline-spinner {
  display: inline-block;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e7ff;
  border-top-color: #4338ca;
}

.button-spinner {
  width: 19px;
  height: 19px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
}

.small-spinner,
.inline-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #c7d2fe;
  border-top-color: #4338ca;
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
  padding: 0 17px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
}

.empty-primary-button {
  color: #ffffff;
  border: 0;
  background: #4338ca;
}

.empty-secondary-button {
  color: #4338ca;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
}

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
  background: #ffffff;
}

.pagination-button {
  width: 38px;
  height: 38px;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 9px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-button .md-icon {
  color: inherit !important;
  font-size: 23px !important;
}

.pagination-button:disabled {
  color: #cbd5e1;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

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
}

.details-modal,
.account-form-modal {
  width: 100%;
  max-height: calc(100vh - 44px);
  overflow-y: auto;
  border-radius: 21px;
  background: #ffffff;
  box-shadow: 0 32px 85px rgba(15, 23, 42, 0.34);
}

.details-modal {
  max-width: 940px;
}

.account-form-modal {
  max-width: 1120px;
}

.modal-header,
.details-modal-header {
  min-height: 118px;
  display: flex;
  align-items: center;
  padding: 24px 26px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #312e81,
    #3730a3,
    #4338ca
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

.modal-heading h2,
.details-heading h2 {
  margin: 5px 0 4px;
  color: #ffffff;
  font-size: 23px;
}

.modal-heading p,
.details-heading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
}

.modal-close-button {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  padding: 0;
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

.details-profile {
  min-width: 0;
  display: flex;
  flex: 1;
  align-items: center;
}

.details-avatar {
  width: 68px;
  height: 68px;
  margin-right: 16px;
}

.details-heading {
  min-width: 0;
}

.details-modal-body,
.modal-body {
  padding: 26px;
}

.details-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 22px;
}

.details-section {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  background: #ffffff;
}

.details-section h3 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 18px;
  color: #1f2937;
  font-size: 19px;
}

.details-section h3 .md-icon {
  color: #4338ca !important;
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item span {
  color: #64748b;
  font-size: 16px;
}

.detail-item strong {
  margin-top: 5px;
  color: #1f2937;
  font-size: 16px;
}

.details-modal-footer,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 11px;
  padding: 15px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.form-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.form-tab-button {
  min-height: 62px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  padding: 0 15px;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  cursor: pointer;
}

.form-tab-button.active {
  color: #4338ca;
  border-bottom-color: #4338ca;
}

.form-tab-button .md-icon {
  color: inherit !important;
  font-size: 21px !important;
}

.account-form-body {
  min-height: 440px;
}

.form-section h3 {
  margin: 0 0 20px;
  color: #1f2937;
  font-size: 21px;
}

.form-section-heading {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

.form-section-icon {
  width: 50px;
  height: 50px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border-radius: 13px;
  background: #e0e7ff;
}

.form-section-icon .md-icon {
  color: #4338ca !important;
  font-size: 26px !important;
}

.form-section-heading h3 {
  margin: 0;
}

.form-section-heading p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.form-group label span {
  color: #dc2626;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  color: #1f2937;
  font-size: 16px;
  border: 1px solid #d4dce8;
  border-radius: 11px;
  outline: none;
  background: #ffffff;
}

.form-group input,
.form-group select {
  height: 50px;
  padding: 0 13px;
}

.form-group textarea {
  min-height: 125px;
  padding: 13px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4338ca;
  box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.1);
}

.field-error {
  margin-top: 6px;
  color: #dc2626;
  font-size: 16px;
}

.switch-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-top: 22px;
}

.switch-control {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 13px;
  background: #f8fafc;
  cursor: pointer;
}

.switch-control input {
  position: absolute;
  opacity: 0;
}

.switch-slider {
  position: relative;
  width: 48px;
  height: 27px;
  flex-shrink: 0;
  margin-right: 11px;
  border-radius: 20px;
  background: #cbd5e1;
  transition: background-color 0.2s ease;
}

.switch-slider::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.switch-control input:checked + .switch-slider {
  background: #4338ca;
}

.switch-control input:checked + .switch-slider::after {
  transform: translateX(21px);
}

.switch-content {
  display: flex;
  flex-direction: column;
}

.switch-content strong {
  color: #1f2937;
  font-size: 16px;
}

.switch-content small {
  margin-top: 3px;
  color: #64748b;
  font-size: 16px;
}

.performance-summary,
.lookup-loading-message,
.lookup-error-message,
.modal-error {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 14px;
  font-size: 16px;
  border-radius: 11px;
}

.performance-summary {
  color: #3730a3;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
}

.performance-summary-icon {
  margin-right: 11px;
}

.performance-summary-content {
  display: flex;
  flex-direction: column;
}

.performance-summary-content span {
  margin-top: 4px;
}

.lookup-loading-message {
  gap: 10px;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
}

.lookup-error-message,
.modal-error {
  gap: 10px;
  color: #991b1b;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.lookup-error-message button {
  margin-left: auto;
  padding: 8px 13px;
  color: #ffffff;
  font-size: 16px;
  border: 0;
  border-radius: 8px;
  background: #dc2626;
}

.modal-footer {
  justify-content: space-between;
}

.modal-footer-information {
  max-width: 560px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 16px;
}

.modal-footer-information .md-icon {
  color: #4338ca !important;
}

.modal-footer-actions {
  display: flex;
  gap: 10px;
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
  background: #4338ca;
}

.save-button .md-icon {
  color: #ffffff !important;
  font-size: 21px !important;
}

.modal-fade-enter-active,
.modal-fade-leave-active,
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to,
.filter-slide-enter,
.filter-slide-leave-to {
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

@media (max-width: 1200px) {
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

  .filters-panel {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .form-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .users-header,
  .records-toolbar {
    display: block;
  }

  .users-header-button {
    width: 100%;
    justify-content: center;
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

  .filter-toggle-button,
  .refresh-button {
    flex: 1;
    justify-content: center;
  }

  .filters-panel,
  .form-grid,
  .switch-grid,
  .details-grid {
    grid-template-columns: 1fr;
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

  .modal-footer {
    display: block;
  }

  .modal-footer-information {
    margin-bottom: 13px;
  }

  .modal-footer-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 575px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .details-modal,
  .account-form-modal {
    max-height: 95vh;
    border-radius: 21px 21px 0 0;
  }

  .modal-header,
  .details-modal-header {
    padding: 21px 17px;
  }

  .details-modal-body,
  .modal-body {
    padding: 20px 17px;
  }

  .form-tab-button {
    padding: 0 12px;
  }

  .modal-footer-information {
    display: none;
  }

  .modal-footer-actions {
    width: 100%;
  }
}
</style>