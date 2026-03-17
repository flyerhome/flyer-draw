<template>
  <a-row>

    <a-col :span="4">
      <a-form-item
          label="画布大小"
          name="stroke"
      >
        <a-input type="number" v-model:value="data.svgWidth" style="width: 80px" @change="(e) => $emit('drawChange', data)"></a-input>
        <span> * </span>
        <a-input type="number" v-model:value="data.svgHeight" style="width: 80px" @change="(e) => $emit('drawChange', data)"></a-input>
        <span> px</span>
      </a-form-item>
    </a-col>
    <a-col :span="5">
      <a-button @click="(e) => {data.saveDraw = 1;$emit('drawChange', data)}">暂存</a-button>
      <a-button @click="(e) => {data.clearSvg = 1;$emit('drawChange', data)}">清空画布</a-button>
      <a-button @click="(e) => {data.exportPng = 1;$emit('drawChange', data)}">导出PNG</a-button>
    </a-col>
  </a-row>



</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
const emits = defineEmits(["drawChange", 'clearSvg'])
const props = defineProps({
  width:Number,
  height:Number,
  toolsData:{
    type:Object,
    default:{}
  }
})
const options = reactive([
  {value:'circle', label:'圆'},
  {value:'ellipse', label:'椭圆'},
  {value:'rect', label:'矩形'},
  {value:'line', label:'直线'},
  {value:'polyline', label:'折线'},
  {value:'polygon', label:'多边形'},
  {value:'text', label:'文本'},
])
const data = reactive({
  type:'circle',
  fill:'#00ff00',
  stroke:'#0000ff',
  fontSize:26,
  strokeWidth:1,
  svgWidth:1200,
  svgHeight:1000,
  backgroundFlag:true,
  background:'#ffffff',
  aiDraw:'',
})

onMounted(()=> {
  const historyToolStr = localStorage.getItem('historyTool')
  if (historyToolStr) {
    const historyTool = JSON.parse(historyToolStr)
    if (historyTool) {
      data.type = historyTool.type
      data.fill = historyTool.fill
      data.stroke = historyTool.stroke
      data.fontSize = historyTool.fontSize;
      data.strokeWidth = historyTool.strokeWidth;
      data.svgWidth = historyTool.svgWidth
      data.svgHeight = historyTool.svgHeight
      data.background = historyTool.background
      data.backgroundFlag = historyTool.backgroundFlag
      emits("drawChange", data)
      return;
    }
  }
  // data.type = 'circle'
  /*data.fill = '#00ff00'
  data.stroke = '#0000ff'
  data.fontSize = 26;
  data.strokeWidth = 1;
  data.svgWidth = 1200
  data.svgHeight = 1000*/
  data.svgWidth = (props.width)
  data.svgHeight = (props.height)
  emits("drawChange", data)
})
</script>