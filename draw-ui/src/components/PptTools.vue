<template>
  <a-select
      v-model:value="data.type"
      :allowClear="true"
      style="width: 100px"
      placeholder="选择形状"
      :options="options"
      @change="(e) => $emit('drawChange', data)"
  ></a-select>
  <a-input type="color" v-model:value="data.fillColor" style="width: 100px" @change="(e) => $emit('drawChange', data)"></a-input>
  <a-input type="color" v-model:value="data.strokeColor" style="width: 100px" @change="(e) => $emit('drawChange', data)"></a-input>
  <a-input type="number" v-model:value="data.fontSize" style="width: 100px" @change="(e) => $emit('drawChange', data)"></a-input>
  <a-button @click="emits('clearSvg')">清空画布</a-button>
  <a-button @click="emits('exportPng')">导出PNG</a-button>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
const emits = defineEmits(["drawChange", 'clearSvg'])

const options = reactive([
  {value:'circle', label:'圆'},
  {value:'rect', label:'矩形'},
  {value:'polygon', label:'多边形'},
  {value:'text', label:'文本'},
])
const value = ref()
const fillColor = ref()
const strokeColor = ref()
const fontSize = ref()
const data = reactive({
  type:'',
  fillColor:'',
  strokeColor:'',
  fontSize:20,
})

onMounted(()=> {
  data.type = 'circle'
  data.fillColor = '#00ff00'
  data.strokeColor = '#0000ff'
  data.fontSize = 20;
  emits("drawChange", data)
})
</script>