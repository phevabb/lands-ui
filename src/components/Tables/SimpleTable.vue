
<script setup>
import { defineProps, defineEmits } from "vue";
import Pagination from "../Pagination.vue";
import { all_users_to_excel } from "../../services/api";
import * as XLSX from "xlsx"; // Import xlsx for Excel export
import { ref } from "vue"
const loading = ref(false)



const props = defineProps({
  tableHeaderColor: {
    type: String,
    default: "",
  },
  next: {
    type: String,
    default: "iik",
  },
  previous: {
    type: String,
    default: "fatts",
  },
  totalPages: {
    type: Number,
    required: true,
    default: 4,
  },
  currentPage: {
    type: Number,
    required: true,
    default: 2,
  },
  rows: {
    type: Array,
    default: () => [
      {
        staff_id: "1111",
        full_name: "None None",
        phone: null,
        staff_category: "JUNIOR STAFF",
      },
      {
        staff_id: "1293399",
        full_name: "Rachel Korang",
        phone: null,
        staff_category: null,
      },
      {
        staff_id: "892652",
        full_name: "Joyce Oppong",
        phone: null,
        staff_category: null,
      },
    ],
  },
});

const visibleEntries = (item) => {
  // Define professional label mappings
  const labelMap = {
    full_name: "Full Name",
    phone_number: "Contact",
    user_id: "Staff ID",
    email: "E-mail",
  };

  // Filter out unwanted columns and apply professional labels
  return Object.entries(item)
    .filter(([key]) => !["id", "title", 
    "first_name", 
    "last_name", 
    "management_unit_cost_centre", 
    "category",
    "district",
    "region",
    "middle_name",
    "role",
    "maiden_name",
    "gender",
    "date_of_birth",
    "age",
    "marital_status",
    "directorate",
    "professional",
"current_salary_level",
"current_salary_point",
"next_salary_level",
"date_of_first_appointment",
"date_of_assumption_of_duty",
"date_of_last_promotion",
"substantive_date",
"national_effective_date",
"years_on_current_grade",
"number_of_years_in_service",
"fulltime_contract_staff",
"academic_qualification",
"professional_qualification",
"staff_category",
"single_spine_monthly_salary",
"monthly_gross_pay",
"annual_salary",
"date_of_retirement",
"number_of_focus_areas",
"number_of_targets",
"number_of_targets_met",
"number_of_targets_not_met",
"overall_assessment_score",
"self_assessment_description",
"ghana_card_number",
"social_security_number",
"national_health_insurance_number",
"bank_name",
"bank_account_number",
"bank_account_branch",
"payroll_status",
"at_post_on_leave",
"on_leave_type",
"accommodation_status",
"supervisor_name",
"current_grade",
"next_grade",
"change_of_grade",

  
  ].includes(key))
    .map(([key, value]) => [key, value ?? "N/A", labelMap[key] || key]);
};

const emit = defineEmits(["user-selected", "page-changed", "export-error"]);

const selectUser = (item) => {
  // Use staff_id instead of item.id, as id doesn't exist in the data
  emit("user-selected", item.id);
};

const exportExcel = async () => {
  try {
    loading.value = true // start loading
    // Call your API
    const res = await all_users_to_excel()
    const exportData = res.data   // <-- JSON array from backend
    console.log("the res:", res)

    if (!Array.isArray(exportData) || exportData.length === 0) {
      console.warn("No data available to export")
      return
    }

    // Convert JSON array to Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "StaffData")

    // Download as Excel file
    XLSX.writeFile(workbook, "staff_data.xlsx")
  } catch (error) {
    console.error("Export failed:", error)
    emit("export-error", "Failed to export data to Excel")
  } finally {
    loading.value = false // stop loading
}}
</script>

<template>
  <div>
    <md-button
  class="md-dense md-primary"
  @click="exportExcel"
  :disabled="loading"
  style="padding: 6px 12px; font-size: 13px; min-width: 120px; margin-bottom: 16px;"
>
  <md-icon v-if="!loading" style="font-size: 16px; margin-right: 6px;">download</md-icon>
  <md-icon v-else style="font-size: 16px; margin-right: 6px;">hourglass_top</md-icon>
  {{ loading ? "Exporting..." : "Export" }}
</md-button>

    <md-table :value="rows" :table-header-color="tableHeaderColor">
      <template #md-table-row="{ item }">
        <md-table-row @click="selectUser(item)" style="cursor: pointer;">
          <md-table-cell
            v-for="[key, value, label] in visibleEntries(item)"
            :key="key"
            :md-label="label || key"
          >
            {{ value }}
          </md-table-cell>
        </md-table-row>
      </template>
    </md-table>
    <pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-changed="(page) => emit('page-changed', page)"
    />
  </div>
</template>

<style scoped>
/* Ensure layout stability */
.md-table {
  width: 100%;
  margin-bottom: 16px;
}

.md-button {
  margin-bottom: 16px;
}
</style>
