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

            <el-icon  v-if="((monthCounts[data.day] || 0) > dailyGoals[data.day]) && dailyGoals[data.day] > 0"  ><Check /></el-icon>

          </p>
        </div>
      </template>

    </el-calendar>


    <div class="progress">
      <p class="goals">
        {{ $t(
        "每日目标：",
        "Daily goals: "
      ) }}{{ targetWordContOfDay }}
        <el-tooltip
          class="box-item"
          :effect="tooltipEffi"
          :content="dailyGoalsExplained"
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
        "每周目标：",
        "Weekly goals: "
      ) }}
        {{ targetWordContOfWeek }}
        <SetValue @set-value="weekGoalChange" :default-data="targetWordContOfWeek" />

      </p>
      <el-progress :percentage="weekProgress" :status="weekProgress>=100 ?'success':''" />
      <p class="goals">
        {{ $t(
        "每月目标：",
        "Monthly goals: "
      ) }}{{ targetWordContOfDay * dayCountOfMonth }}
        <el-tooltip
          class="box-item"
          :effect="tooltipEffi"
          :content="weekGoalsExplained"
          placement="top"
        >
          <el-icon>
            <Warning />
          </el-icon>
        </el-tooltip>
      </p>
      <el-progress :percentage="monthProgress" :status="monthProgress>=100 ?'success':''" />
    </div>


  </el-config-provider>
</template>

<script lang="ts" setup>
// import "element-plus/theme-chalk/dark/css-vars.css";
// import 'element-plus/theme-chalk/dark/css-vars.css'

// 国际化¬
import { ElConfigProvider } from "element-plus";
import store from "@/data/Store";
import { computed, ref, watch, onBeforeUnmount } from "vue";


import { useDark, useToggle } from "@vueuse/core";
import moment from "moment/moment";
import SetValue from "@/ui/calendar/SetValue.vue";
import { DailyStatisticsDataManagerInstance } from "@/data/StatisticsDataManager";
import { Check, Warning } from "@element-plus/icons-vue";
import "element-plus/theme-chalk/dark/css-vars.css";

import { i18nG } from "@/globals";


// 获取当前主题模式
const isDark = useDark();
isDark.value = document.body.classList.contains("theme-dark");
useToggle(isDark);
let tooltipEffi = isDark ? "light" : "dark";

// 创建一个MutationObserver实例
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      isDark.value = document.body.classList.contains("theme-dark");
      // console.log("Is dark theme active?", isDark);
    }
  });
});
// 配置观察选项
const config = { attributes: true, attributeFilter: ["class"] };
// 观察body元素
observer.observe(document.body, config);
onBeforeUnmount(() => {
  // console.info('组件即将销毁');
  observer.disconnect();
  // 执行一些清理工作，比如取消网络请求、移除事件监听器等
});

// 日期
const day = ref(new Date());
const yearMon = moment(day.value).format("YYYY-MM");
store.commit("updateMonth", yearMon);

const monthCounts = computed(() => {
  return store.getters.dayCounts || {};
});
// // console.info("monthCounts", monthCounts.value);


watch(day, (newValue) => {
  // // console.info("newValue", newValue);
  const yearMon = moment(newValue).format("YYYY-MM");
  store.commit("updateMonth", yearMon);
  // // console.info("monthCounts", monthCounts.value);
  // // console.info("monthCounts.value[2024-06-30]", monthCounts.value["2024-06-30"] ||0);
});


//======== 计划目标变更

const weekGoalChangeFlag = ref(1);
const weekGoalChange = (data: number) => {
  // console.info("weekGoalChange, data is ", data);
  const weekCount = moment(day.value).week();
  const year = moment(day.value).format("YYYY");
  const yearWeek = year + "_" + weekCount;
  // console.info(data); // 接收来自子组件的数据
  DailyStatisticsDataManagerInstance.data.weeklyPlan[yearWeek] = data;
  DailyStatisticsDataManagerInstance.saveStatisticsData();
  weekGoalChangeFlag.value++;
};


let currentMon = ref(moment(day.value).format("YYYY-MM"));
// 通过周计划，计算出每日目标与每月目标
// 先获取当前月份，然后获取当前月份起始日期he
watch(day, (newValue) => {
  const newMon = moment(newValue).format("YYYY-MM");
  if (currentMon.value != newMon) {
    currentMon.value = newMon;
  }
});

const dailyGoals = computed(() => {
  // console.info("dailyGoals computed");
  if (weekGoalChangeFlag.value > 0) {
    // console.info("weekGoalChangeFlag is " + weekGoalChangeFlag.value);
  }
  let dailyGoals: Record<string, number> = {};
  // 获取上一个月的第一天
  const prevMonthStart = moment(currentMon.value).subtract(1, "month").startOf("month").dayOfYear();
  // 获取下一月的最后一天
  const nextMonthEnd = moment(currentMon.value).add(1, "month").endOf("month").dayOfYear();
  // 找出之间每一天的周数，然后计算每日目标
  for (let i = prevMonthStart; i <= nextMonthEnd; i++) {
    const date = moment().dayOfYear(i);
    let weekCount = date.week();
    const number = getGoalOfWeek(date.format("YYYY"), weekCount);
    dailyGoals[date.format("YYYY-MM-DD")] = Math.floor(number / 7);
  }
  // console.info("dailyGoals", dailyGoals);
  return dailyGoals;
});

// 获取每周的目标，如果当前周不存在目标，则获取上一周的目标，直至找到目标。如果本年度都没有设置目标，则返回 0
function getGoalOfWeek(year: string, weekCount: number) {
  if (weekCount <= 0) {
    return 0;
  }
  const number = DailyStatisticsDataManagerInstance.data.weeklyPlan[year + "_" + weekCount];
  if (number != undefined) {
    return number;
  }
  // 获取上一周的目标，
  return getGoalOfWeek(year, weekCount - 1);
}


const dailyGoalsExplained = i18nG.instance(
  "每日目标 = 每周目标 / 7",
  "Daily Goal = Weekly Goal / 7"
);

const weekGoalsExplained = i18nG.instance(
  "每月目标 = 每日目标 * 当月天数",
  "Monthly Goal = Daily Goal * Days in the Month"
);

// 本日目标
const targetWordContOfDay = computed(() => {
  // // console.info("targetWordContOfDay computed");
  return dailyGoals.value[moment(day.value).format("YYYY-MM-DD")] || 0;
});

// 本周目标
const targetWordContOfWeek = computed(() => {
  // console.info("targetWordContOfWeek computed");
  return targetWordContOfDay.value * 7;
});

// 获取指定月份的总天数
const dayCountOfMonth = computed(() => {
  return moment(currentMon.value).daysInMonth();
});


//==============
// 进度条

// 每日进度
const dayProgress = computed(() => {
  // console.info("dayProgress computed, targetWordContOfDay is " + targetWordContOfDay.value);
  const today = moment(day.value).format("YYYY-MM-DD");
  const dayCount = monthCounts.value[today] || 0;
  if (dayCount == 0 || targetWordContOfDay.value == 0) {
    return 0;
  }
  let progress = Math.floor(dayCount / targetWordContOfDay.value * 100);
  return progress > 100 ? 100 : progress;
});

// 本周进度
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
  // // console.info("weekCount", weekCount);
  const weekGoal = targetWordContOfDay.value * 7;
  if (weekCount == 0 || weekGoal == 0) {
    return 0;
  }
  const progress = Math.floor((weekCount / weekGoal) * 100);
  // // console.info("weekCount progress", progress);
  return progress > 100 ? 100 : progress;
});

// 本月进度
const monthProgress = computed(() => {
  const today = moment(day.value).format("YYYY-MM-DD");
  const monthCount = Object.keys(monthCounts.value).reduce((acc, key) => {
    const date = moment(key);
    if (date.isSame(today, "month")) {
      acc += monthCounts.value[key] || 0;
    }
    return acc;
  }, 0);
  const monthGoal = targetWordContOfDay.value * dayCountOfMonth.value;
  if (monthCount == 0 || monthGoal == 0) {
    return 0;
  }
  const progress = Math.floor((monthCount / monthGoal) * 100
  );
  return progress > 100 ? 100 : progress;
});


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


.goals {
  /*让子项居中*/
  display: flex;
  align-items: center;
}

.el-icon {
  margin-left: 6px;
  margin-right: 6px;
}
</style>
