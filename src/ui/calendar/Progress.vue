<script setup lang="ts">

import SetValue from "@/ui/calendar/SetNumValue.vue";
import { Warning } from "@element-plus/icons-vue";
import { computed } from "vue";
import moment from "moment";
import { useDark } from "@vueuse/core";
import store from "@/data/Store";

const isDark = useDark();
let tooltipEffi = isDark ? "light" : "dark";


//==============
// 进度条


// 三个月内，每日字数集合
const threeMonthsData = computed(() => {
  return store.getters.threeMonthsData || {};
});

// const threeMonthsDayPlan = computed(() => {
//   return store.getters.threeMonthsDayPlan || {};
// });


// 本日目标
const targetWordContOfDay = computed(() => {
  // console.log("targetWordContOfDay", threeMonthsData.value);
  return Math.floor(store.getters.weeklyGoal / 7) || 0;
});

// 本周目标
const targetWordContOfWeek = computed(() => {
  return store.getters.weeklyGoal;
});

// 本月目标
const targetWordContOfMonth = computed(() => {
  return store.getters.monthlyGoal;
});


// 每日进度
const dayProgress = computed(() => {
  const dayCount = threeMonthsData.value[store.getters.currentDay] || 0;
  if (dayCount <= 0 || targetWordContOfDay.value == 0) {
    return 0;
  }
  let progress = Math.floor(dayCount / targetWordContOfDay.value * 100);
  return progress > 100 ? 100 : progress;
});

// 每周进度
const weekProgress = computed(() => {
  const today = store.getters.currentDay;
  // 获取本周的总字数
  const weekStart = moment(today).startOf("week");
  const weekEnd = moment(today).endOf("week");
  const weekCount = Object.keys(threeMonthsData.value).reduce((acc, key) => {
    const date = moment(key);
    if (date.isBetween(weekStart, weekEnd, "day", "[]")) {
      acc += threeMonthsData.value[key] || 0;
    }
    return acc;
  }, 0);

  const weekGoal = targetWordContOfWeek.value;
  if (weekCount <= 0 || weekGoal == 0) {
    return 0;
  }
  const progress = Math.floor((weekCount / weekGoal) * 100);
  return progress > 100 ? 100 : progress;
});

// 每月进度
const monthProgress = computed(() => {
  const today = store.getters.currentDay;
  const monthCount = Object.keys(threeMonthsData.value).reduce((acc, key) => {
    const date = moment(key);
    if (date.isSame(today, "month")) {
      acc += threeMonthsData.value[key] || 0;
    }
    return acc;
  }, 0);
  const monthGoal = targetWordContOfMonth.value;
  if (monthCount <= 0 || monthGoal == 0) {
    return 0;
  }
  const progress = Math.floor((monthCount / monthGoal) * 100
  );
  return progress > 100 ? 100 : progress;
});

const weekGoalChange = (data: number) => {
  // // console.log("weekGoalChange, data is ", data);
  const weekCount = moment(store.getters.currentDay).week();
  const year = moment(store.getters.currentDay).format("YYYY");
  const yearWeek = year + "_" + weekCount;
  store.commit("updateWeeklyPlan", { [yearWeek]: data });
};


</script>

<template>
  <div class="progress">
    <p class="goals">
      {{ $t(
      "dailyGoals"
    ) }}{{ targetWordContOfDay }}
      <el-tooltip
        class="box-item"
        :effect="tooltipEffi"
        :content="$t('dailyGoalsExplained')"
        placement="top"
      >
        <el-icon>
          <Warning />
        </el-icon>
      </el-tooltip>
    </p>
    <el-progress :percentage="dayProgress" :status="dayProgress>=100 ?'success':''" />
    <p class="goals">
      {{ $t(
      "weeklyGoals"
    ) }}
      {{ targetWordContOfWeek }}
      <el-tooltip
        class="box-item"
        :effect="tooltipEffi"
        :content="$t('weekGoalsExplained')"
        placement="top"
      >
        <el-icon>
          <Warning />
        </el-icon>
      </el-tooltip>
      <SetValue @set-value="weekGoalChange" :default-data="targetWordContOfWeek" />

    </p>
    <el-progress :percentage="weekProgress" :status="weekProgress>=100 ?'success':''" />
    <p class="goals">
      {{ $t("monthlyGoals") }}{{ targetWordContOfMonth }}
      <el-tooltip
        class="box-item"
        :effect="tooltipEffi"
        :content="$t('monthGoalsExplained')"
        placement="top"
      >
        <el-icon>
          <Warning />
        </el-icon>
      </el-tooltip>
    </p>
    <el-progress :percentage="monthProgress" :status="monthProgress>=100 ?'success':''" />
  </div>

</template>

<style scoped>

</style>
