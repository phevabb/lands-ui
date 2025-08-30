<script setup>
import { ref, onMounted } from "vue";
import { StatsCard, NavTabsCard, NavTabsTable, OrderedTable } from "@/components";
import { directorate_stats } from "../../services/api";
import { class_stats } from "../../services/api";

const table_1 = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const totalCount = ref(0);
const next = ref(null);
const previous = ref(null);

onMounted(async () => {
  isLoading.value = true;

  try {
    // Call both APIs at once
    const [{ data: classData }, { data: dirData }] = await Promise.all([
      class_stats(),
      directorate_stats()
    ]);

    // Class tab
    const classTab = {
      id: "tab-classes",
      label: "Classes",
      icon: "school",
      users: (classData.table_data ?? []).map(d => ({
        name: d.class,   // adjust field name if different
        count: d.count,
      })),
      total: classData.num_of_classes,
      name_: classData.name_,
    };

    // Directorate tab
    const directorateTab = {
      id: "tab-dept",
      label: "Departments",
      icon: "account_balance",
      users: (dirData.table_data ?? []).map(d => ({
        name: d.department,
        count: d.count,
      })),
      total: dirData.num_of_departments,
      name_: dirData.name_,
    };

    // Push into table
    table_1.value = [directorateTab, classTab];

  } catch (err) {
    console.error("error loading stats data", err);
  } finally {
    isLoading.value = false;
  }
});


</script>


<template>
  <div class="content">
    <div class="md-layout">
      <!-- 4 stat cards -->
      <template>
        <!-- Total staff -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="green">
            <template #header>
              <md-icon>group</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Total Staff</p>
              <h3 class="title">34,245</h3>
            </template>
          </stats-card>
        </div>

        <!-- Males -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="orange">
            <template #header>
              <md-icon>man</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Males</p>
              <h3 class="title">34,245</h3>
            </template>
          </stats-card>
        </div>

        <!-- Females -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="red">
            <template #header>
              <md-icon>woman</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Females</p>
              <h3 class="title">75</h3>
            </template>
          </stats-card>
        </div>

        <!-- Admins -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="blue">
            <template #header>
              <md-icon>admin_panel_settings</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Admins</p>
              <h3 class="title">5</h3>
            </template>
          </stats-card>
        </div>

        <!-- Managers -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="blue">
            <template #header>
              <md-icon>supervisor_account</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Managers</p>
              <h3 class="title">+245</h3>
            </template>
          </stats-card>
        </div>

        <!-- General Staff -->
        <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
          <stats-card data-background-color="blue">
            <template #header>
              <md-icon>badge</md-icon>
            </template>

            <template #content>
              <p style="color: black;" class="category">Staff</p>
              <h3 class="title">45</h3>
            </template>
          </stats-card>
        </div>
      </template>

      <!-- Employees Table (commented out)
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <md-card>
          <md-card-header data-background-color="orange">
            <h4 class="md-title">Employees Stats</h4>
            <p class="category">New employees on 15th September, 2016</p>
          </md-card-header>
          <md-card-content>
            <ordered-table table-header-color="orange"></ordered-table>
          </md-card-content>
        </md-card>
      </div>
      -->

      <!-- Nav Tabs Card with v-if guard -->
      <div v-if="!isLoading && table_1.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            <md-tabs class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_1"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table :users="tab.users" :total="tab.total"  :name_="tab.name_"></nav-tabs-table>

              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <md-card>
          <md-card-content>
            <div class="text-center py-4">
              <md-icon class="md-size-3x">hourglass_empty</md-icon>
              <p>Loading department data...</p>
            </div>
          </md-card-content>
        </md-card>
      </div>
    </div>
  </div>
</template>