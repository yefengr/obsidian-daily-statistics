<template>
  <!--  <el-button :bg="false" :plain=true size="small" :icon="Edit" @click="dialogVisible = true" />-->
  <el-icon id="edit-icon">
    <Edit @click="dialogVisible = true" />
  </el-icon>
  <el-dialog
    align-center
    v-model="dialogVisible"
    :title="title"
    :show-close=false
    width="300">

    <template #default>
      <el-input-number :controls="false" v-model="num" :min="7" :max="20000" />


    </template>


    <template #footer>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          {{ $t(
          "取消",
          "Cancel"
        ) }}
        </el-button>
        <el-button @click="confirm">
          {{ $t(
          "确定",
          "Confirm"
        ) }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, defineEmits, ref, watch } from "vue";
import { i18nG } from "@/globals";

import { Edit } from "@element-plus/icons-vue";

// // 获取当前主题模式
// const isDark = useDark();
// useToggle(isDark);

const emit = defineEmits(["setValue"]);
const dialogVisible = ref(false);

const props = defineProps(["defaultData"]);
const defaultData = computed(() => props.defaultData || 0);
const num = ref(defaultData.value);

watch(defaultData, (newValue) => {
  num.value = newValue;
});

const title = i18nG.instance(
  "设定目标",
  "Set a goal"
);

const confirm = () => {
  dialogVisible.value = false;
  emit("setValue", num.value);
};

</script>

<style>


.el-icon {
  margin-left: 6px;
}

/* 定义鼠标悬停时的样式 */
#edit-icon:hover {
  color: #1989fa;
}

input[type='number'] {
   background: unset;
   border: unset;

}
.el-input-number.is-without-controls .el-input__wrapper {
 padding: unset;
}

.el-input__wrapper.is-focus{
  box-shadow:unset;
}

.el-dialog__body {
  /*让子项居中*/
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */

}
</style>
