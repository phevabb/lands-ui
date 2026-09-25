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


 
  isLoading.value = true;
  try {
    const { data } = await apiFunc({ page });



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
    console.log("Error fetching users for tab print:", tab.name_, err);
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

    return 1;
  }
}



onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    /*
     * Keep the new Ktor Admin summary API together
     * with all legacy Django statistics APIs.
     */
    const [
      { data: summaryData },
      { data: proData },
      { data: conData },
      { data: leaData },
      { data: classData },
      { data: dirData },
      { data: regData },
      { data: manData },
      { data: senData },
      { data: genData },
      { data: ageData },
      { data: salData }
    ] = await Promise.all([
      /*
       * New Ktor API:
       * GET /api/admin/dashboard-summary
       */
      admin_dashboard_summary(),

      /*
       * Legacy Django APIs.
       * Keep these because the dashboard tabs
       * still depend on their responses.
       */
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
      salary_stats()
    ]);

    /*
     * Print only the Ktor dashboard summary.
     */
    console.log(
      "Admin dashboard summary:",
      summaryData
    );

    /*
     * Ktor uses camelCase response properties.
     *
     * Nullish coalescing preserves valid zero values.
     */
    allUsers.value =
      Number(
        summaryData.numOfUsers ??
        0
      );

    totalMales.value =
      Number(
        summaryData.numOfMales ??
        0
      );

    totalFemales.value =
      Number(
        summaryData.numOfFemales ??
        0
      );

    totalAdmins.value =
      Number(
        summaryData.numOfAdmins ??
        0
      );

    totalManagers.value =
      Number(
        summaryData.numOfManagers ??
        0
      );

    totalStaffMembers.value =
      Number(
        summaryData.numOfStaffs ??
        0
      );

    /*
     * Keep all your existing legacy Django
     * tab definitions below this point.
     */

    const proTab = {
      id: "tab-pro",
      label:
        "Professionals and Sub Professionals",
      icon: "school",

      users:
        (
          proData.results ??
          []
        ).map(item => {
          return {
            name:
              item.professional,
            count:
              item.count
          };
        }),

      total:
        proData.count,

      next:
        proData.next,

      previous:
        proData.previous,

      currentPage:
        getCurrentPageFromUrl(
          proData.next,
          proData.previous,
          proData.count
        ),

      totalPages:
        Math.ceil(
          (
            proData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Professionals and Sub Professionals",

      apiFunc:
        pro_stats
    };

    const conTab = {
      id: "tab-CON",
      label: "Contract Types",
      icon: "school",

      users:
        (
          conData.results ??
          []
        ).map(item => {
          return {
            name:
              item.contract_type,

            count:
              item.count
          };
        }),

      total:
        conData.count,

      next:
        conData.next,

      previous:
        conData.previous,

      currentPage:
        getCurrentPageFromUrl(
          conData.next,
          conData.previous,
          conData.count
        ),

      totalPages:
        Math.ceil(
          (
            conData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Contract Type",

      apiFunc:
        contract_stats
    };

    const leaTab = {
      id: "tab-lea",
      label: "Leave Types",
      icon: "school",

      users:
        (
          leaData.results ??
          []
        ).map(item => {
          return {
            name:
              item.leave_type,

            count:
              item.count
          };
        }),

      total:
        leaData.count,

      next:
        leaData.next,

      previous:
        leaData.previous,

      currentPage:
        getCurrentPageFromUrl(
          leaData.next,
          leaData.previous,
          leaData.count
        ),

      totalPages:
        Math.ceil(
          (
            leaData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Leave Type",

      apiFunc:
        leave_stats
    };

    const classTab = {
      id: "tab-classes",
      label: "Classes",
      icon: "school",

      users:
        (
          classData.results ??
          []
        ).map(item => {
          return {
            name:
              item.class,

            count:
              item.count
          };
        }),

      total:
        classData.count,

      next:
        classData.next,

      previous:
        classData.previous,

      currentPage:
        getCurrentPageFromUrl(
          classData.next,
          classData.previous,
          classData.count
        ),

      totalPages:
        Math.ceil(
          (
            classData.count ??
            0
          ) /
          page_size
        ),

      name_: "Class",

      apiFunc:
        class_stats
    };

    const directorateTab = {
      id: "tab-dept",
      label: "Departments",
      icon: "account_balance",

      users:
        (
          dirData.results ??
          []
        ).map(item => {
          return {
            name:
              item.department,

            count:
              item.count
          };
        }),

      total:
        dirData.count,

      next:
        dirData.next,

      previous:
        dirData.previous,

      currentPage:
        getCurrentPageFromUrl(
          dirData.next,
          dirData.previous,
          dirData.count
        ),

      totalPages:
        Math.ceil(
          (
            dirData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Directorate",

      apiFunc:
        directorate_stats
    };

    const regionTab = {
      id: "tab-reg",
      label: "Regions",
      icon: "account_balance",

      users:
        (
          regData.results ??
          []
        ).map(item => {
          return {
            name:
              item.region,

            count:
              item.count
          };
        }),

      total:
        regData.count,

      next:
        regData.next,

      previous:
        regData.previous,

      currentPage:
        getCurrentPageFromUrl(
          regData.next,
          regData.previous,
          regData.count
        ),

      totalPages:
        Math.ceil(
          (
            regData.count ??
            0
          ) /
          page_size
        ),

      name_: "Region",

      apiFunc:
        region_stats
    };

    const manTab = {
      id: "tab-man",
      label:
        "Management Unit",
      icon:
        "account_balance",

      users:
        (
          manData.results ??
          []
        ).map(item => {
          return {
            name:
              item.management_unit,

            count:
              item.count
          };
        }),

      total:
        manData.count,

      next:
        manData.next,

      previous:
        manData.previous,

      currentPage:
        getCurrentPageFromUrl(
          manData.next,
          manData.previous,
          manData.count
        ),

      totalPages:
        Math.ceil(
          (
            manData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Management Unit",

      apiFunc:
        management_stats
    };

    const senTab = {
      id: "tab-sen",
      label:
        "Senior/Junior Staff",
      icon:
        "account_balance",

      users:
        (
          senData.results ??
          []
        ).map(item => {
          return {
            name:
              item.staff_category,

            count:
              item.count
          };
        }),

      total:
        senData.count,

      next:
        senData.next,

      previous:
        senData.previous,

      currentPage:
        getCurrentPageFromUrl(
          senData.next,
          senData.previous,
          senData.count
        ),

      totalPages:
        Math.ceil(
          (
            senData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Staff Category",

      apiFunc:
        senior_stats
    };

    const genTab = {
      id: "tab-gen",
      label: "Gender",
      icon:
        "account_balance",

      users:
        (
          genData.results ??
          []
        ).map(item => {
          return {
            name:
              item.gender,

            count:
              item.count
          };
        }),

      total:
        genData.count ??
        2,

      next:
        genData.next,

      previous:
        genData.previous,

      currentPage:
        getCurrentPageFromUrl(
          genData.next,
          genData.previous,
          genData.count
        ),

      totalPages:
        Math.ceil(
          (
            genData.count ??
            0
          ) /
          page_size
        ),

      name_: "Gender",

      apiFunc:
        gender_stats
    };

    const ageTab = {
      id: "tab-age",
      label: "Age Groups",
      icon:
        "account_balance",

      users:
        (
          ageData.results ??
          []
        ).map(item => {
          return {
            name:
              item.age_range,

            count:
              item.count
          };
        }),

      total:
        ageData.count,

      next:
        ageData.next,

      previous:
        ageData.previous,

      currentPage:
        getCurrentPageFromUrl(
          ageData.next,
          ageData.previous,
          ageData.count
        ),

      totalPages:
        Math.ceil(
          (
            ageData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Age Range",

      apiFunc:
        age_stats
    };

    const salTab = {
      id: "tab-sal",
      label: "Grade Levels",
      icon:
        "account_balance",

      users:
        (
          salData.results ??
          []
        ).map(item => {
          return {
            name:
              item.salary_range,

            count:
              item.count
          };
        }),

      total:
        salData.count,

      next:
        salData.next,

      previous:
        salData.previous,

      currentPage:
        getCurrentPageFromUrl(
          salData.next,
          salData.previous,
          salData.count
        ),

      totalPages:
        Math.ceil(
          (
            salData.count ??
            0
          ) /
          page_size
        ),

      name_:
        "Salary Level",

      apiFunc:
        salary_stats
    };

    table_1.value = [
      classTab,
      conTab,
      proTab,
      senTab
    ];

    table_2.value = [
      manTab,
      ageTab
    ];

    table_3.value = [
      directorateTab,
      leaTab
    ];

    table_4.value = [
      salTab,
      proTab
    ];

    table_5.value = [
      regionTab,
      genTab
    ];
  } catch (error) {
    console.error(
      "Unable to load dashboard data:",
      error.response?.data ||
      error.message ||
      error
    );

    if (
      error.message?.includes(
        "Network Error"
      ) ||
      error.code ===
        "ERR_NETWORK"
    ) {
      errorMessage.value =
        "Please check your internet connection.";
    } else if (
      error.response?.status ===
      401
    ) {
      errorMessage.value =
        "Your session has expired. Please sign in again.";
    } else if (
      error.response?.status ===
      403
    ) {
      errorMessage.value =
        "You do not have permission to view this dashboard.";
    } else {
      errorMessage.value =
        error.response?.data?.detail ||
        "Something went wrong while fetching dashboard data.";
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