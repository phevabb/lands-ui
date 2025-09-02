<script setup>
import { ref, onMounted } from "vue";
import { StatsCard, NavTabsCard, NavTabsTable, OrderedTable } from "@/components";
import { admin_dashboard_summary, pro_stats, contract_stats, leave_stats, salary_stats, age_stats, gender_stats, senior_stats, directorate_stats, region_stats, class_stats, management_stats } from "../../services/api";

import scroll from "../../../z/scroll.vue";
const table_1 = ref([]);
const table_2 = ref([]);
const table_3 = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const totalCount = ref(0);
const next = ref(null);
const previous = ref(null);

const allUsers = ref(0);
const totalMales = ref(0);
const totalFemales = ref(0);
const totalAdmins = ref(0);
const totalManagers = ref(0);
const totalStaffMembers = ref(0);


onMounted(async () => {
  isLoading.value = true;

  try {
    // Call both APIs at once
    const [{ data: summaryData }, { data: proData }, { data: conData }, { data: leaData }, { data: classData }, { data: dirData }, {data: regData}, {data: manData}, {data: senData}, {data: genData}, {data: ageData}, {data: salData}] = await Promise.all([
    admin_dashboard_summary(),
    pro_stats(),
    contract_stats(),  
    leave_stats(),  
    class_stats(),
      directorate_stats(),
      region_stats(),
      management_stats(),
      senior_stats(),
      gender_stats(),
      age_stats(),
      salary_stats(),
      

    ]);
    

    allUsers.value = summaryData.num_of_users;
    totalMales.value = summaryData.num_of_males;
    totalFemales.value = summaryData.num_of_females;
    totalAdmins.value = summaryData.num_of_admins;
    totalManagers.value = summaryData.num_of_managers;
    totalStaffMembers.value = summaryData.num_of_staffs;
    

    const proTab = {
      id: "tab-pro",
      label: "Professionals and Sub Professionals",
      icon: "school",
      users: (proData.table_data ?? []).map(d => ({
        name: d.professional,   // adjust field name if different
        count: d.count,
      })),
      total: proData.num_of_pros,
      name_: proData.name_,
    };

    const conTab = {
      id: "tab-CON",
      label: "Contract Types",
      icon: "school",
      users: (conData.table_data ?? []).map(d => ({
        name: d.contract_type,   // adjust field name if different
        count: d.count,
      })),
      total: conData.num_of_contract,
      name_: conData.name_,
    };

        // leave tab
      const leaTab = {
      id: "tab-lea",
      label: "Leave Tyeps",
      icon: "school",
      users: (leaData.table_data ?? []).map(d => ({
        name: d.leave_type,   // adjust field name if different
        count: d.count,
      })),
      total: leaData.num_of_on_leave,
      name_: leaData.name_,
    };

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

     // region tab
    const regionTab = {
      id: "tab-reg",
      label: "Regions",
      icon: "account_balance",
      users: (regData.table_data ?? []).map(d => ({
        name: d.region,
        count: d.count,
      })),
      total: regData.num_of_regions,
      name_: regData.name_,
    };

        
    // Management tab
    const manTab = {
      id: "tab-man",
      label: "Management Unit",
      icon: "account_balance",
      users: (manData.table_data ?? []).map(d => ({
        name: d.management_unit,
        count: d.count,
      })),
      total: manData.num_of_management_units,
      name_: manData.name_,
    };

    //senior / junior tab
    const senTab = {
      id: "tab-sen",
      label: "Senior/Junior Staff",
      icon: "account_balance",
      users: (senData.table_data ?? []).map(d => ({
        name: d.staff_category,
        count: d.count,
      })),
      total: senData.num_of_categories,
      name_: senData.name_,
    };

        //gender
    const genTab = {
      id: "tab-gen",
      label: "Gender",
      icon: "account_balance",
      users: (genData.table_data ?? []).map(d => ({
        name: d.gender,
        count: d.count,
      })),
      total: "2",
      name_: genData.name_,
    };

    //age
    const ageTab = {
      id: "tab-age",
      label: "Age Groups",
      icon: "account_balance",
      users: (ageData.table_data ?? []).map(d => ({
        name: d.age_range,
        count: d.count,
      })),
      total: ageData.num_of_age_ranges,
      name_: ageData.name_,
    };

    //salary
    const salTab = {
      id: "tab-sal",
      label: "Grade Levels",
      icon: "account_balance",
      users: (salData.table_data ?? []).map(d => ({
        name: d.salary_range,
        count: d.count,
      })),
      total: salData.num_of_salary_ranges,
      name_: salData.name_,
    };

    

    // Push into table
    table_1.value = [directorateTab, classTab, regionTab, manTab, ];

    table_2.value = [senTab, genTab, ageTab, salTab, ];

    table_3.value = [leaTab, conTab, proTab];


  } catch (err) {
  
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
              <h3 class="title">{{ allUsers }}</h3>
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
              <h3 class="title">{{ totalMales }}</h3>
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
              <h3 class="title">{{ totalFemales }}</h3>
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
              <h3 class="title">{{ totalAdmins }}</h3>
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
              <h3 class="title">{{ totalManagers }}</h3>
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
              <h3 class="title">{{ totalStaffMembers }}</h3>
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

      <!-- Nav Table 1 guard -->
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

      <!-- Nav 2 guard -->
      <div v-if="!isLoading && table_2.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_2"
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

       <!-- T3 -->
      <div v-if="!isLoading && table_3.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_3"
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