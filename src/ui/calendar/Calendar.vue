<template>

  <el-calendar v-model="day">
    <template #date-cell="{ data }">

      <div class="flex-centered">
        <p>
          {{ data.date.getDate() }}
        </p>
      </div>

      <div class="flex-centered2">
        <p>
          {{ dayCount[data.day] || 0 }}
        </p>
      </div>
      <div class="flex-centered3 ">
        <p>

          <el-icon v-if="((dayCount[data.day] || 0) > dayPlan[data.day]) && dayPlan[data.day] > 0">
            <Check />
          </el-icon>

        </p>
      </div>
    </template>

  </el-calendar>

</template>

<script lang="ts" setup>
import store from "@/data/Store";
import { computed, ref, watch } from "vue";


import moment from "moment/moment";
import { Check } from "@element-plus/icons-vue";
import "element-plus/theme-chalk/dark/css-vars.css";


// 日期
const day = ref(new Date());
const yearMon = moment(day.value).format("YYYY-MM");
store.commit("updateMonth", yearMon);
store.commit("updateDay", moment(day.value).format("YYYY-MM-DD"));


let currentMonNow = moment(day.value).format("YYYY-MM");

watch(day, (newValue) => {
  // // // console.log("newValue", newValue);
  store.commit("updateDay", moment(newValue).format("YYYY-MM-DD"));
  const yearMon = moment(newValue).format("YYYY-MM");
  if (currentMonNow != yearMon) {
    store.commit("updateMonth", yearMon);
    currentMonNow = yearMon;
  }
});

const dayCount = computed(() => {
  return store.getters.threeMonthsData || {};
});

const dayPlan = computed(() => {
  return store.getters.threeMonthsDayPlan || {};
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
