<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import { useRoute, useRouter } from "vue-router/composables";
import { saveAs } from "file-saver";
import { users_per_department } from "../../services/api";

const route = useRoute();
const users = ref([]);
const dept = ref('');
const router = useRouter()


onMounted(() => {
  const deptName = route.query.dept;
  if (deptName) {
    users_per_department(deptName)
      .then((res) => {
        users.value = res.data.users;
        dept.value = res.data.dept


              })
      .catch((err) => {
        
      });
  }
});

const staffData = ref([
  { id: "1111", name: "None None", contact: "N/A", category: "JUNIOR STAFF", status: "Active" },
  { id: "1293399", name: "Rachel Korang", contact: "N/A", category: "N/A", status: "Active" },
  { id: "892652", name: "Joyce Oppong", contact: "N/A", category: "N/A", status: "Inactive" },
  { id: "782341", name: "Michael Johnson", contact: "+1 (555) 123-4567", category: "SENIOR STAFF", status: "Active" },
  { id: "562891", name: "Sarah Williams", contact: "+1 (555) 987-6543", category: "MANAGEMENT", status: "Active" },
]);

const searchQuery = ref("");
const selectedRow = ref(null);
const staffid =ref("")
const currentPage = ref(1);
const pageSize = 5;

const filteredStaff = computed(() => {
  return staffData.value.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredStaff.value.length / pageSize));

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredStaff.value.slice(start, start + pageSize);
});

function selectRow(staff) {
  selectedRow.value = staff;
  staffid.value = staff.id;
    router.push({ name: "Staff Details", params: { id: staff.id } });
  
}

function changePage(page) {
  currentPage.value = page;
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(staffData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Staff");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, "StaffDirectory.xlsx");
}
</script>

<template>
  <div class="premium-container">
    <div class="premium-header">
      <div class="premium-title">
        <i class="material-icons">{{dept}}</i>
        
      </div>
      
    </div>

    <div class="table-footer">
      <div class="rows-info">
        Showing {{ paginatedStaff.length }} of {{ filteredStaff.length }} staff members
      </div>
      <div class="search-box">
        <i class="material-icons">search</i>
        <input type="text" v-model="searchQuery" placeholder="Search staff members..." />
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Full Name</th>
            <th>Contact</th>
            <th>Supervisor's Name</th>
            
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="staff in users"
            :key="staff.id"
            @click="selectRow(staff)"
            :class="{ 'row-selected': selectedRow?.id === staff.id }"
          >
            <td>{{ staff.user_id }}</td>
            <td>{{ staff.full_name }}</td>
            <td>{{ staff.phone_number }}</td>
            <td>{{ staff.supervisor_name }}</td>
            
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <div class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</div>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="material-icons">chevron_left</i>
          Previous
        </button>

        <div class="page-numbers">
          <div
            v-for="page in totalPages"
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </div>
        </div>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          Next
          <i class="material-icons">chevron_right</i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

* {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            color: #334155;
        }
        
        .premium-container {
            width: 100%;
            max-width: 1400px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        .premium-header {
            padding: 24px 32px;
            background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .premium-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .premium-title i {
            font-size: 2rem;
        }
        
        .export-btn {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
        }
        
        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
        }
        
        .export-btn:disabled {
            background: linear-gradient(90deg, #94a3b8 0%, #64748b 100%);
            cursor: not-allowed;
            transform: none;
        }
        
        .table-container {
            overflow-x: auto;
            padding: 0 20px;
        }
        
        .premium-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 24px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .premium-table thead {
            background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
        }
        
        .premium-table th {
            padding: 18px 16px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .premium-table th:not(:last-child)::after {
            content: "";
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 60%;
            width: 1px;
            background: #cbd5e1;
        }
        
        .premium-table tbody tr {
            background: white;
            transition: all 0.3s ease;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .premium-table tbody tr:last-child {
            border-bottom: none;
        }
        
        .premium-table tbody tr:hover {
            background: #83acd4;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .premium-table td {
            padding: 16px;
            color: #334155;
            font-size: 0.95rem;
            position: relative;
        }
        
        .premium-table tbody tr {
            cursor: pointer;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-active {
            background: rgba(16, 185, 129, 0.15);
            color: #059669;
        }
        
        .status-inactive {
            background: rgba(239, 68, 68, 0.15);
            color: #dc2626;
        }
        
        .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 32px;
            border-top: 1px solid #e2e8f0;
        }
        
        .pagination-info {
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .pagination-controls {
            display: flex;
            gap: 12px;
        }
        
        .pagination-btn {
            background: white;
            color: #334155;
            border: 1px solid #cbd5e1;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .pagination-btn:hover {
            background: #f1f5f9;
            border-color: #94a3b8;
        }
        
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .page-numbers {
            display: flex;
            gap: 8px;
            align-items: center;
            margin: 0 12px;
        }
        
        .page-number {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
            background: white;
            border: 1px solid #e2e8f0;
        }
        
        .page-number:hover {
            background: #f1f5f9;
        }
        
        .page-number.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
            border-radius: 20px;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 5px solid #3b82f6;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .table-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 32px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        
        .rows-info {
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .search-box {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 16px;
            width: 300px;
        }
        
        .search-box i {
            color: #94a3b8;
            margin-right: 8px;
        }
        
        .search-box input {
            border: none;
            outline: none;
            width: 100%;
            background: transparent;
            color: #334155;
        }
        
        @media (max-width: 768px) {
            .premium-header {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }
            
            .pagination {
                flex-direction: column;
                gap: 16px;
            }
            
            .premium-table {
                min-width: 800px;
            }
            
            .table-footer {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }
            
            .search-box {
                width: 100%;
            }
        }


</style>
