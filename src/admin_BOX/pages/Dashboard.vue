<script setup>
import { ref, onMounted } from "vue";
import { StatsCard, NavTabsCard, NavTabsTable, OrderedTable } from "@/components";
import { admin_dashboard_summary, pro_stats, contract_stats, leave_stats, salary_stats, age_stats, gender_stats, senior_stats, directorate_stats, region_stats, class_stats, management_stats } from "../../services/api";

import scroll from "../../../z/scroll.vue";
const table_1 = ref([]);
const table_2 = ref([]);
const table_3 = ref([]);
const table_4 = ref([]);
const table_5 = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const currentPage = ref(1);
const totalCount = ref(0);
const next = ref(null);
const previous = ref(null);

const activeTab = ref("tab-dept");

const allUsers = ref(0);
const totalMales = ref(0);
const totalFemales = ref(0);
const totalAdmins = ref(0);
const totalManagers = ref(0);
const totalStaffMembers = ref(0);
const page_size = 10



async function fetchUsers(tab, apiFunc, page, name_) {

  console.log("Fetching:", name_, " | Page:", page);
 
  isLoading.value = true;
  try {
    const { data } = await apiFunc({ page });

    console.log("datussssssss", data)

    // Update the specific tab, not a global rows.value
    tab.users = data.results.map(d => ({
      name: d.professional || d.gender || d.age_range || d.salary_range|| d.staff_category|| d.region || d.contract_type || d.leave_type || d.name || d.department || d.class || d.management_unit, // adjust per API
      count: d.count,
    }));
    tab.total = data.count;
    tab.currentPage = getCurrentPageFromUrl(data.next, data.previous, data.count);
    tab.totalPages = Math.ceil(data.count / page_size);
    tab.next = data.next;
    tab.previous = data.previous;
  } catch (err) {
    if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
  } finally {
    isLoading.value = false;
  }
}


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
    errorMessage.value =""

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

    // console.log("Region API response:", regData);
  
    
    

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
  users: (proData.results ?? []).map(d => ({
    name: d.professional, // adjust field name if different
    count: d.count,
  })),
  total: proData.count,

  // Pagination
  next: proData.next,
  previous: proData.previous,
  currentPage: getCurrentPageFromUrl(proData.next, proData.previous, proData.count, ),
  totalPages: Math.ceil(proData.count / page_size),
  name_: "Professionals and Sub Professionals",

  apiFunc: pro_stats,
};

const conTab = {
  id: "tab-CON",
  label: "Contract Types",
  icon: "school",
  users: (conData.results ?? []).map(d => ({
    name: d.contract_type,
    count: d.count,
  })),
  total: conData.count,
  

  // Pagination
  next: conData.next,
  previous: conData.previous,
  currentPage: getCurrentPageFromUrl(conData.next, conData.previous, conData.count,),
  totalPages: Math.ceil(conData.count / page_size),
  name_: "Contract Type",

  apiFunc: contract_stats,
};

const leaTab = {
  id: "tab-lea",
  label: "Leave Types",
  icon: "school",
  users: (leaData.results ?? []).map(d => ({
    name: d.leave_type,
    count: d.count,
  })),
  total: leaData.count,


  // Pagination
  next: leaData.next,
  previous: leaData.previous,
  currentPage: getCurrentPageFromUrl(leaData.next, leaData.previous, leaData.count,),
  totalPages: Math.ceil(leaData.count / page_size),
  name_: "Leave Type",

  apiFunc: leave_stats,
};

const classTab = {
  id: "tab-classes",
  label: "Classes",
  icon: "school",
  users: (classData.results ?? []).map(d => ({
    name: d.class,
    count: d.count,
  })),
  total: classData.count,


  // Pagination
  next: classData.next,
  previous: classData.previous,
  currentPage: getCurrentPageFromUrl(classData.next, classData.previous, classData.count, ),
  totalPages: Math.ceil(classData.count / page_size),
  name_: "Class",

  apiFunc: class_stats,
};

const directorateTab = {
  id: "tab-dept",
  label: "Departments",
  icon: "account_balance",
  users: (dirData.results ?? []).map(d => ({
    name: d.department,
    count: d.count,
  })),
  total: dirData.count,


  // Pagination
  next: dirData.next,
  previous: dirData.previous,
  currentPage: getCurrentPageFromUrl(dirData.next, dirData.previous, dirData.count,),
  totalPages: Math.ceil(dirData.count /page_size),
  name_: "Directorate",

  apiFunc: directorate_stats,
};

const regionTab = {
  id: "tab-reg",
  label: "Regions",
  icon: "account_balance",
  users: (regData.results ?? []).map(d => ({
    name: d.region,
    count: d.count,
  })),
  total: regData.count,


  // Pagination
  next: regData.next,
  previous: regData.previous,
  currentPage: getCurrentPageFromUrl(regData.next, regData.previous, regData.count, ),
  totalPages: Math.ceil(regData.count / page_size),
  name_: "Region",

  apiFunc: region_stats,
};

const manTab = {
  id: "tab-man",
  label: "Management Unit",
  icon: "account_balance",
  users: (manData.results ?? []).map(d => ({
    name: d.management_unit,
    count: d.count,
  })),
  total: manData.count,

  // Pagination
  next: manData.next,
  previous: manData.previous,
  currentPage: getCurrentPageFromUrl(manData.next, manData.previous, manData.count, ),
  totalPages: Math.ceil(manData.count / page_size),
  name_: "Management Unit",

  apiFunc: management_stats,
};

const senTab = {
  id: "tab-sen",
  label: "Senior/Junior Staff",
  icon: "account_balance",
  users: (senData.results ?? []).map(d => ({
    name: d.staff_category,
    count: d.count,
  })),
  total: senData.count,


  // Pagination
  next: senData.next,
  previous: senData.previous,
  currentPage: getCurrentPageFromUrl(senData.next, senData.previous, senData.count, ),
  totalPages: Math.ceil(senData.count / page_size),
  name_: "Staff Category",

  apiFunc: senior_stats,
};

const genTab = {
  id: "tab-gen",
  label: "Gender",
  icon: "account_balance",
  users: (genData.results ?? []).map(d => ({
    name: d.gender,
    count: d.count,
  })),
  total: "2",


  // Pagination
  next: genData.next,
  previous: genData.previous,
  currentPage: getCurrentPageFromUrl(genData.next, genData.previous, genData.count, ),
  totalPages: Math.ceil(genData.count / page_size),
  name_: "Gender",

  apiFunc: gender_stats,
};

const ageTab = {
  id: "tab-age",
  label: "Age Groups",
  icon: "account_balance",
  users: (ageData.results ?? []).map(d => ({
    name: d.age_range,
    count: d.count,
  })),
  total: ageData.count,

  // Pagination
  next: ageData.next,
  previous: ageData.previous,
  currentPage: getCurrentPageFromUrl(ageData.next, ageData.previous, ageData.count, ),
  totalPages: Math.ceil(ageData.count /page_size),
  name_: "Age Range",

  apiFunc: age_stats,
};

const salTab = {
  id: "tab-sal",
  label: "Grade Levels",
  icon: "account_balance",
  users: (salData.results ?? []).map(d => ({
    name: d.salary_range,
    count: d.count,
  })),
  total: salData.count,
 name_: "Salary Level",

  // Pagination
  next: salData.next,
  previous: salData.previous,
  currentPage: getCurrentPageFromUrl(salData.next, salData.previous, salData.count, ),
  totalPages: Math.ceil(salData.count / page_size),

  apiFunc: salary_stats,
};


    

    // Push into table
    table_1.value = [classTab, conTab, proTab, senTab,];

    table_2.value = [ manTab , ageTab,  ];

    table_3.value = [  directorateTab, leaTab ,  ];

    table_4.value = [  salTab, proTab , ];

    table_5.value = [  regionTab, genTab  , ];


  } catch (err) {  
    
     if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      errorMessage.value = "Please check your internet connection.";
    } else {
      errorMessage.value = "Something went wrong while fetching staff data.";
    }
  
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


      <!-- Nav Table 1 guard -->
      <div v-if="!isLoading && table_1.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs   class="md-success" md-alignment="left" >
              <md-tab
                v-for="tab in table_1"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table 

              @page-changed="(page, name_) => fetchUsers(tab, tab.apiFunc, page, name_)" 
              :next="tab.next"
              :previous="tab.previous"
              :currentPage="tab.currentPage"
              :totalPages="tab.totalPages"
              :users="tab.users"
              :total="tab.total"
              :name_="tab.name_"
  
  ></nav-tabs-table>

              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>

      <!-- Nav 2 guard -->
      <div v-if="!isLoading && table_2.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs  v-model="activeTab" class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_2"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table 
                 @page-changed="(page, name_) => fetchUsers(tab, tab.apiFunc, page, name_)" 
              :next="tab.next"
              :previous="tab.previous"
              :currentPage="tab.currentPage"
              :totalPages="tab.totalPages"
              :users="tab.users"
              :total="tab.total"
              :name_="tab.name_"
  
                ></nav-tabs-table>

              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>

       <!-- T3 -->
      <div v-if="!isLoading && table_3.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs  v-model="activeTab" class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_3"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table 
                @page-changed="(page, name_) => fetchUsers(tab, tab.apiFunc, page, name_)" 
              :next="tab.next"
              :previous="tab.previous"
              :currentPage="tab.currentPage"
              :totalPages="tab.totalPages"
              :users="tab.users"
              :total="tab.total"
              :name_="tab.name_"
                ></nav-tabs-table>

              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>

       <!-- T4 -->
      <div v-if="!isLoading && table_3.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs  v-model="activeTab" class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_4"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table 
                @page-changed="(page, name_) => fetchUsers(tab, tab.apiFunc, page, name_)" 
              :next="tab.next"
              :previous="tab.previous"
              :currentPage="tab.currentPage"
              :totalPages="tab.totalPages"
              :users="tab.users"
              :total="tab.total"
              :name_="tab.name_"
                ></nav-tabs-table>

              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>


       <!-- T5 -->
      <div v-if="!isLoading && table_3.length > 0" class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            
         
            <md-tabs  v-model="activeTab" class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in table_5"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table 
                @page-changed="(page, name_) => fetchUsers(tab, tab.apiFunc, page, name_)" 
              :next="tab.next"
              :previous="tab.previous"
              :currentPage="tab.currentPage"
              :totalPages="tab.totalPages"
              :users="tab.users"
              :total="tab.total"
              :name_="tab.name_"
                ></nav-tabs-table>

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

      <!-- Error message -->
      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>


    </div>
  </div>
</template>


<style scoped>

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
</style>