<template>
  <v-container fluid>
    <v-card outlined>
      <v-card-title class="d-flex align-center">
        <v-icon left color="primary">
          mdi-database-cog
        </v-icon>

        Lookup Tables

        <v-spacer />

        <v-btn
          color="primary"
          :disabled="loading"
          @click="openCreateDialog"
        >
          <v-icon left>
            mdi-plus
          </v-icon>

          Add {{ selectedResource.singular }}
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="selectedResourceKey"
              :items="resources"
              item-text="label"
              item-value="key"
              label="Select lookup table"
              outlined
              dense
              hide-details
              prepend-inner-icon="mdi-table"
              @change="handleResourceChange"
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="search"
              label="Search"
              outlined
              dense
              clearable
              hide-details
              prepend-inner-icon="mdi-magnify"
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
            class="d-flex justify-end align-center"
          >
            <v-btn
              text
              color="primary"
              :loading="loading"
              @click="loadItems"
            >
              <v-icon left>
                mdi-refresh
              </v-icon>

              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="items"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        loading-text="Loading records..."
        no-data-text="No records found"
        class="elevation-0"
      >
        <template v-slot:[`item.index`]="{ index }">
          {{ index + 1 }}
        </template>

        <template v-slot:[`item.value`]= "{ item }">
          <span class="font-weight-medium">
            {{ getItemValue(item) }}
          </span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon
            small
            color="primary"
            title="Edit"
            @click="openEditDialog(item)"
          >
            <v-icon small>
              mdi-pencil
            </v-icon>
          </v-btn>

          <v-btn
            icon
            small
            color="error"
            title="Delete"
            @click="deleteItem(item)"
          >
            <v-icon small>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit dialog -->
    <v-dialog
      v-model="dialog"
      max-width="550"
      persistent
    >
      <v-card>
        <v-card-title>
          <v-icon
            left
            :color="editingId ? 'warning' : 'primary'"
          >
            {{ editingId ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>

          {{ dialogTitle }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
          <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @submit.prevent="saveItem"
          >
            <v-text-field
              v-model="form.value"
              :label="selectedResource.fieldLabel"
              :rules="valueRules"
              :counter="selectedResource.maxLength"
              outlined
              autofocus
              :disabled="saving"
              @keyup.enter="saveItem"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn
            text
            :disabled="saving"
            @click="closeDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            :loading="saving"
            :disabled="saving"
            @click="saveItem"
          >
            <v-icon left>
              mdi-content-save
            </v-icon>

            {{ editingId ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      top
      right
    >
      {{ snackbar.message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

// Production API
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "https://api.stoollands.com/api";

// Local/testing API
// const API_BASE_URL = "http://127.0.0.1:8888/api";

export default {
  name: "LookupTables",

  data() {
    return {
      loading: false,
      saving: false,
      dialog: false,
      formValid: false,
      editingId: null,
      search: "",

      selectedResourceKey: "regions",

      items: [],

      form: {
        value: ""
      },

      snackbar: {
        show: false,
        message: "",
        color: "error"
      },

      headers: [
        {
          text: "#",
          value: "index",
          sortable: false,
          width: "80px"
        },
        {
          text: "Name",
          value: "value"
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
          align: "end",
          width: "140px"
        }
      ],

      resources: [
        {
          key: "regions",
          label: "Regions",
          singular: "Region",
          endpoint: "/regions",
          field: "region",
          fieldLabel: "Region",
          maxLength: 120
        },
        {
          key: "districts",
          label: "Districts",
          singular: "District",
          endpoint: "/districts",
          field: "district",
          fieldLabel: "District",
          maxLength: 120
        },
        {
          key: "titles",
          label: "Titles",
          singular: "Title",
          endpoint: "/titles",
          field: "title",
          fieldLabel: "Title",
          maxLength: 20
        },
        {
          key: "academic-qualifications",
          label: "Academic Qualifications",
          singular: "Academic Qualification",
          endpoint: "/academic-qualifications",
          field: "name",
          fieldLabel: "Qualification",
          maxLength: 100
        },
        {
          key: "on-leave-types",
          label: "Leave Types",
          singular: "Leave Type",
          endpoint: "/on-leave-types",
          field: "name",
          fieldLabel: "Leave Type",
          maxLength: 100
        },
        {
          key: "staff-classes",
          label: "Staff Classes",
          singular: "Staff Class",
          endpoint: "/staff-classes",
          field: "name",
          fieldLabel: "Staff Class",
          maxLength: 120
        },
        {
          key: "positions",
          label: "Positions",
          singular: "Position",
          endpoint: "/positions",
          field: "name",
          fieldLabel: "Position",
          maxLength: 150
        }
      ]
    };
  },

  computed: {
    selectedResource() {
      return (
        this.resources.find(
          resource => resource.key === this.selectedResourceKey
        ) || this.resources[0]
      );
    },

    dialogTitle() {
      if (this.editingId) {
        return `Edit ${this.selectedResource.singular}`;
      }

      return `Add ${this.selectedResource.singular}`;
    },

    valueRules() {
      return [
        value => {
          if (!value || !value.trim()) {
            return `${this.selectedResource.fieldLabel} is required`;
          }

          return true;
        },

        value => {
          if (
            value &&
            value.trim().length > this.selectedResource.maxLength
          ) {
            return `${this.selectedResource.fieldLabel} cannot exceed ${this.selectedResource.maxLength} characters`;
          }

          return true;
        }
      ];
    }
  },

  created() {
    this.loadItems();
  },

  methods: {
    async loadItems() {
      this.loading = true;

      try {
        const response = await axios.get(
          `${API_BASE_URL}${this.selectedResource.endpoint}`
        );

        this.items = Array.isArray(response.data)
          ? response.data
          : [];
      } catch (error) {
        this.items = [];

        this.showError(
          this.getErrorMessage(
            error,
            `Unable to load ${this.selectedResource.label.toLowerCase()}`
          )
        );
      } finally {
        this.loading = false;
      }
    },

    handleResourceChange() {
      this.search = "";
      this.items = [];
      this.resetForm();
      this.loadItems();
    },

    getItemValue(item) {
      return item[this.selectedResource.field] || "";
    },

    openCreateDialog() {
      this.resetForm();
      this.dialog = true;

      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      });
    },

    openEditDialog(item) {
      this.editingId = item.id;
      this.form.value = this.getItemValue(item);
      this.dialog = true;

      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      });
    },

    closeDialog() {
      if (this.saving) {
        return;
      }

      this.dialog = false;
      this.resetForm();
    },

    resetForm() {
      this.editingId = null;
      this.form.value = "";
      this.formValid = false;

      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async saveItem() {
      if (!this.$refs.form) {
        return;
      }

      const valid = this.$refs.form.validate();

      if (!valid) {
        return;
      }

      this.saving = true;

      const payload = {
        [this.selectedResource.field]: this.form.value.trim()
      };

      try {
        if (this.editingId) {
          await axios.put(
            `${API_BASE_URL}${this.selectedResource.endpoint}/${this.editingId}`,
            payload
          );

          this.showSuccess(
            `${this.selectedResource.singular} updated successfully`
          );
        } else {
          await axios.post(
            `${API_BASE_URL}${this.selectedResource.endpoint}`,
            payload
          );

          this.showSuccess(
            `${this.selectedResource.singular} created successfully`
          );
        }

        this.dialog = false;
        this.resetForm();

        await this.loadItems();
      } catch (error) {
        this.showError(
          this.getErrorMessage(
            error,
            `Unable to save ${this.selectedResource.singular.toLowerCase()}`
          )
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteItem(item) {
      const value = this.getItemValue(item);

      const result = await Swal.fire({
        title: `Delete ${this.selectedResource.singular}?`,
        text: `Are you sure you want to delete "${value}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#757575",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        await axios.delete(
          `${API_BASE_URL}${this.selectedResource.endpoint}/${item.id}`
        );

        await Swal.fire({
          title: "Deleted",
          text: `${this.selectedResource.singular} deleted successfully`,
          icon: "success",
          confirmButtonColor: "#1976d2"
        });

        await this.loadItems();
      } catch (error) {
        this.showError(
          this.getErrorMessage(
            error,
            `Unable to delete ${this.selectedResource.singular.toLowerCase()}`
          )
        );
      }
    },

    getErrorMessage(error, fallbackMessage) {
      if (!error.response) {
        return "Unable to connect to the server";
      }

      const responseData = error.response.data;

      if (typeof responseData === "string" && responseData.trim()) {
        return responseData;
      }

      if (responseData && responseData.message) {
        return responseData.message;
      }

      if (error.response.status === 409) {
        return `${this.selectedResource.singular} already exists`;
      }

      if (error.response.status === 404) {
        return `${this.selectedResource.singular} not found`;
      }

      if (error.response.status === 400) {
        return "Please check the submitted information";
      }

      return fallbackMessage;
    },

    showSuccess(message) {
      this.snackbar = {
        show: true,
        message,
        color: "success"
      };
    },

    showError(message) {
      this.snackbar = {
        show: true,
        message,
        color: "error"
      };
    }
  }
};

</script>

<style scoped>
/* =========================================================
   PAGE
   ========================================================= */

.lookup-page {
  min-height: 100%;
  padding: 8px;
}

.v-container {
  max-width: 1600px;
}

.lookup-card {
  overflow: hidden;
  border: 1px solid #e5e7eb !important;
  border-radius: 22px !important;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08) !important;
}

/* =========================================================
   CARD HEADER
   ========================================================= */

.lookup-header {
  position: relative;
  min-height: 110px;
  display: flex;
  align-items: center;
  padding: 26px 30px !important;
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 20%,
      rgba(255, 255, 255, 0.2),
      transparent 24%
    ),
    linear-gradient(
      135deg,
      #1d4ed8 0%,
      #4f46e5 54%,
      #7c3aed 100%
    );
}

.lookup-header::before {
  content: "";
  position: absolute;
  top: -65px;
  right: 130px;
  width: 160px;
  height: 160px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
}

.lookup-header::after {
  content: "";
  position: absolute;
  right: -50px;
  bottom: -90px;
  width: 210px;
  height: 210px;
  border: 36px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

.lookup-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  min-width: 0;
}

.lookup-header-icon {
  min-width: 58px;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow:
    0 12px 25px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
}

.lookup-header-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.2px;
}

.lookup-header-subtitle {
  max-width: 600px;
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
}

.add-record-button {
  position: relative;
  z-index: 2;
  min-height: 46px !important;
  padding: 0 21px !important;
  color: #1d4ed8 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  border-radius: 13px !important;
  background: #ffffff !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2) !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.add-record-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.25) !important;
}

/* =========================================================
   FILTER AREA
   ========================================================= */

.lookup-filter-area {
  padding: 24px 28px !important;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f8fafc 100%
    );
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.25px;
}

.filter-control {
  border-radius: 12px;
}

::v-deep .filter-control .v-input__slot {
  min-height: 46px !important;
  margin-bottom: 0 !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.035);
}

::v-deep .filter-control fieldset {
  border-color: #dbe3ee !important;
  transition: border-color 0.2s ease;
}

::v-deep .filter-control:hover fieldset {
  border-color: #93c5fd !important;
}

::v-deep .filter-control.v-input--is-focused fieldset {
  border-color: #2563eb !important;
  border-width: 1px !important;
}

::v-deep .filter-control input,
::v-deep .filter-control .v-select__selection {
  color: #1f2937;
  font-size: 12px;
  font-weight: 500;
}

::v-deep .filter-control .v-icon {
  color: #64748b;
}

.refresh-button {
  min-height: 44px !important;
  padding: 0 18px !important;
  color: #2563eb !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  border: 1px solid #dbeafe;
  border-radius: 12px !important;
  background: #eff6ff;
}

.refresh-button:hover {
  background: #dbeafe !important;
}

/* =========================================================
   RESOURCE SUMMARY
   ========================================================= */

.resource-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 28px;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
  background: #ffffff;
}

.resource-summary-left {
  display: flex;
  align-items: center;
}

.resource-summary-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  border-radius: 11px;
  background: #eff6ff;
}

.resource-summary-title {
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
}

.resource-summary-subtitle {
  margin-top: 3px;
  color: #9ca3af;
  font-size: 10px;
}

.record-count-chip {
  font-size: 10px !important;
  font-weight: 700 !important;
}

/* =========================================================
   DATA TABLE
   ========================================================= */

.lookup-table {
  border-radius: 0 0 22px 22px;
}

::v-deep .lookup-table .v-data-table__wrapper {
  overflow-x: auto;
}

::v-deep .lookup-table table {
  border-collapse: separate;
  border-spacing: 0;
}

::v-deep .lookup-table thead tr {
  height: 54px;
  background: #f8fafc;
}

::v-deep .lookup-table thead th {
  color: #64748b !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 0.65px;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb !important;
}

::v-deep .lookup-table tbody tr {
  height: 66px;
  background: #ffffff;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

::v-deep .lookup-table tbody tr:nth-child(even) {
  background: #fbfdff;
}

::v-deep .lookup-table tbody tr:hover {
  background: #eff6ff !important;
  box-shadow: inset 4px 0 0 #2563eb;
}

::v-deep .lookup-table tbody td {
  color: #334155;
  font-size: 12px;
  border-bottom: 1px solid #edf2f7 !important;
}

::v-deep .lookup-table .v-data-footer {
  min-height: 62px;
  padding: 8px 18px;
  border-top: 0;
  background: #f8fafc;
}

::v-deep .lookup-table .v-data-footer__select {
  color: #64748b;
  font-size: 11px;
}

.index-badge {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid #bfdbfe;
  border-radius: 9px;
  background: #eff6ff;
}

.value-cell {
  display: flex;
  align-items: center;
}

.value-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 11px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    #eef2ff,
    #eff6ff
  );
}

.value-text {
  color: #1e3a8a;
  font-size: 12px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
}

.edit-action-button,
.delete-action-button {
  width: 34px !important;
  height: 34px !important;
  border-radius: 10px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.edit-action-button {
  color: #2563eb !important;
  background: #dbeafe !important;
}

.delete-action-button {
  color: #dc2626 !important;
  background: #fee2e2 !important;
}

.edit-action-button:hover,
.delete-action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 15px rgba(15, 23, 42, 0.12);
}

/* =========================================================
   LOADING AND EMPTY STATES
   ========================================================= */

::v-deep .lookup-table .v-data-table__progress th {
  padding: 0 !important;
}

::v-deep .lookup-table .v-progress-linear {
  height: 3px !important;
}

::v-deep .lookup-table .v-data-table__empty-wrapper td {
  height: 260px;
  color: #9ca3af;
  font-size: 12px;
}

.empty-resource-state {
  padding: 56px 20px;
  text-align: center;
}

.empty-resource-icon {
  width: 76px;
  height: 76px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background: #f1f5f9;
}

.empty-resource-title {
  margin-top: 16px;
  color: #475569;
  font-size: 15px;
  font-weight: 700;
}

.empty-resource-description {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 11px;
}

/* =========================================================
   ADD/EDIT DIALOG
   ========================================================= */

::v-deep .lookup-dialog {
  overflow: hidden;
  border-radius: 20px !important;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.25) !important;
}

.dialog-header {
  position: relative;
  min-height: 90px;
  display: flex;
  align-items: center;
  padding: 20px 24px !important;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    #1d4ed8,
    #4f46e5,
    #7c3aed
  );
}

.dialog-header::after {
  content: "";
  position: absolute;
  top: -60px;
  right: -30px;
  width: 150px;
  height: 150px;
  border: 28px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.dialog-header-icon {
  position: relative;
  z-index: 2;
  min-width: 48px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 13px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
}

.dialog-header-content {
  position: relative;
  z-index: 2;
}

.dialog-title {
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.dialog-subtitle {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.74);
  font-size: 10px;
  font-weight: 400;
}

.dialog-close-button {
  position: relative;
  z-index: 2;
  color: #ffffff !important;
}

.dialog-body {
  padding: 28px 26px 18px !important;
  background: #ffffff;
}

.dialog-field-label {
  display: block;
  margin-bottom: 9px;
  color: #374151;
  font-size: 11px;
  font-weight: 700;
}

::v-deep .dialog-input .v-input__slot {
  min-height: 52px !important;
  border-radius: 13px !important;
}

::v-deep .dialog-input fieldset {
  border-color: #dbe3ee !important;
}

::v-deep .dialog-input:hover fieldset {
  border-color: #93c5fd !important;
}

::v-deep .dialog-input.v-input--is-focused fieldset {
  border-color: #2563eb !important;
  border-width: 1px !important;
}

::v-deep .dialog-input input {
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
}

.dialog-hint {
  display: flex;
  align-items: flex-start;
  margin-top: 4px;
  padding: 11px 13px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.5;
  border: 1px solid #e0e7ff;
  border-radius: 10px;
  background: #f5f7ff;
}

.dialog-actions {
  padding: 15px 22px 20px !important;
  background: #f8fafc;
}

.cancel-button,
.save-button {
  min-height: 42px !important;
  padding: 0 19px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  border-radius: 11px !important;
}

.cancel-button {
  color: #64748b !important;
}

.save-button {
  background: linear-gradient(
    135deg,
    #2563eb,
    #4f46e5
  ) !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25) !important;
}

/* =========================================================
   SNACKBAR
   ========================================================= */

::v-deep .premium-snackbar .v-snack__wrapper {
  overflow: hidden;
  border-radius: 13px !important;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.2) !important;
}

.snackbar-content {
  display: flex;
  align-items: center;
}

.snackbar-icon {
  margin-right: 10px;
}

/* =========================================================
   DARK MODE
   ========================================================= */

::v-deep .theme--dark .lookup-card {
  border-color: #334155 !important;
  background: #111827 !important;
}

::v-deep .theme--dark .lookup-filter-area,
::v-deep .theme--dark .resource-summary {
  border-color: #334155;
  background: #111827;
}

::v-deep .theme--dark .filter-label,
::v-deep .theme--dark .resource-summary-title {
  color: #e5e7eb;
}

::v-deep .theme--dark .filter-control .v-input__slot {
  background: #1e293b !important;
}

::v-deep .theme--dark .filter-control fieldset {
  border-color: #475569 !important;
}

::v-deep .theme--dark .filter-control input,
::v-deep .theme--dark .filter-control .v-select__selection {
  color: #f8fafc;
}

::v-deep .theme--dark .lookup-table thead tr,
::v-deep .theme--dark .lookup-table .v-data-footer {
  background: #1e293b;
}

::v-deep .theme--dark .lookup-table tbody tr,
::v-deep .theme--dark .lookup-table tbody tr:nth-child(even) {
  background: #111827;
}

::v-deep .theme--dark .lookup-table tbody tr:hover {
  background: #1e293b !important;
}

::v-deep .theme--dark .lookup-table tbody td {
  color: #cbd5e1;
  border-color: #334155 !important;
}

::v-deep .theme--dark .lookup-dialog,
::v-deep .theme--dark .dialog-body,
::v-deep .theme--dark .dialog-actions {
  background: #111827 !important;
}

::v-deep .theme--dark .dialog-field-label {
  color: #e5e7eb;
}

::v-deep .theme--dark .dialog-hint {
  color: #94a3b8;
  border-color: #334155;
  background: #1e293b;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 960px) {
  .lookup-header {
    min-height: 100px;
    padding: 22px !important;
  }

  .lookup-filter-area {
    padding: 20px !important;
  }

  .resource-summary {
    padding: 14px 20px;
  }
}

@media (max-width: 600px) {
  .v-container {
    padding: 8px !important;
  }

  .lookup-card {
    border-radius: 16px !important;
  }

  .lookup-header {
    min-height: auto;
    display: block;
    padding: 21px 17px !important;
  }

  .lookup-header-content {
    margin-bottom: 18px;
  }

  .lookup-header-icon {
    min-width: 48px;
    width: 48px;
    height: 48px;
  }

  .lookup-header-title {
    font-size: 18px;
  }

  .lookup-header-subtitle {
    font-size: 10px;
  }

  .add-record-button {
    width: 100%;
  }

  .lookup-filter-area {
    padding: 16px !important;
  }

  .refresh-button {
    width: 100%;
  }

  .resource-summary {
    display: block;
    padding: 13px 16px;
  }

  .record-count-chip {
    margin-top: 12px;
  }

  ::v-deep .lookup-table thead th {
    font-size: 9px !important;
  }

  ::v-deep .lookup-table tbody td {
    font-size: 11px;
  }

  .value-icon {
    display: none;
  }

  .dialog-header {
    min-height: 80px;
    padding: 17px !important;
  }

  .dialog-body {
    padding: 23px 18px 14px !important;
  }

  .dialog-actions {
    padding: 13px 15px 17px !important;
  }
}
</style>