<template>
  <el-config-provider :locale="zhCn">

    <el-calendar v-model="day">
      <template #date-cell="{ data }">
        <div class="flex-centered">
          <p>
            {{ data.day.split("-").slice(1).join("-") }}
            {{ data.isSelected ? "✔️" : "" }}
            {{ monthCounts[data.day] || 0 }}
          </p>
        </div>

      </template>

    </el-calendar>
  </el-config-provider>
</template>

<script lang="ts" setup>
import "element-plus/theme-chalk/dark/css-vars.css";
// 国际化¬
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import store from "@/store";
import { computed } from "vue";
import { ref, watch } from "vue";

import { useDark, useToggle } from "@vueuse/core";
import moment from "moment/moment";

// 获取当前主题模式
const isDark = useDark();
useToggle(isDark);

// 日期
const day = ref(new Date());
const yearMon = moment(day.value).format("YYYY-MM");
store.commit("updateMonth", yearMon);

const monthCounts = computed(() => {
  return store.getters.getByMonth || {};
});
console.info("monthCounts", monthCounts.value);


watch(day, (newValue, oldValue) => {
  console.info("newValue", newValue);
  const yearMon = moment(newValue).format("YYYY-MM");
  store.commit("updateMonth", yearMon);
  console.info("monthCounts", monthCounts.value);
  // console.info("monthCounts.value[2024-06-30]", monthCounts.value["2024-06-30"] ||0);
});

</script>


<style>
.is-selected {
  color: #1989fa;
}

.centered-text {
  text-align: center; /* 水平居中文本 */
}

.flex-centered {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满高度，根据需要调整 */
}

</style>
