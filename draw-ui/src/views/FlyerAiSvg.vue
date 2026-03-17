<script setup>
import {nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import FlyerRight from "./FlyerRight.vue";
import {message} from "ant-design-vue";

const props = defineProps({
  width:Number,
  height:Number,
})
const toolData = reactive({
  type:'',
  fill:'',
  stroke:'',
  strokeWidth:0,
  fontFamily:'黑体',
  fontSize:26,
  svgWidth:800,
  svgHeight:600,
  background:'#ffffff',
  backgroundFlag:true
})

const toolUpdate = (data) => {
  toolData.type = data.type;
  toolData.fontSize = data.fontSize
  toolData.fill = data.fill
  toolData.stroke = data.stroke
  toolData.strokeWidth = data.strokeWidth
  toolData.fontFamily = data.fontFamily||'黑体'
  toolData.svgWidth = data.svgWidth
  toolData.svgHeight = data.svgHeight
  toolData.background = data.background
  toolData.backgroundFlag = data.backgroundFlag
  if (data.clearSvg === 1) {
    clearSvg()
    data.clearSvg = null
    data.clearSvg = 0
  }
  if (data.exportPng === 1) {
    exportPng()
    data.exportPng = null;
    data.exportPng = 0
  }
  if (data.saveDraw === 1) {
    localStorage.setItem("historyDraw", JSON.stringify(drawList.value))
    localStorage.setItem("historyTool", JSON.stringify(toolData))
    message.success('暂存成功')
    data.saveDraw = 0;
  }
}

const mutationCallback = () => {
  const svgString = new XMLSerializer().serializeToString(svgRef.value);
  // 2. 将SVG转为DataURL（base64）
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  emits('changeImage', svgDataUrl)
  if ((Date.now() - timer.time) > 1000 * 10) {// 超过30秒 自动停止定时器 避免页面卡顿
      clearTimer()
  }
}
let timer = {
  time:null,
  obj:null
}
const syncLeftSlider = () => {
  if (timer.obj != null) {
    //有操作了 重新计时
    timer.time = Date.now()
    return;
  }
  timer.time = Date.now()
  timer.obj = setInterval(mutationCallback, 60)
}
const clearTimer = () => {
  if (timer.obj) {
    clearInterval(timer.obj)
    timer.obj = null;
    timer.time = null;
  }
}
onMounted(() => {
  const historyDrawStr = localStorage.getItem('historyDraw')
  if (historyDrawStr) {
    drawList.value = JSON.parse(historyDrawStr)
    nextTick(()=> {
      mutationCallback()
    })
  }
})
onUnmounted(() => {
  document.removeEventListener('click',dblclick)
  document.removeEventListener('keyup',keyup)
  document.removeEventListener('keydown',keydown)

})

</script>

<template>
  <div ref="bodyRef" style="position: relative;padding: 0;z-index: 999;width:100%;height: 100%;/* 核心居中样式 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */">
    <div  style="position: relative;padding: 0;border:1px solid #333;/* 核心居中样式 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */" :style="{width:toolData.svgWidth+ 'px', height:toolData.svgHeight + 'px'}">
      <svg ref="svgRef" :style="{width:'100%', height:'100%'}"
           @mousedown="mousedown"
           @mouseup="mouseup"
           @mousemove="mousemove"
      >

        <rect v-if="toolData.backgroundFlag" :x="0" :y="0" :width="toolData.svgWidth" :height="toolData.svgHeight" :fill="toolData.background"></rect>


        <g v-for="d in drawList">
          <circle v-if="d.type === 'circle'"
                  :id="d.id"
                  :key="d.id"
                  :r="d.r"
                  :cx="d.x"
                  :cy="d.y"
                  :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move', opacity:(current.selected?.id === d.id ? 1 : 0.8) }"
          />

          <ellipse
              v-if="d.type === 'ellipse'"
              :id="d.id"
              :key="d.id"
              :rx="d.rx"
              :ry="d.ry"
              :cx="d.x"
              :cy="d.y"
              :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move', opacity:(current.selected?.id === d.id ? 1 : 0.8) }" />

          <rect :id="d.id" v-if="d.type === 'rect'" :width="d.width" :height="d.height" :x="d.x" :y="d.y" :rx="d.rx" :ry="d.ry"
                :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move' , opacity:(current.selected?.id === d.id ? 1 : 0.8)}"></rect>

          <polygon :id="d.id" v-if="d.type === 'polygon'" :points="d.points.join(' ')"
                   :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move' , opacity:(current.selected?.id === d.id ? 1 : 0.8)}"
          />

          <polyline
              :id="d.id" v-if="d.type === 'polyline'" :points="d.points.join(' ')"
              :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: 'none', cursor: 'move' , opacity:(current.selected?.id === d.id ? 1 : 0.8)}" />

          <line :id="d.id" v-if="d.type === 'line' && !d.hide" :x1="d.x1" :y1="d.y1" :x2="d.x2||d.x1" :y2="d.y2||d.y1" :style="{stroke:d.stroke,strokeWidth:d.strokeWidth,cursor: 'move' }" />
          <foreignObject v-if="d.type === 'text'" :width="(toolData.svgWidth|| (width * 20 / 24))" :height="(toolData.svgHeight|| (height - 60))" :id="'B' + d.id" style="pointer-events: none">
            <div class="text-editor" :contenteditable="current.drawing?.id === d.id" :id="d.id"
                 :style="{
            position:'absolute',pointerEvents: 'auto', userSelect:'none',cursor: 'move',padding:'5px',minWidth:'5px',
            textAlign:'left', left:d.x - d.fontSize/2 +'px', top:d.y - d.fontSize/2 +'px', lineHeight:1.5, fontSize:d.fontSize + 'px',
            color:d.fill,fontFamily:d.fontFamily, opacity:(current.selected?.id === d.id ? 1 : 0.8)
          }"
            >{{d.text}}</div>
          </foreignObject>
        </g>

      </svg>


    </div>
    <div style="display: none;border:1px solid #fff;" :style="{width:toolData.svgWidth + 'px', height:toolData.svgHeight + 'px'}">
      <canvas ref="canvasRef" :width="toolData.svgWidth" :height="toolData.svgHeight"></canvas>
    </div>
  </div>
  <FlyerRight ref="flyerRightRef"></FlyerRight>
</template>

<style scoped>
.text-editor:focus {
  border:none;
}
</style>