// store.ts
import { createStore } from "vuex";
import moment from "moment/moment";

interface StatisticsData {
  // // yyyy-mm
  month: string;
  dayCounts: Record<string, number>;
  targetWordCont: number;
}


const store = createStore<StatisticsData>({


  state: {
    month: "2024-01",
    dayCounts: {},
    targetWordCont: 1000
  },
  getters: {

    // 返回当前月份与前后各一个月的数据
    dayCounts(state) {
      // console.info("getByMonth", state.month, state.dayCounts);
      // return state.dayCounts;

      moment(state.month);
      // 获取指定月份的上一月和下一月
      const prevMonth = moment(state.month).subtract(1, "month").format("YYYY-MM");
      const nextMonth = moment(state.month).add(1, "month").format("YYYY-MM");

      const monthData: Record<string, number> = {};
      for (const date in state.dayCounts) {
        if (date.startsWith(state.month) || date.startsWith(prevMonth) || date.startsWith(nextMonth)) {
          monthData[date] = state.dayCounts[date];
        }
      }
      // console.info("getByMonth", state.month, monthData);
      return monthData;
    },

    targetWordCont(state) {
      return state.targetWordCont;
    }

  },
  mutations: {


    updateMonth(state, month: string) {
      state.month = month;
    },

    updateStatisticsData(state, dayCounts: Record<string, number>) {
      state.dayCounts = { ...dayCounts };
      // console.info("updateStatisticsData:", state.dayCounts);
    },

    updateTargetWordCont(state, targetWordCont: number) {
      state.targetWordCont = targetWordCont;
    }

  }
});

export default store;
