<template>
  <el-button plain @click="dialogVisible = true">
    Click to open the Dialog
  </el-button>

  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :show-close=false
    @closed="Close"
    width="500">


    <template #footer>

      <el-input-number v-model="num" :min="1" :max="10" @change="handleChange" />
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
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
import { defineEmits, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { i18nG } from "@/globals";

const dialogVisible = ref(false);
const num = ref(1);
const handleChange = (value: number) => {
  console.log(value);
};


const title = i18nG.instance(
  "设定目标",
  "Set a goal"
);

const Close = () => {
  console.info("Close");
};

// const handleClose = (done: () => void) => {
//   ElMessageBox.confirm("Are you sure to close this dialog?")
//     .then(() => {
//       done();
//       emit("childEvent", childData.value);
//     })
//     .catch(() => {
//       // catch error
//     });
// };

const childData = ref("Data from child");
const emit = defineEmits(["childEvent"]);

// function handleClick() {
//   emit('childEvent', childData.value);
// }
</script>
