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
  fontSize:26
})
const emits = defineEmits(["changeImage"])
const svgRef = ref();
const canvasRef = ref();
const flyerRightRef = ref();

const shiftFlag = ref(false)
const ctrlFlag = ref(false)
const altFlag = ref(false)
const enterFlag = ref(false)
const escFlag = ref(false)

const drawList = ref([])
const current = reactive({
  id:null,
  selected:null,
  drawing:null,
  move:null
})


const toolUpdate = (data) => {
  toolData.type = data.type;
  toolData.fontSize = data.fontSize
  toolData.fill = data.fill
  toolData.stroke = data.stroke
  toolData.strokeWidth = data.strokeWidth
  toolData.fontFamily = data.fontFamily||'黑体'
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


const transferPoint = (str) => {
  return {
    x:parseFloat(str.substring(0, str.indexOf(','))),
    y:parseFloat(str.substring(str.indexOf(',') + 1)),
  }
}
const drawCircle = (obj) => {
  if (obj.event === 'move') {
    obj.x = obj.startX + obj.toX - obj.mouseStartX
    obj.y = obj.startY + obj.toY - obj.mouseStartY
    return;
  }
  if (obj.event === 'mouseup') {
    const exist = current.drawing
    if (exist) {
      current.drawing = null;
    }
  }

  if (obj.event === 'mousemove') {
    const exist = current.drawing
    if (!!exist) {
      const dx = obj.moveX - exist.x;
      const dy = obj.moveY - exist.y;
      // 勾股定理算半径
      exist.r = Math.sqrt(dx * dx + dy * dy)
      return exist
    }
  }

  if (obj.event === 'mousedown') {
    obj.type = 'circle'
    obj.x = obj.startX
    obj.y = obj.startY
    obj.r = 0
    obj.fill = toolData.fill||'lightblue'
    obj.stroke = toolData.stroke||'green'
    obj.strokeWidth = toolData.strokeWidth
    drawList.value.push(obj)
    return obj;
  }
}
const drawRect = (obj) => {
  if (obj.event === 'move') {
    obj.x = obj.startX + obj.toX - obj.mouseStartX
    obj.y = obj.startY + obj.toY - obj.mouseStartY
    return;
  }
  if (obj.event === 'mouseup') {
    const exist = current.drawing;
    if (exist) {
      current.drawing = null;
    }
  }
  if (obj.event === 'mousemove') {
    const exist = current.drawing;
    if (!!exist) {
      let dx = obj.moveX - exist.startX;
      let dy = obj.moveY - exist.startY;
      if (dx <= 0) {
        exist.x = obj.moveX
      }
      if (dy <= 0) {
        exist.y = obj.moveY
      }
      exist.width = Math.abs(dx)
      exist.height = Math.abs(dy)
      if (!!shiftFlag.value) {
        exist.width = exist.height = Math.min(exist.width,exist.height)
        //重新计算x y
        if (dx <0) {
          exist.x = exist.startX - exist.width
        }
        if (dy < 0) {
          exist.y = exist.startY - exist.height
        }

      }
      return exist
    }
  }
  if (obj.event === 'mousedown') {
    obj.type = 'rect'
    obj.width = 0
    obj.height = 0
    obj.x = obj.startX
    obj.y = obj.startY
    obj.rx = 0
    obj.ry = 0
    obj.fill = toolData.fill||'lightblue'
    obj.stroke = toolData.stroke||'green'
    obj.strokeWidth = toolData.strokeWidth
    drawList.value.push(obj)
    return obj
  }

}
const drawLine = (obj) => {
  if (obj.event === 'end') {
    const exist = current.drawing;
    if (exist) {
      current.drawing = null;
      return;
    }
  }

  if (obj.event === 'move') {

    return;
  }

  if (obj.event === 'mouseup') {
    const exist = current.drawing;
    obj.hide = false;
    if (!obj.x1 || !obj.y1) {
      obj.x1 = obj.endX
      obj.y1 = obj.endY
    } else {
      obj.x2 = obj.endX
      obj.y2 = obj.endY
      current.drawing = null;
    }
    return exist;
  }
  if (obj.event === 'mousemove') {
    const exist = current.drawing;
    if (exist) {
      obj.x2 = obj.moveX
      obj.y2 = obj.moveY
    }
    return exist
  }
  if (obj.event === 'mousedown') {
    const exist = current.drawing;
    const filter = drawList.value.find(item => item.id === exist.id)
    if (!filter) {
      obj.type = 'line'
      obj.hide = true;
      // obj.x1 = obj.startX
      // obj.y1 = obj.startY
      //
      // obj.x2 = obj.startX
      // obj.y2 = obj.startY
      obj.fill = toolData.fill||'lightblue'
      obj.stroke = toolData.stroke||'green'
      obj.strokeWidth = toolData.strokeWidth
      drawList.value.push(obj)
      return obj;
    } else {

    }
  }
}
const drawPolygon = (obj) => {
  if (obj.event === 'end') {
    const exist = current.drawing;
    if (exist) {
      current.drawing = null;
      return;
    }
  }

  if (obj.event === 'move') {
    const points = obj.startPoints
    if (points) {
      for (let i = 0, len = points.length; i < len; i++) {
        const point = transferPoint(points[i])
        obj.points[i] = (point.x + obj.toX - obj.mouseStartX) + ',' + (point.y + obj.toY - obj.mouseStartY)
      }
    }
    return;
  }

  if (obj.event === 'mouseup') {
    const exist = current.drawing;
    if (exist.points.length === 0) {// 第一次添加
      exist.points.push(obj.endX +"," + obj.endY)
      exist.points.push(obj.endX +"," + obj.endY)
    } else {
      // 第二次添加 先修改上一个点
      exist.points[exist.points.length - 1] = obj.endX +"," + obj.endY
      exist.points.push(obj.endX +"," + obj.endY)
    }
    return exist;
  }
  if (obj.event === 'mousemove') {
    const exist = current.drawing;
    if (exist.points.length > 0) {
      exist.points[exist.points.length - 1] = obj.moveX +"," + obj.moveY
    }
    return exist
  }
  if (obj.event === 'mousedown') {
    const exist = current.drawing;
    const filter = drawList.value.find(item => item.id === exist.id)
    if (!filter) {
      obj.type = 'polygon'
      obj.points = []
      obj.fill = toolData.fill||'lightblue'
      obj.stroke = toolData.stroke||'green'
      obj.strokeWidth = toolData.strokeWidth
      drawList.value.push(obj)
      return obj;
    }
  }
}
const endDrawPolygon = () => {
  const exist = current.drawing;
  if (exist && exist.type === 'polygon') {
    if (escFlag.value) {
      exist.event = 'end'
      exist.points.pop();
      drawPolygon(exist)
    }
    if (enterFlag.value) {
      exist.event = 'end'
      drawPolygon(exist)
    }
  }
}
const drawText = (obj) => {
  if (obj.event === 'end') {
    const exist = current.drawing;
    if (exist) {
      current.drawing = null;
    }
  }

  if (obj.event === 'move') {
    obj.x = obj.startX + obj.toX - obj.mouseStartX
    obj.y = obj.startY + obj.toY - obj.mouseStartY
    return;
  }
  if (obj.event === 'mouseup') {

  }

  if (obj.event === 'mousemove') {

  }
  if (obj.event === 'mousedown') {
    obj.type = 'text'
    obj.x = obj.startX
    obj.y = obj.startY
    obj.text = ''
    obj.fontFamily = toolData.fontFamily ||"黑体"
    obj.fontSize = toolData.fontSize ||30
    obj.fill = toolData.fill||'lightblue'
    obj.strokeWidth = toolData.strokeWidth

    drawList.value.push(obj)
    nextTick(() => {
      setTimeout(()=> {
        current.id = obj.id
        const element = document.getElementById(obj.id);
        element.focus()
      },30)

    })
    return obj;
  }
}
const endDrawText = (e) => {
  const exist = current.drawing;
  if (exist && exist.type === 'text') {
    if (escFlag.value) {
      exist.event = 'end'
      exist.text = e.target.innerText
      drawText(exist)
    }
    if (enterFlag.value) {
      exist.event = 'end'
      exist.text = e.target.innerText
      drawText(exist)
    }
  }
}
const draw = (obj) => {
  syncLeftSlider()
  switch (obj.type) {
    case 'circle': drawCircle(obj);break;
    case 'rect': drawRect(obj);break;
    case 'polygon': drawPolygon(obj);break;
    case 'text': drawText(obj);break;
    case 'line': drawLine(obj);break;
    default:
  }
}
const unselect = () => {
  if (current.selected) {
    const selected = current.selected
    if (selected) {
      current.selected = null;
    }
  }
}
const selectedHanlder = (e, call) => {
  if (e.target.id) {
    const selected = drawList.value.find(item=> item.id === parseInt(e.target.id));
    if (!!!selected) {
      unselect()
      return false;
    }
    if (current.selected === selected) {
      if (!!!current.drawing) {
        current.move = null;
        flyerRightRef.value.show(selected)
      }
      return true;
    }
    unselect()
    current.selected = selected;
    return true
  }
  unselect()
  return false;
}
const checkSelected = (e) => {
  if (!!!current.drawing && e.target.id) {
    const selected = drawList.value.find(item=> item.id === parseInt(e.target.id))
    if (!!selected) {
      current.move = selected;
      if (selected.x) {
        current.move.startX = selected.x
      }
      if (selected.y) {
        current.move.startY = selected.y
      }
      const pt = createSVGPoint(e);
      current.move.mouseStartX = pt.x
      current.move.mouseStartY = pt.y
      if (current.move.points) {
        current.move.startPoints = JSON.parse(JSON.stringify(current.move.points))
      }
      current.move.moveFlag = false;
      return true;
    }
  }
  return false;
}
const mousedown = (e) => {
  if (checkSelected(e)) {
    return;
  }
  if (current.drawing) {
    // 大部分图形不应该在进入这个事件还有绘制中的状态 除非时多边形 需要
    return;
  }
  const pt = createSVGPoint(e);
  current.drawing = {
    id: Date.now(),
    startX:pt.x,
    startY:pt.y,
    type:toolData.type,
    event:'mousedown'
  }
  draw(current.drawing)
}
const mousemove = (e) => {
  if (current.drawing) {
    const pt = createSVGPoint(e);
    current.drawing.moveX = pt.x
    current.drawing.moveY = pt.y
    current.drawing.event = 'mousemove'
    draw(current.drawing)
  }
  if (current.move && !!!current.drawing) {
    const pt = createSVGPoint(e);

    current.move.toX = pt.x
    current.move.toY = pt.y
    current.move.moveFlag = true;
    current.move.event = 'move'
    draw(current.move);
  }

}


const mouseup = (e) => {
  if (current.drawing) {
    /*if (current.drawing.event === 'mousedown') {
      drawList.value.pop();
      current.drawing = null;
      current.selected = null;
    }*/
  }
  if (!!!current.drawing) {
    if (!!!current.move || !current.move.moveFlag) {
      selectedHanlder(e)
      return;
    }
  }
  if (current.move) {
    current.move = null;
    return
  }
  if (current.drawing) {
    const pt = createSVGPoint(e);
    current.drawing.endX = pt.x
    current.drawing.endY = pt.y
    current.drawing.event = 'mouseup'
    draw(current.drawing)
  } else {
    current.drawing = null;
  }
}
const updateText = (e) => {
  if ((ctrlFlag.value && enterFlag.value) || escFlag.value) {
    if (e.target.id) {
      const exist = drawList.value.find(item => item.id === e.target.id)
      if (exist && exist.type === 'text') {
        exist.text = e.target.innerText
      }
    }
  }

}
const noteKey = (e) => {
  if (e.key === 'Shift') {
    shiftFlag.value = true
  }
  if (e.key === 'Control') {
    ctrlFlag.value = true
  }
  if (e.key === 'Alt') {
    altFlag.value = true
  }
  if (e.key === 'Enter') {
    enterFlag.value = true
  }
  if (e.key === 'Escape') {
    escFlag.value = true
  }
}

const unNoteKey = (e) => {
  if (e.key === 'Shift') {
    shiftFlag.value = false
  }
  if (e.key === 'Control') {
    ctrlFlag.value = false
  }
  if (e.key === 'Alt') {
    altFlag.value = false
  }
  if (e.key === 'Enter') {
    enterFlag.value = false
  }
  if (e.key === 'Escape') {
    escFlag.value = false
  }
}


const keydown = (e) => {
  noteKey(e)
}

const keyup = (e) => {
  // 处理部分图形结束绘制事件
  endDrawPolygon()
  endDrawText(e)
  unNoteKey(e)
  syncLeftSlider()
}
const dblclick = (e) => {

}

document.addEventListener('dblclick', dblclick)
document.addEventListener('keyup', keyup)
document.addEventListener('keydown', keydown)

watch(() => current.selected, (selected) => {
  if (!!selected && !!!current.drawing) {
    current.move = null;
    flyerRightRef.value.show(selected)
  } else {
  }
})

const createSVGPoint = (e) => {
  const svgPoint = svgRef.value.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  return svgPoint.matrixTransform(svgRef.value.getScreenCTM().inverse())
}
const clearSvg = (e) => {
  drawList.value = []
  mutationCallback()
}
const exportPng = (e) => {
  const svgString = new XMLSerializer().serializeToString(svgRef.value);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const image = new Image(props.width * 20 / 24,props.height - 60)
  image.src = svgUrl
  image.crossOrigin = 'anonymous'; // 解决跨域渲染问题;
  image.onload = (e) => {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'flyerDraw.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 清理临时资源
    URL.revokeObjectURL(svgUrl);
  }
}
defineExpose({createSVGPoint,toolUpdate})

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
  <div style="position: absolute;border: 1px dashed gray;padding: 0;z-index: 999;" :style="{width:width * 20 / 24 + 'px'}">
    <svg ref="svgRef" :width="width * 20 / 24" :height="height - 60"
         @mousedown="mousedown"
         @mouseup="mouseup"
         @mousemove="mousemove"
    >

      <rect :x="0" :y="0" :width="width * 20 / 24" :height="height - 60" stroke="#666666" fill="#ffffff"></rect>


      <g v-for="d in drawList">
        <circle v-if="d.type === 'circle'"
                :id="d.id"
                :key="d.id"
                :r="d.r"
                :cx="d.x"
                :cy="d.y"
                :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move', opacity:(current.selected?.id === d.id ? 1 : 0.8) }"
        />
        <rect :id="d.id" v-if="d.type === 'rect'" :width="d.width" :height="d.height" :x="d.x" :y="d.y" :rx="d.rx" :ry="d.ry"
              :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move' , opacity:(current.selected?.id === d.id ? 1 : 0.8)}"></rect>

        <polygon :id="d.id" v-if="d.type === 'polygon'" :points="d.points.join(' ')"
                 :style="{ stroke: d.stroke, strokeWidth: d.strokeWidth, fill: d.fill, cursor: 'move' , opacity:(current.selected?.id === d.id ? 1 : 0.8)}"
        />
        <line :id="d.id" v-if="d.type === 'line' && !d.hide" :x1="d.x1" :y1="d.y1" :x2="d.x2||d.x1" :y2="d.y2||d.y1" :style="{stroke:d.stroke,strokeWidth:d.strokeWidth}" />
        <foreignObject v-if="d.type === 'text'" :width="width * 20 / 24" :height="height - 60" :id="'B' + d.id" style="pointer-events: none">
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
  <div style="position: absolute;border: 1px dashed gray;padding: 0;z-index: 1;" :style="{width:width * 20 / 24 + 'px'}">
    <canvas ref="canvasRef"  :width="width * 20 / 24" :height="height - 60"></canvas>
  </div>
  <FlyerRight ref="flyerRightRef"></FlyerRight>
</template>

<style scoped>
.text-editor:focus {
  border:none;
}
</style>