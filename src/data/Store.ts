// Store.ts
import { createStore } from "vuex";
import moment from "moment/moment";
import { DailyStatisticsDataManagerInstance } from "@/data/StatisticsDataManager";

interface StatisticsData {
  // // yyyy-mm
  currentDay: string;
  currentMonth: string;
  // 每日统计
  dayCounts: Record<string, number>;
  // 周计划
  weeklyPlan: Record<string, number>;
}


function getGoalOfWeek(weeklyPlan: Record<string, number>, year: string, weekCount: number) {
  if (weekCount <= 0) {
    return 0;
  }
  const number = weeklyPlan[year + "_" + weekCount];
  if (number != undefined) {
    return number;
  }
  // 获取上一周的目标，
  return getGoalOfWeek(weeklyPlan, year, weekCount - 1);
}

const store = createStore<StatisticsData>({


  state: {
    currentDay: "2024-01-01",
    currentMonth: "2024-01",
    dayCounts: {},
    weeklyPlan: {}
  },
  getters: {

    currentDay(state) {
      return state.currentDay;
    },

    month(state) {
      return state.currentMonth;
    },

    // 返回当前月份与前后各一个月的数据
    threeMonthsData(state) {
      // // // console.log("getByMonth", state.month, state.dayCounts);
      // return state.dayCounts;

      // 获取指定月份的上一月和下一月
      const prevMonth = moment(state.currentMonth).subtract(1, "month").format("YYYY-MM");
      const nextMonth = moment(state.currentMonth).add(1, "month").format("YYYY-MM");

      const monthData: Record<string, number> = {};
      for (const date in state.dayCounts) {
        if (date.startsWith(state.currentMonth) || date.startsWith(prevMonth) || date.startsWith(nextMonth)) {
          monthData[date] = state.dayCounts[date];
        }
      }
      // // // console.log("getByMonth", state.month, monthData);
      return monthData;
    },


    // 获取本周目标
    weeklyGoal(state) {
      const weekCount = moment(state.currentDay).week();
      return getGoalOfWeek(state.weeklyPlan, moment().format("YYYY"), weekCount);
    },


    /**
     * 三个月内的每日计划
     * @param state
     */
    threeMonthsDayPlan(state) {
      const dailyGoals: Record<string, number> = {};
      // 获取上一个月的第一天
      const prevMonthStart = moment(state.currentMonth).subtract(1, "month").startOf("month").dayOfYear();
      // 获取下一月的最后一天
      const nextMonthEnd = moment(state.currentMonth).add(1, "month").endOf("month").dayOfYear();
      // 找出之间每一天的周数，然后计算每日目标
      for (let i = prevMonthStart; i <= nextMonthEnd; i++) {
        const date = moment().dayOfYear(i);
        const weekCount = date.week();
        const number = getGoalOfWeek(state.weeklyPlan, date.format("YYYY"), weekCount);
        // console.info("dailyGoals", date.format("YYYY-MM-DD"), "weekCount", weekCount, number);
        dailyGoals[date.format("YYYY-MM-DD")] = Math.floor(number / 7);
      }
      // console.log("dailyGoals", dailyGoals);
      return dailyGoals;
    },

    // 获取每月目标
    monthlyGoal(state) {
      let monthlyGoal = 0;
      // 获取当前月份的第一天
      const monthStart = moment(state.currentMonth).startOf("month").dayOfYear();
      // 获取当前月份的最后一天
      const monthEnd = moment(state.currentMonth).endOf("month").dayOfYear();
      // 找出每一天的目标，进行累加
      for (let i = monthStart; i <= monthEnd; i++) {
        const date = moment().dayOfYear(i);
        const weekCount = date.week();
        const number = getGoalOfWeek(state.weeklyPlan, date.format("YYYY"), weekCount);
        // console.log("monthlyGoal", date.format("YYYY-MM-DD"), "weekCount", weekCount, number / 7);
        monthlyGoal += Math.floor(number / 7);
      }
      // console.log("month is ", state.currentMonth, "monthlyGoal", monthlyGoal, "monthStart is ", moment().dayOfYear(monthStart).format("YYYY-MM-DD"), "monthEnd is ", moment().dayOfYear(monthEnd).format("YYYY-MM-DD"));
      return monthlyGoal;
    }


  },
  mutations: {

    updateDay(state, day: string) {
      // console.log("updateDay", day);
      state.currentDay = day;
    },

    updateMonth(state, month: string) {
      state.currentMonth = month;
    },

    updateStatisticsData(state, dayCounts: Record<string, number>) {
      state.dayCounts = { ...dayCounts };
    },


    updateWeeklyPlan(state, weeklyPlan: Record<string, number>) {
      // console.log("updateWeeklyPlan, weeklyPlan is ", weeklyPlan);
      const assign = Object.assign(
        state.weeklyPlan,
        weeklyPlan
      );
      state.weeklyPlan = { ...assign };

      // console.log("updateWeeklyPlan, state.weeklyPlan is ", state.weeklyPlan.toString());


      DailyStatisticsDataManagerInstance.data.weeklyPlan = state.weeklyPlan;
      DailyStatisticsDataManagerInstance.saveStatisticsData().then();
    },

    // 更新每日字数
    updateDayCounts(state, dayCounts: Record<string, number>) {
      // 获取dayCounts 第一个属性的名称
      const day = Object.keys(dayCounts)[0];
      // 如果修改的时间是当前日期，需要单独做处理，记录在已有字数基础上，变更的数字
      if (moment(day).isSame(moment(), "day")) {
        DailyStatisticsDataManagerInstance.updateCurrentWordCount(dayCounts[day]);
      }

      const assign = Object.assign(
        state.dayCounts,
        dayCounts
      );
      state.dayCounts = { ...assign };
      DailyStatisticsDataManagerInstance.data.dayCounts = state.dayCounts;
      DailyStatisticsDataManagerInstance.saveStatisticsData().then();
    }


  }
});

export default store;
