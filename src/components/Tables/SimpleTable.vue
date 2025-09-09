<template>
  <div class="table-container">
    <!-- Search and Export Header -->
    <div class="table-header">
      <div class="search-container">
        <span class="material-icons search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Staff ID or Name..."
          class="search-input"
          aria-label="Search staff by ID or name"
        />
        <button
          v-if="searchQuery"
          class="clear-btn"
          @click="clearSearch"
          aria-label="Clear search"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
      <button
        class="export-btn"
        @click="exportExcel"
        :disabled="loading"
        aria-label="Export to Excel"
      >
        <span class="material-icons" style="font-size: 16px; margin-right: 6px;">
          {{ loading ? 'hourglass_top' : 'download' }}
        </span>
        {{ loading ? 'Exporting...' : 'Export' }}
      </button>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Profile Picture</th>
            <th>Staff ID</th>
            <th>Full Name</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.user_id"
            @click="selectUser(item)"
            class="table-row"
            role="button"
            :aria-label="`Select ${item.full_name}`"
          >
            <td>
              <img
                :src="getProfilePictureSrc(item.profile_picture)"
                :alt="item.full_name || 'Profile Image'"
                class="profile-image"
              />
            </td>
            <td>{{ item.user_id || 'N/A' }}</td>
            <td>{{ item.full_name || 'N/A' }}</td>
            <td>{{ item.phone_number || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length === 0" class="no-results">
        No results found
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="(page) => emit('page-changed', page)"
      />
    </div>

    <!-- Search Results Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="clearSearch">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search Results</h2>
          <button class="modal-close-btn" @click="clearSearch" aria-label="Close modal">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Profile Picture</th>
                <th>Staff ID</th>
                <th>Full Name</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredRows2"
                :key="item.user_id"
                @click="selectUser(item)"
                class="table-row"
                role="button"
                :aria-label="`Select ${item.full_name}`"
              >
                <td>
                  <img
                    :src="getProfilePictureSrc(item.profile_picture)"
                    :alt="item.full_name || 'Profile Image'"
                    class="profile-image"
                  />
                </td>
                <td>{{ item.user_id || 'N/A' }}</td>
                <td>{{ item.full_name || 'N/A' }}</td>
                <td>{{ item.phone_number || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredRows2.length === 0" class="no-results">
            No results found for "{{ searchQuery }}"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import Pagination from '../Pagination.vue';

import { all_users_to_excel } from '../../services/api';
import api from '../../services/api'; // Import api instance for baseURL
import { DEFAULT_AVATAR } from '../../services/api';
const loading = ref(false);
const searchQuery = ref('');
const rows2 = ref([]);
const showModal = ref(false);

const props = defineProps({
  tableHeaderColor: { type: String, default: '' },
  next: { type: String, default: 'iik' },
  previous: { type: String, default: 'fatts' },
  totalPages: { type: Number, required: true, default: 4 },
  currentPage: { type: Number, required: true, default: 2 },
  rows: {
    type: Array,
    default: () => [
      {
        user_id: '1111',
        full_name: 'None None',
        phone_number: null,
        profile_picture: null,
      },
      {
        user_id: '1293399',
        full_name: 'Rachel Korang',
        phone_number: null,
        profile_picture: null,
      },
      {
        user_id: '892652',
        full_name: 'Joyce Oppong',
        phone_number: null,
        profile_picture: null,
      },
    ],
  },
});

const emit = defineEmits(['user-selected', 'page-changed', 'export-error']);

onMounted(async () => {
  try {
    const res = await all_users_to_excel();
    if (Array.isArray(res.data)) {
      rows2.value = res.data;
    } else {

      emit('export-error', 'Invalid data received from server');
    }
  } catch (error) {

    emit('export-error', 'Failed to fetch data for table');
  }
});

// Filter rows2 based on search query for the modal
const filteredRows2 = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const query = searchQuery.value.toLowerCase().trim();
  return rows2.value.filter(
    (item) =>
      (item.user_id && item.user_id.toLowerCase().includes(query)) ||
      (item.full_name && item.full_name.toLowerCase().includes(query))
  );
});

const getProfilePictureSrc = (profilePicture) => {
  if (profilePicture && profilePicture !== '-') {
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `${api.defaults.baseURL}/${profilePicture.replace(/^\/+/, '')}`;
  }
  return DEFAULT_AVATAR;
};

const visibleEntries = (item) => {
  const labelMap = {
    profile_picture: 'Profile Picture',
    full_name: 'Full Name',
    phone_number: 'Contact',
    user_id: 'Staff ID',
  };

  return Object.entries(item)
    .filter(([key]) => [
      'profile_picture',
      'full_name',
      'phone_number',
      'user_id',
    ].includes(key))
    .map(([key, value]) => [
      key,
      key === 'profile_picture' ? getProfilePictureSrc(value) : (value ?? 'N/A'),
      labelMap[key] || key,
    ]);
};

const selectUser = (item) => {
  emit('user-selected', item.id);
  showModal.value = false;
};

const exportExcel = async () => {
  try {
    loading.value = true;
    const res = await all_users_to_excel();
    const exportData = res.data;

    if (!Array.isArray(exportData) || exportData.length === 0) {
      emit('export-error', 'No data available to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StaffData');
    XLSX.writeFile(workbook, 'staff_data.xlsx');
  } catch (error) {
    emit('export-error', 'Failed to export data to Excel');
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  showModal.value = false;
};

watch(searchQuery, (newQuery) => {
  showModal.value = !!newQuery.trim();
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: #666;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.export-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  min-width: 120px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td:first-child {
  width: 60px; /* Fixed width for profile picture column */
}

.profile-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.table-row:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
}

.modal-body {
  padding: 16px;
}
</style>