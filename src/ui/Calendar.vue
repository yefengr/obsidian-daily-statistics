<template>
  <el-config-provider :locale="zhCn">

    <el-calendar>
      <template #date-cell="{ data }">
        <p :class="data.isSelected ? 'is-selected' : ''">
          {{ data.day.split("-").slice(1).join("-") }}
          {{ data.isSelected ? "✔️" : "" }}
        </p>
      </template>

    </el-calendar>
  </el-config-provider>


  <!--  <button @click="toggleDark()">-->
  <!--&lt;!&ndash;    <i inline-block align-middle i="dark:carbon-moon carbon-sun" />&ndash;&gt;-->

  <!--    <span class="ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>-->
  <!--  </button>-->
</template>

<script lang="ts" setup>
import "element-plus/theme-chalk/dark/css-vars.css";
// 国际化¬
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";



</script>


<style>
.is-selected {
  color: #1989fa;
}


</style>
