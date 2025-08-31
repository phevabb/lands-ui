<template>
  <md-card class="md-card-nav-tabs">
    <div class="nav-container">
      <!-- Left Arrow -->
      <button
        class="nav-arrow left"
        @click="scrollLeft"
        :disabled="scrollPosition === 0"
      >
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <!-- Scrollable Tabs -->
      <div class="nav-tabs-container" ref="tabsContainerRef">
        <div
          class="nav-tabs"
          ref="tabsRef"
          :style="{ transform: `translateX(${scrollPosition}px)` }"
        >
          <div
            v-for="(tab, index) in tabs"
            :key="tab.id || index"
            :class="['nav-tab', { active: activeTab === index }]"
            @click="setActiveTab(index)"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>

      <!-- Right Arrow -->
      <button
        class="nav-arrow right"
        @click="scrollRight"
        :disabled="isScrollEnd"
      >
        <svg viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>

    <!-- Tab Content -->
    <md-card-content>
      <slot name="content" :activeTab="activeTab" :tab="tabs[activeTab]">
        <!-- default fallback if slot not provided -->
        <div class="tab-content">
          <h3>{{ tabs[activeTab]?.label }}</h3>
          <p>{{ tabContents[activeTab] }}</p>
        </div>
      </slot>
    </md-card-content>
  </md-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

defineOptions({ name: "nav-tabs-card" });

// Props
const props = defineProps({
  tabs: { type: Array, required: true }, // Array of tab objects from API
  tabContents: { type: Object, default: () => ({}) }, // Optional content mapping
});

const activeTab = ref(0);
const scrollPosition = ref(0);
const tabsContainerWidth = ref(0);
const tabsWidth = ref(0);

const tabsContainerRef = ref(null);
const tabsRef = ref(null);

const setActiveTab = (index) => (activeTab.value = index);

const isScrollEnd = computed(() => {
  return scrollPosition.value <= -(tabsWidth.value - tabsContainerWidth.value);
});

const scrollLeft = () => {
  scrollPosition.value = Math.min(scrollPosition.value + 200, 0);
};

const scrollRight = () => {
  const maxScroll = -(tabsWidth.value - tabsContainerWidth.value);
  scrollPosition.value = Math.max(scrollPosition.value - 200, maxScroll);
};

const calculateWidths = () => {
  if (tabsContainerRef.value && tabsRef.value) {
    tabsContainerWidth.value = tabsContainerRef.value.offsetWidth;
    tabsWidth.value = tabsRef.value.scrollWidth;
  }
};

onMounted(() => {
  calculateWidths();
  window.addEventListener("resize", calculateWidths);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateWidths);
});
</script>

<style scoped>
.md-card-nav-tabs { position: relative; }
.nav-container { display: flex; align-items: center; }
.nav-tabs-container { overflow: hidden; flex: 1; }
.nav-tabs { display: flex; gap: 8px; transition: transform 0.3s ease; }
.nav-tab { padding: 10px 20px; cursor: pointer; border-radius: 20px; flex-shrink: 0; background: #f0f0f0; }
.nav-tab.active { background: #1976d2; color: white; }
.nav-arrow { width: 36px; height: 36px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 0 4px; }
.nav-arrow:disabled { opacity: 0.5; cursor: not-allowed; }
.nav-arrow svg { width: 20px; height: 20px; fill: #1976d2; }
.tab-content { padding: 16px; background: #f8f9fa; border-radius: 8px; min-height: 120px; }
</style>
