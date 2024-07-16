<template>
  <el-config-provider>

    <el-calendar v-model="day">
      <template #date-cell="{ data }">

        <div class="flex-centered">
          <p>
            {{ data.date.getDate() }}
          </p>
        </div>

        <div class="flex-centered2">
          <p>
            {{ monthCounts[data.day] || 0 }}
          </p>
        </div>
        <div class="flex-centered3 ">
          <p>
            {{ (monthCounts[data.day] || 0) > targetWordContOfDay ? "✔️" : "" }}
          </p>
        </div>
      </template>

    </el-calendar>


    <div class="progress">
      <p>
        {{ $t(
        "每日目标：",
        "Daily goals: "
      ) }}{{ targetWordContOfDay }}
      </p>
      <el-progress :percentage="dayProgress" :status="dayProgress>=100 ?'success':''" />
      <p>
        {{ $t(
        "每周目标：",
        "Weekly goals: "
      ) }}
        {{ targetWordContOfDay * 7 }}
        <SetValue @child-event="handleChildEvent" />
      </p>
      <el-progress :percentage="weekProgress" :status="weekProgress>=100 ?'success':''" />
      <p>
        {{ $t(
        "每月目标：",
        "Monthly goals: "
      ) }}{{ targetWordContOfDay * dayCountOfMonth }}
        <!--        , 本月：{{ dayCountOfMonth }}天。-->
      </p>
      <el-progress :percentage="monthProgress" :status="monthProgress>=100 ?'success':''" />
    </div>


  </el-config-provider>
</template>

<script lang="ts" setup>
import "element-plus/theme-chalk/dark/css-vars.css";
// 国际化¬
import { ElConfigProvider } from "element-plus";
// import zhCn from "element-plus/es/locale/lang/zh-cn";
import store from "@/data/Store";
import { computed } from "vue";
import { ref, watch } from "vue";


import { useDark, useToggle } from "@vueuse/core";
import moment from "moment/moment";
import SetValue from "@/ui/calendar/SetValue.vue";
import { DailyStatisticsDataManagerInstance } from "@/data/StatisticsDataManager";


// 获取当前主题模式
const isDark = useDark();
useToggle(isDark);

// 日期
const day = ref(new Date());
const yearMon = moment(day.value).format("YYYY-MM");
store.commit("updateMonth", yearMon);

const monthCounts = computed(() => {
  return store.getters.dayCounts || {};
});
// console.info("monthCounts", monthCounts.value);


watch(day, (newValue) => {
  // console.info("newValue", newValue);
  const yearMon = moment(newValue).format("YYYY-MM");
  store.commit("updateMonth", yearMon);
  // console.info("monthCounts", monthCounts.value);
  // console.info("monthCounts.value[2024-06-30]", monthCounts.value["2024-06-30"] ||0);
});


//==============
// 进度条

// 目标字数
const targetWordContOfDay = computed(() => {
  return store.getters.targetWordCont;
});

// 获取指定月份的总天数
const dayCountOfMonth = computed(() => {
  return moment(store.getters.month).daysInMonth();
});

// 每日进度
const dayProgress = computed(() => {
  const today = moment(day.value).format("YYYY-MM-DD");
  const dayCount = monthCounts.value[today] || 0;
  let progress = Math.floor(dayCount / targetWordContOfDay.value * 100);
  return progress > 100 ? 100 : progress;
});

// 本周目标
const weekProgress = computed(() => {
  const today = moment(day.value).format("YYYY-MM-DD");
  // 获取本周的总字数
  const weekStart = moment(today).startOf("week");
  const weekEnd = moment(today).endOf("week");
  const weekCount = Object.keys(monthCounts.value).reduce((acc, key) => {
    const date = moment(key);
    if (date.isBetween(weekStart, weekEnd, "day", "[]")) {
      acc += monthCounts.value[key] || 0;
    }
    return acc;
  }, 0);
  // console.info("weekCount", weekCount);
  const progress = Math.floor((weekCount / (targetWordContOfDay.value * 7)) * 100);
  // console.info("weekCount progress", progress);
  return progress > 100 ? 100 : progress;
});

// 本月目标
const monthProgress = computed(() => {
  const today = moment(day.value).format("YYYY-MM-DD");
  const monthCount = Object.keys(monthCounts.value).reduce((acc, key) => {
    const date = moment(key);
    if (date.isSame(today, "month")) {
      acc += monthCounts.value[key] || 0;
    }
    return acc;
  }, 0);
  const progress = Math.floor((monthCount / (targetWordContOfDay.value * dayCountOfMonth.value)) * 100
  );
  return progress > 100 ? 100 : progress;
});


//========
const handleChildEvent = (data: string) => {
  console.info(data); // 接收来自子组件的数据
  DailyStatisticsDataManagerInstance.data.weeklyPlan = {
    "tset": data
  };
  console.info(DailyStatisticsDataManagerInstance.data.weeklyPlan);
  DailyStatisticsDataManagerInstance.saveStatisticsData();
};

</script>


<style>
.is-selected {
  color: #1989fa;
}


.flex-centered {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 40%; /* 占满高度，根据需要调整 */
  font-weight: bold;
}

.flex-centered2 {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 30%; /* 占满高度，根据需要调整 */
}

.flex-centered3 {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 30%; /* 占满高度，根据需要调整 */
}


.progress {
  margin: 20px;
}
</style>
