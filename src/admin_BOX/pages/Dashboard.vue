<script setup>
import { ref } from "vue";
import { StatsCard, NavTabsCard, NavTabsTable, OrderedTable } from "@/components";

// Tab data
const tabs = [
  {
    id: "tab-home",
    label: "Bugs",
    icon: "bug_report",
    users: [{ name: "Bug 1" }, { name: "Bug 2" }],
  },
  {
    id: "tab-pages",
    label: "Website",
    icon: "code",
    users: [
      { name: "Website 1" },
      { name: "Website 2" }
    ]
  },
  {
    id: "tab-posts",
    label: "Server",
    icon: "cloud",
    users: [
      { name: "Server 1" },
      { name: "Server 2" }
    ]
  },
  {
    id: "tab-age",
    label: "Age",
    icon: "cloud",
    users: [
      { name: "Age 1" },
      { name: "Age 2" }
    ]
  }
];

// Charts

</script>

<template>
  <div class="content">
    <div class="md-layout">
      <!-- 4 stat cards -->
      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="green">
          <template #header>
            <md-icon>store</md-icon>
          </template>
          <template #content>
            <p class="category">Revenue</p>
            <h3 class="title">$34,245</h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon>date_range</md-icon>
              Last 24 Hours
            </div>
          </template>
        </stats-card>
      </div>

      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="orange">
          <template #header>
            <md-icon>content_copy</md-icon>
          </template>
          <template #content>
            <p class="category">Used Space</p>
            <h3 class="title">49/50 <small>GB</small></h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon class="text-danger">warning</md-icon>
              <a href="#pablo">Get More Space...</a>
            </div>
          </template>
        </stats-card>
      </div>

      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="red">
          <template #header>
            <md-icon>info_outline</md-icon>
          </template>
          <template #content>
            <p class="category">Fixed Issues</p>
            <h3 class="title">75</h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon>local_offer</md-icon>
              Tracked from Github
            </div>
          </template>
        </stats-card>
      </div>

      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="blue">
          <template #header>
            <i class="fab fa-twitter"></i>
          </template>
          <template #content>
            <p class="category">Followers</p>
            <h3 class="title">+245</h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon>update</md-icon>
              Just Updated
            </div>
          </template>
        </stats-card>
      </div>

      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="blue">
          <template #header>
            <i class="fab fa-twitter"></i>
          </template>
          <template #content>
            <p class="category">Followers</p>
            <h3 class="title">+245</h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon>update</md-icon>
              Just Updated
            </div>
          </template>
        </stats-card>
      </div>

      <div class="md-layout-item md-medium-size-50 md-xsmall-size-100 md-size-25">
        <stats-card data-background-color="blue">
          <template #header>
            <i class="fab fa-twitter"></i>
          </template>
          <template #content>
            <p class="category">Followers</p>
            <h3 class="title">+245</h3>
          </template>
          <template #footer>
            <div class="stats">
              <md-icon>update</md-icon>
              Just Updated
            </div>
          </template>
        </stats-card>
      </div>


      <!-- Employees Table -->
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

      <!-- Nav Tabs Card with Dynamic Tables -->
      <div class="md-layout-item md-medium-size-100 md-xsmall-size-100 md-size-50">
        <nav-tabs-card>
          <template #content>
            <span class="md-nav-tabs-title">Units:</span>
            <md-tabs class="md-success" md-alignment="left">
              <md-tab
                v-for="tab in tabs"
                :key="tab.id"
                :id="tab.id"
                :md-label="tab.label"
                :md-icon="tab.icon"
              >
                <nav-tabs-table :users="tab.users"></nav-tabs-table>
              </md-tab>
            </md-tabs>
          </template>
        </nav-tabs-card>
      </div>
    </div>
  </div>
</template>
