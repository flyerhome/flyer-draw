<script setup>
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import FlyerRight from "./FlyerRight.vue";

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

const drawList = ref([])
const current = reactive({
  id:null,
  selected:null,
  moving:false
})
const getSelectStroke = (d) => {
  /*if (current.selected && current.selected.id === d.id) {
    return '#ff0000'
  }*/
  return d.stroke
}
const getSelectFill = (d) => {
  return d.fill
}
const getSelectStrokeWidth = (d) => {
  /*if (current.selected && current.selected.id === d.id) {
    if (!!!d.strokeWidth) {
      return 2;
    }
    if (d.strokeWidth <= 1) {
      return 2;
    }
  }*/
  return d.strokeWidth
}
const getSelectBorder = (d) => {
  /*if (current.selected && current.selected.id === d.id) {
    return '2px dashed #0ff5ed'
  }*/
  return current.id === d.id ?'1px dashed #ccc':'unset'
}


const toolUpdate = (data) => {
  console.log("tool发生了变更", data)
  toolData.type = data.type;
  toolData.fontSize = data.fontSize
  toolData.fill = data.fill
  toolData.stroke = data.stroke
  toolData.strokeWidth = data.strokeWidth
  toolData.fontFamily = data.fontFamily||'黑体'
  if (data.clearSvg === 1) {
    clearSvg()
    data.clearSvg = null
  }
  if (data.exportPng === 1) {
    exportPng()
    data.exportPng = null;
  }
}


const transferPoint = (str) => {
  return {
    x:str.substring(0, str.indexOf(',')),
    y:str.substring(str.indexOf(',') + 1),
  }
}
const drawCircle = (e, obj) => {
  console.log("画圆了", obj)
  const id = obj.id;
  const exist = drawList.value.find(item => item.id === id);
  const pt = createSVGPoint(e);
  if (!!exist) {
    // exist.x = obj.x
    // exist.y = obj.y
    // exist.r = obj.r
    // exist.fill = obj.fill
    // exist.stroke = obj.stroke
    // exist.strokeWidth = obj.strokeWidth
    const dx = pt.x - exist.x;
    const dy = pt.y - exist.y;
     // 勾股定理算半径
    exist.r = Math.sqrt(dx * dx + dy * dy)
    return exist
  }
  obj.type = 'circle'
  obj.x = pt.x
  obj.y = pt.y
  obj.r = 0
  obj.fill = toolData.fill||'lightblue'
  obj.stroke = toolData.stroke||'green'
  obj.strokeWidth = toolData.strokeWidth

  drawList.value.push(obj)
  return obj;
}
const drawRect = (e, obj) => {
  console.log("画矩形了", obj)
  const id = obj.id;
  const exist = drawList.value.find(item => item.id === id);
  const pt = createSVGPoint(e);
  if (!!exist) {
    let dx = pt.x - exist.sx;
    let dy = pt.y - exist.sy;
    if (dx <= 0) {
      exist.x = pt.x
    }
    if (dy <= 0) {
      exist.y = pt.y
    }
    exist.width = Math.abs(dx)
    exist.height = Math.abs(dy)
    if (!!shiftFlag.value) {
      exist.width = exist.height = Math.min(exist.width,exist.height)
      //重新计算x y
      if (dx <0) {
        exist.x = exist.sx - exist.width
      }/* else {
        exist.x = exist.sx + exist.width
      }*/
      if (dy < 0) {
        exist.y = exist.sy - exist.height
      }/* else {
        exist.y = exist.sy + exist.height
      }*/

    }
    return exist
  }
  obj.type = 'rect'
  obj.width = 0
  obj.height = 0
  obj.sx = pt.x
  obj.sy = pt.y
  obj.x = pt.x
  obj.y = pt.y
  obj.rx = 0
  obj.ry = 0
  obj.fill = toolData.fill||'lightblue'
  obj.stroke = toolData.stroke||'green'
  obj.strokeWidth = toolData.strokeWidth

  drawList.value.push(obj)
  return obj
}

const drawPolygon = (e, obj, add) => {
  const id = obj.id;
  const exist = drawList.value.find(item => item.id === id);
  const pt = createSVGPoint(e);
  if (!!exist) {
    // 永远更新
    if (shiftFlag.value) {
      // 看趋势 就是当前点位 和 上一个点位的比较
      const last = transferPoint(exist.points[exist.points.length - 2])
      console.log("上一个", last, "当前", pt.x,pt.y)
      if (!!last) {
        if (Math.abs(pt.x - last.x) > Math.abs(pt.y - last.y)) {
          exist.points[exist.points.length - 1] = pt.x +"," + last.y
        } else {
          exist.points[exist.points.length - 1] = last.x +"," + pt.y
        }
      } else {
        exist.points[exist.points.length - 1] = pt.x +"," + pt.y
      }
    } else {
      exist.points[exist.points.length - 1] = pt.x +"," + pt.y
    }
    if (!!add) {
      exist.points.push(pt.x +"," + pt.y)
    }

    return exist
  }
  obj.type = 'polygon'
  obj.points = [pt.x +"," + pt.y,pt.x +"," + pt.y]
  obj.fill = toolData.fill||'lightblue'
  obj.stroke = toolData.stroke||'green'
  obj.strokeWidth = toolData.strokeWidth

  drawList.value.push(obj)
  return obj;
}

const drawText = (e, obj) => {
  console.log("画矩形了", obj)
  const id = obj.id;
  const exist = drawList.value.find(item => item.id === id);
  const pt = createSVGPoint(e);
  if (!!exist) {

    return exist
  }
  obj.type = 'text'
  obj.x = pt.x
  obj.y = pt.y
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



const mousedown = (e) => {
  syncLeftSlider()
  if (e.target.id && !current.id) {
    console.log("selected===", e.target)
    let targetId = e.target.id;
    if (e.target.id.startsWith('F')) {
      targetId = targetId.substring(1)
    }
    const selected = drawList.value.find(item => item.id === parseInt(targetId));
    if (selected) {
      let pt = createSVGPoint(e)
      if (selected.points) {
        selected.start = {
          points:JSON.parse(JSON.stringify(selected.points)),
        }
      } else {
        selected.start = {
          x:selected.x,
          y:selected.y
        }
      }
      selected.move = {
        x:pt.x,
        y:pt.y
      }

      current.selected = selected;
      current.moving = true
      return;
    }

  }
  current.selected = null
  console.log("mousedown===", e.target)
  if (!!!current.id) {
    current.id = Date.now()
  }
  let obj = null;
  if (toolData.type === 'circle')
    obj = drawCircle(e, {id:current.id})
  if (toolData.type === 'rect')
    obj = drawRect(e, {id:current.id})
  if (toolData.type === 'polygon') {
    obj = drawPolygon(e, {id:current.id}, 1)
  }
  if (toolData.type === 'text') {
    obj = drawText(e, {id:current.id})
  }

}
const mousemove = (e) => {
  if (!!current.selected && current.moving) {
    // 鼠标移动当前位置 和鼠标开始的位置 的位置差就是
    let pt = createSVGPoint(e)
    if (current.selected.points) {
      for (let i = 0,len = current.selected.start.points.length; i < len; i++) {
        const point = current.selected.start.points[i];
        const x = parseFloat(point.substring(0, point.indexOf(',')))
        const y = parseFloat(point.substring(point.indexOf(',') + 1))
        current.selected.points[i] = (x + pt.x - current.selected.move.x) + ',' + (y + pt.y - current.selected.move.y)
      }
    } else {
      current.selected.x = current.selected.start.x + pt.x - current.selected.move.x
      current.selected.y = current.selected.start.y + pt.y - current.selected.move.y
    }

    return;
  }
  if (!!!current.id) {
    return
  }
  const exist = drawList.value.find(item => item.id === current.id);
  if (toolData.type === 'circle') {
    drawCircle(e, exist)
  }
  if (toolData.type === 'rect') {
    drawRect(e, exist)
  }
  if (toolData.type === 'polygon') {
    drawPolygon(e, exist)
  }
  syncLeftSlider()
}


const mouseup = (e) => {
  console.log("mouseup===",e.target)
  current.moving = false;

  if (toolData.type === 'text' || toolData.type === 'polygon') {
    // 文本和多边形 不能依靠mouseup 事件来取消绘图
    // 文本通过ctrl+enter 取消文本编辑 keyup 事件来控制
    // 多边形通过Enter 或esc 结束绘制  keyup 事件开控制
    if (current.selected) {
      flyerRightRef.value.show(current.selected)
    }
    return;
  }
  if (current.id) {
    const exist = drawList.value.find(item => item.id === current.id)
    let condition = exist && exist.type === 'circle' && exist.r <= 5;
    condition = condition || (exist && exist.type === 'rect' && (exist.width <= 5 && exist.height <= 5))
    condition = condition || (exist  && exist.type === 'polygon' && (exist.points.length <= 2))
    if (condition) {
      drawList.value = drawList.value.filter(item=> item.id !== current.id)
      current.selected =null;
      current.id = null
      return;
    }
    current.selected = drawList.value.find(item => item.id === current.id);
    current.id = null
  }
  if (current.selected) {
    flyerRightRef.value.show(current.selected)
  }
}



const keydown = (e) => {
  console.log("keydown", e.key)
  if (e.key === 'Shift') {
    shiftFlag.value = true
  }
  if (e.key === 'Control') {
    ctrlFlag.value = true
  }
  if (e.key === 'Alt') {
    altFlag.value = true
  }
  if (e.key === 'Escape') {
  }

}

const keyup = (e) => {
  console.log("keyup", e.key)


  if (e.key === 'Enter' && toolData.type === 'polygon') {
    current.id = null;
  }
  if (e.key === 'Enter' && toolData.type === 'text') {
    if (ctrlFlag.value) {
      current.id = null;
    }
  }

  if (e.key === 'Escape') {
    if (!!current.id) {
      const exist = drawList.value.find(item => item.id === current.id);
      if (exist.type === 'polygon') {
        exist.points.pop()
        current.id = null;
      }
    }
  }
  if (e.key === 'Shift') {
    shiftFlag.value = false
  }
  if (e.key === 'Control') {
    ctrlFlag.value = false
  }
  if (e.key === 'Alt') {
    altFlag.value = false
  }
}
const dblclick = (e) => {
  if (!!!e.target.id) {
    return false;
  }
  const selectedId = parseInt(e.target.id);
  if (selectedId) {
    const selected = drawList.value.find(item => item.id === selectedId);
    if (selected) {
      if (selected.type === 'text') {
        current.id = selectedId
        nextTick(() => {
          e.target.focus()
        })
      }
    }
  }
}

document.addEventListener('dblclick', dblclick)
document.addEventListener('keyup', keyup)
document.addEventListener('keydown', keydown)

const createSVGPoint = (e) => {
  const svgPoint = svgRef.value.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  return svgPoint.matrixTransform(svgRef.value.getScreenCTM().inverse())
}
const clearSvg = (e) => {
  drawList.value = []
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

const mutationCallback = (mutationsList) => {
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
    console.log("重新操作了，重新计时")
    return;
  }
  timer.time = Date.now()
  timer.obj = setInterval(mutationCallback, 60)
}
const clearTimer = () => {
  if (timer.obj) {
    clearInterval(timer.obj)
    console.log("停止了同步定时器", timer.time, Date.now(), '执行了' + (Date.now() - timer.time)/1000 + 's')
    timer.obj = null;
    timer.time = null;
  }
}

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
                :style="{ stroke: getSelectStroke(d), strokeWidth: getSelectStrokeWidth(d), fill: getSelectFill(d), cursor: 'move' }"
        />
        <rect :id="d.id" v-if="d.type === 'rect'" :width="d.width" :height="d.height" :x="d.x" :y="d.y" :rx="d.rx" :ry="d.ry"
              :style="{ stroke: getSelectStroke(d), strokeWidth: getSelectStrokeWidth(d), fill: getSelectFill(d), cursor: 'move' }"></rect>

        <polygon :id="d.id" v-if="d.type === 'polygon'" :points="d.points.join(' ')"
                 :style="{ stroke: getSelectStroke(d), strokeWidth: getSelectStrokeWidth(d), fill: getSelectFill(d), cursor: 'move' }"
        />

        <foreignObject v-if="d.type === 'text'" :width="width * 20 / 24" :height="height - 60" :id="'B' + d.id" style="pointer-events: none">
          <div class="text-editor" :contenteditable="current.id === d.id" :id="d.id"
               :style="{
          position:'absolute',pointerEvents: 'auto', userSelect:'none',cursor: 'move',padding:'5px',minWidth:'5px', border:getSelectBorder(d),
          textAlign:'left', left:d.x - d.fontSize/2 +'px', top:d.y - d.fontSize/2 +'px', lineHeight:1.5, fontSize:d.fontSize + 'px',
          color:getSelectFill(d),fontFamily:d.fontFamily
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