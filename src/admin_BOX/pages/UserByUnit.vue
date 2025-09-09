<script setup>
import { ref, onMounted, computed } from "vue";
import * as XLSX from "xlsx";
import { useRoute, useRouter } from "vue-router/composables";
import { saveAs } from "file-saver";
import { users_per_department } from "../../services/api";
import Pagination from "../../components/Pagination.vue"; 

import api from "../../services/api";
import { DEFAULT_AVATAR } from "../../services/api";


const route = useRoute();
const router = useRouter()
const users = ref([]);
const dept = ref("");
const searchQuery = ref("");
const selectedRow = ref(null);
const staffid = ref("");
const isLoading = ref(true);
const loading = ref(false)
const errorMessage = ref("");
const totalCount = ref(0);
const next = ref("")
const previous = ref("")
const totalPages = ref(1);       // default to 1 page
const currentPage = ref(1);      // start at page 1
const page_size = 10



async function fetchUsers(page = 1) {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await users_per_department(dept.value, { page, page_size });


    totalCount.value = response.data.count;

    users.value = response.data.results.users || [];

    totalPages.value = Math.ceil(response.data.count / page_size);
    currentPage.value = getCurrentPageFromUrl(
      response.data.next,
      response.data.previous,
      response.data.count,
      page_size
    );
    next.value = response.data.next;
    previous.value = response.data.previous;
  } catch (err) {
    console.error(err);
    if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
  } finally {
    isLoading.value = false;
  }
}


const getProfilePictureSrc = (profilePicture) => {
  if (profilePicture && profilePicture !== '-') {
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `${api.defaults.baseURL}${profilePicture.replace(/^\/+/, '')}`;
  }
  return DEFAULT_AVATAR;
};

const showingRange = computed(() => {
  if (totalCount.value === 0) return `Showing 0 of 0`;

  const start = (currentPage.value - 1) * page_size + 1;
  const end = Math.min(currentPage.value * page_size, totalCount.value);
  return `Showing ${start}–${end} of ${totalCount.value}`;
});



function getCurrentPageFromUrl(next, previous, count, pageSize = 10) {
  try {
    // Case: only one page
    if (!previous && !next) return 1;

    // Extract page numbers from URLs if available
    const nextPage = next ? parseInt(new URL(next, window.location.origin).searchParams.get("page")) : null;
    const prevPage = previous ? parseInt(new URL(previous, window.location.origin).searchParams.get("page")) : null;

    // First page
    if (!previous) return nextPage ? nextPage - 1 : 1;

    // Last page
    if (!next) {
      const totalPages = Math.ceil(count / pageSize);
      return totalPages;
    }

    // Middle pages
    if (nextPage !== null && prevPage !== null) {
      if (nextPage - prevPage === 2) return prevPage + 1; // handle 2-page edge case
      return nextPage - 1; // normal case
    }

    return 1; // fallback
  } catch (e) {
    console.warn("getCurrentPageFromUrl failed:", { next, previous, count, pageSize }, e);
    return 1;
  }
}

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const deptName = route.query.dept;
    if (deptName) {
      const res = await users_per_department(deptName);


      totalPages.value = Math.ceil(res.data.count / page_size);
      next.value = res.data.next;
      previous.value = res.data.previous;
      currentPage.value = getCurrentPageFromUrl(
        res.data.next,
        res.data.previous,
        res.data.count,
        page_size
      );


      users.value = res.data.results.users;
      dept.value = res.data.results.dept;
    }
  } catch (err) {
    console.error("Error fetching users per department:", err);
    if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
  } finally {
    isLoading.value = false;
  }
});

// function to check loading state
const checkLoading = () => isLoading.value


function selectRow(staff) {
  selectedRow.value = staff;
  staffid.value = staff.id;
  router.push({ name: "Staff Details", params: { id: staff.id } });
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(users.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Staff");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `${dept.value}.xlsx`);

}
</script>

<template>
  <div class="premium-container">
    <div class="premium-header">
      <div class="premium-title">
        <i class="material-icons">{{ dept }}</i>
      </div>
    </div>

    <div class="table-footer">
      

      <!-- Modern Export Button -->
    


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




      
    </div>

    <div class="table-container">
      <!-- Show loader while fetching -->
      <div v-if="checkLoading()" class="loading-message">
        Loading users...
      </div>

      <!-- Error message -->
      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Show table after loading -->
      <table v-else class="premium-table">
  <thead>
    <tr>
      <th>picture</th>
      <th>Staff ID</th>
      <th>Full Name</th>
      <th>Contact</th>
      <th>Supervisor's Name</th>
    </tr>
  </thead>
  <tbody>
    <tr
      v-for="staff in users.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )"
      :key="staff.id"
      @click="selectRow(staff)"
      :class="{ 'row-selected': selectedRow?.id === staff.id }"
    >
      <img
        :src="getProfilePictureSrc(staff.profile_picture)"
        :alt="staff.full_name || 'Profile Image'"
        class="profile-image"
      />
      <td>{{ staff.user_id }}</td>
      <td>{{ staff.full_name }}</td>
      <td>{{ staff.phone_number }}</td>
      <td>{{ staff.supervisor_name }}</td>
    </tr>
  </tbody>
</table>

<!-- Pagination + Range -->
<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
  <pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    @page-changed="page => fetchUsers(page)"
  ></pagination>

  <div style="font-size: 14px; color: #7f8c8d;">
    {{ showingRange }}
  </div>
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

        .export-btn-wrapper {
  display: inline-block;
  position: relative;
}

.export-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.profile-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.export-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.export-btn i {
  font-size: 18px;
}

.tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.3s ease;
  width: max-content;
}

.export-btn:hover + .tooltip {
  opacity: 1;
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
        .error-message {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
}
.loading-message {
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
  margin: 1rem 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
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
