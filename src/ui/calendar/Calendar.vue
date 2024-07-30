<template>

  <el-dialog
    align-center
    v-model="dialogVisible"
    :title="$t('modifyWordCount')"
    :show-close=false
    width="300">
    <template #default>
      <el-input-number :controls="false" v-model="wordCountPerDay" :min="0" :max="100000" />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          {{ $t("Cancel") }}
        </el-button>
        <el-button @click="confirm">
          {{ $t("Confirm") }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-calendar v-model="day">
    <template #date-cell="{ data }">
      <div @dblclick="setNum(data.day)" class="div-container">
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
import { Notice } from "obsidian";
import { useI18n } from "vue-i18n";


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


/**
 * 设置每天的字数
 * @param day
 */
const dialogVisible = ref(false);
const wordCountPerDay = ref(0);

const { t } = useI18n() // t方法取出，t('code')使用

const setNum = (day: string) => {
  // 判断日期，如果时间超过当日，则不能设置
  if (moment(day).isAfter(moment(), "day")) {
    new Notice(t("modifyWordCountNotice"));
    return;
  }


  dialogVisible.value = true;
  wordCountPerDay.value = dayCount.value[day] || 0;
};

const confirm = () => {
  dialogVisible.value = false;
  // console.info("confirm", wordCountPerDay.value);
  const dayFormat = moment(day.value).format("YYYY-MM-DD");
  store.commit("updateDayCounts", { [dayFormat]: wordCountPerDay.value })
  ;
};


</script>


<style>
.is-selected {
  color: #1989fa;
}

.div-container {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: stretch; /* 使子元素垂直方向上填充容器空间 */
  flex-direction: column; /* 改变子元素的方向为垂直 */
  height: 100%; /* 占满高度 */
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
