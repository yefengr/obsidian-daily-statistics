// store.ts
import { createStore } from "vuex";

interface StatisticsData {
  // // yyyy-mm
  month: string;
  dayCounts: Record<string, number>;
}


const store = createStore<StatisticsData>({


  state: {
    month: "2024-01",
    dayCounts: {}
  },
  getters: {

    getByMonth(state) {
      console.info("getByMonth", state.month, state.dayCounts);
      // return state.dayCounts;

      const monthData: Record<string, number> = {};
      for (const date in state.dayCounts) {
        if (date.startsWith(state.month)) {
          monthData[date] = state.dayCounts[date];
        }
      }
      return monthData;
    }

  },
  mutations: {


    updateMonth(state, month: string) {
      state.month = month;
    },

    updateStatisticsData(state, dayCounts: Record<string, number>) {
      // console.info("updateStatisticsData", dayCounts, state.month, state.dayCounts);
      state.dayCounts = dayCounts;
    }

  }
});

export default store;
