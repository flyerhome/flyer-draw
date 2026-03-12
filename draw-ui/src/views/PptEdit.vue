<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import PptTools from "../components/PptTools.vue";
import FlySvg from "../components/FlySvg.vue";
const sliders = reactive([
  { width:200, height:100, stroke:"white", fill:"lightblue"},
  { width:200, height:100, stroke:"white", fill:"white"},
  { width:200, height:100, stroke:"white", fill:"white"},
  { width:200, height:100, stroke:"white", fill:"white"},
])
const contextMenu = ref({
  show: false,    // 是否显示菜单
  x: 0,           // 菜单X坐标
  y: 0,           // 菜单Y坐标
  targetId: null  // 目标圆形ID
});
const showContextMenu = (e) => {
  e.preventDefault(); // 阻止浏览器默认右键菜单
  e.stopPropagation()

  if (drawFlag.value || drawingId.value) {
    return;
  }
  // 设置菜单位置和目标ID
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY
  };
}
const shiftFlag = ref(false)
const drawType = ref()
const drawFillColor = ref()
const drawStrokeColor = ref()
const drawFontSize = ref()
const drawFlag = ref(false)
const drawingId = ref()
const drawList = ref([])
// 获取SVG元素引用
const svgEl = ref();
const clearSvg = () => {
  svgEl.value.clearSvg();
}
const exportPng = (e) => {

}
const drawChange = (data) => {
  drawType.value = data.type
  drawFillColor.value = data.fillColor
  drawStrokeColor.value = data.strokeColor
  drawFontSize.value = data.fontSize
}

const width = ref(2000)
const height = ref(1000)
onMounted(() => {
  width.value = document.body.clientWidth - 60
  height.value = document.body.clientHeight - 60
})
window.onresize = () => {
  console.log("resize................")
  width.value = document.body.clientWidth - 60
  height.value = document.body.clientHeight - 60
}
</script>

<template>
  <div style="width:100%;height: 100%;padding:0;background-color: #dddddd;">
  <a-row :gutter="[10,10]" style="padding: 5px;border-bottom: 1px solid #bbbbbb">
    <a-col :span="24">
      <PptTools
          @drawChange="(data) => drawChange(data)"
          @clearSvg="clearSvg"
          @exportPng="exportPng"
      ></PptTools>
    </a-col>
  </a-row>
  <a-row :gutter="[10,10]" style="padding: 5px">
    <a-col :span="4" style="border-right:1px solid #bbbbbb;">
      <svg :width="width * 4 / 24" :height="height - 60">
        <text v-for="(slider,index) in sliders"  :x="0" :y="slider.height * (index+0.2) + 10 * index" fill="#666666" >{{index + 1}} </text>
        <rect v-for="(slider,index) in sliders" :x="20" :y="slider.height * (index) + 10 * index" :width="slider.width" :height="slider.height" :stroke="slider.stroke" :fill="slider.fill"></rect>
      </svg>
    </a-col>
    <a-col :span="20" style="padding: 10px">
      <FlySvg ref="svgEl" :draw-list="drawList"
              :width="width" :height="height - 30"
              :type="drawType"
              :fill="drawFillColor"
              :stroke="drawStrokeColor"
              :font-size="drawFontSize"
      ></FlySvg>
    </a-col>
  </a-row>
  </div>
</template>


<style scoped>
/* 右键菜单样式 */
.context-menu {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 80px;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 6px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.context-menu li:hover {
  background-color: #f3f4f6;
}
</style>