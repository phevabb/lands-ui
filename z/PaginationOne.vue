<script setup>
import { ref, computed } from "vue";

const totalPages = ref(15);
const currentPage = ref(3);
const inputPage = ref(null);

// Determine which pages to show to prevent overflow
const visiblePages = computed(() => {
  const maxVisible = 5; // Maximum number of page buttons to show
  const pages = [];

  if (totalPages.value <= maxVisible) {
    // If total pages is less than max visible, show all
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show current page and some pages around it
    let start = Math.max(1, currentPage.value - 2);
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    // Adjust if we're near the end
    if (end - start + 1 < maxVisible) {
      start = end - maxVisible + 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Show first page separately when needed
const showFirstPage = computed(() => {
  return totalPages.value > 5 && !visiblePages.value.includes(1);
});

// Show last page separately when needed
const showLastPage = computed(() => {
  return totalPages.value > 5 && !visiblePages.value.includes(totalPages.value);
});

// Show first ellipsis when needed
const showFirstEllipsis = computed(() => {
  return totalPages.value > 5 && Math.min(...visiblePages.value) > 2;
});

// Show second ellipsis when needed
const showSecondEllipsis = computed(() => {
  return totalPages.value > 5 && Math.max(...visiblePages.value) < totalPages.value - 1;
});

function changePage(page) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    inputPage.value = null;
    console.log(`Page changed to ${page}`);
  }
}

function goToPage(page) {
  if (!page || page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;

  changePage(page);
}
</script>

<template>
  <div class="container">
    <h1>Premium Pagination Component</h1>

    <div class="pagination">
      <!-- Previous button -->
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <!-- First page -->
      <div
        v-if="showFirstPage"
        @click="changePage(1)"
        :class="['pagination-page', { active: 1 === currentPage }]"
      >
        1
      </div>

      <!-- First ellipsis -->
      <div v-if="showFirstEllipsis" class="pagination-dots">...</div>

      <!-- Page numbers -->
      <div
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        :class="['pagination-page', { active: page === currentPage }]"
      >
        {{ page }}
      </div>

      <!-- Second ellipsis -->
      <div v-if="showSecondEllipsis" class="pagination-dots">...</div>

      <!-- Last page -->
      <div
        v-if="showLastPage"
        @click="changePage(totalPages)"
        :class="['pagination-page', { active: totalPages === currentPage }]"
      >
        {{ totalPages }}
      </div>

      <!-- Next button -->
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div class="pagination-info">
      Showing page {{ currentPage }} of {{ totalPages }}
    </div>

    <div class="page-input">
      <input
        type="number"
        v-model.number="inputPage"
        min="1"
        :max="totalPages"
        placeholder="Page"
      />
      <button class="go-btn" @click="goToPage(inputPage)">
        Go <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div class="demo-controls">
      <button class="demo-btn" @click="totalPages = 5">Few Pages (5)</button>
      <button class="demo-btn" @click="totalPages = 15">Many Pages (15)</button>
      <button class="demo-btn" @click="totalPages = 50">Lots of Pages (50)</button>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  margin: 30px auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 30px 0;
}

.pagination-btn,
.pagination-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 42px;
  height: 42px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.pagination-btn:hover:not(:disabled),
.pagination-page:hover:not(.active) {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-page.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.pagination-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 24px;
  height: 42px;
  color: #6c757d;
  font-weight: 600;
}

.pagination-info {
  text-align: center;
  margin-top: 20px;
  color: #6c757d;
  font-size: 14px;
}

.page-input {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.page-input input {
  width: 70px;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.page-input input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.go-btn {
  padding: 10px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.go-btn:hover {
  background: #27ae60;
  transform: translateY(-2px);
}

.demo-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.demo-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.demo-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .pagination {
    gap: 4px;
  }

  .pagination-btn,
  .pagination-page {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    font-size: 14px;
  }

  .container {
    padding: 20px;
  }

  .demo-controls {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}
</style>
