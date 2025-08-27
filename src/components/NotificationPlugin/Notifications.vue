<template>
  <div class="notifications">
    <transition-group name="list">
      <Notification
        v-for="notification in notifications"
        :key="notification.timestamp.getTime()"
        :message="notification.message"
        :icon="notification.icon"
        :type="notification.type"
        :timestamp="notification.timestamp"
        :vertical-align="notification.verticalAlign"
        :horizontal-align="notification.horizontalAlign"
        @on-close="removeNotification"
      />
    </transition-group>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import Notification from "./Notification.vue";

const { proxy } = getCurrentInstance(); // access Vue instance to get $notifications

const notifications = ref(proxy.$notifications.state);

function removeNotification(timestamp) {
  proxy.$notifications.removeNotification(timestamp);
}
</script>

<style lang="scss">
.list-move {
  transition: transform 0.3s, opacity 0.4s;
}
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active,
.list-leave-active {
  transition: opacity 0.4s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
