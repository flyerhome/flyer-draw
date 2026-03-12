<script setup>
import {nextTick, onUnmounted, reactive, ref} from "vue";

const props = defineProps({
  width:Number,
  height:Number,
  type:String,
  fill:String,
  stroke:String,
  strokeWidth:Number,
  fontFamily:String,
  fontSize:Number,
  textAnchor:String,
})
// defineEmits(["mousedown","mouseup","mousemove","mouseleave"])
const svgRef = ref();

const shiftFlag = ref(false)
const ctrlFlag = ref(false)
const altFlag = ref(false)

const drawList = ref([])
const current = reactive({
  id:null,
  selected:null
})
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
    return
  }
  obj.type = 'circle'
  obj.x = pt.x
  obj.y = pt.y
  obj.r = 0
  obj.fill = props.fill||'lightblue'
  obj.stroke = props.stroke||'green'
  obj.strokeWidth = props.strokeWidth||2

  drawList.value.push(obj)
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
    return
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
  obj.fill = props.fill||'lightblue'
  obj.stroke = props.stroke||'green'
  obj.strokeWidth = props.strokeWidth||2

  drawList.value.push(obj)
}

const drawPolygon = (e, obj, add) => {
  // console.log("画多边形了", obj)
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

    return
  }
  obj.type = 'polygon'
  obj.points = [pt.x +"," + pt.y,pt.x +"," + pt.y]
  obj.fill = props.fill||'lightblue'
  obj.stroke = props.stroke||'green'
  obj.strokeWidth = props.strokeWidth||2

  drawList.value.push(obj)
  console.log("画了一个多边形==============", obj)
}

const drawText = (e, obj) => {
  console.log("画矩形了", obj)
  const id = obj.id;
  const exist = drawList.value.find(item => item.id === id);
  const pt = createSVGPoint(e);
  if (!!exist) {

    return
  }
  obj.type = 'text'
  obj.x = pt.x
  obj.y = pt.y
  obj.text = ''
  obj.fontFamily = props.fontFamily ||"黑体"
  obj.fontSize = props.fontSize ||30
  obj.textAnchor = props.textAnchor ||"middle"
  obj.fill = props.fill||'lightblue'
  obj.strokeWidth = props.strokeWidth||2

  drawList.value.push(obj)
  nextTick(() => {
    setTimeout(()=> {
      current.id = obj.id
      const element = document.getElementById(obj.id);
      element.focus()
    },30)

  })
}



const mousedown = (e) => {
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
          points:selected.points,
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
      return;
    }
  }
  console.log("mousedown===", e.target)
  if (!!!current.id) {
    current.id = Date.now()
  }
  if (props.type === 'circle')
    drawCircle(e, {id:current.id})
  if (props.type === 'rect')
    drawRect(e, {id:current.id})
  if (props.type === 'polygon') {
    drawPolygon(e, {id:current.id}, 1)
  }
  if (props.type === 'text') {
    drawText(e, {id:current.id})
  }
}
const mouseup = (e) => {
  console.log("mouseup===",e.target)
  if (!!current.selected) {
    current.selected = null
    return;
  }
  if (!!!current.id) {
    return
  }
  if (props.type === 'circle') {
      current.id = null
  }
  if (props.type === 'rect') {
    current.id = null
  }
  /*if (props.type === 'text') {
    current.id = null
  }*/
}
const mousemove = (e) => {
  if (!!current.selected) {
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
  if (props.type === 'circle') {
    drawCircle(e, exist)
  }
  if (props.type === 'rect') {
    drawRect(e, exist)
  }
  if (props.type === 'polygon') {
    drawPolygon(e, exist)
  }


}
const mouseleave = (e) => {
  return;
  if (!!!current.id) {
    return
  }
  if (props.type === 'circle') {
    current.id = null
  }
  if (props.type === 'rect') {
    current.id = null
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
  if (e.key === 'Enter' && props.type === 'polygon') {
    current.id = null;
  }
  if (e.key === 'Enter' && props.type === 'text') {
    if (ctrlFlag.value) {
      current.id = null;
    }
  }
}

const keyup = (e) => {
  console.log("keyup", e.key)
  if (e.key === 'Shift') {
    shiftFlag.value = false
  }
  if (e.key === 'Control') {
    ctrlFlag.value = false
  }
  if (e.key === 'Alt') {
    altFlag.value = false
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

}
defineExpose({createSVGPoint,clearSvg,exportPng})

onUnmounted(() => {
  document.removeEventListener('click',click)
  document.removeEventListener('keyup',keyup)
  document.removeEventListener('keydown',keydown)
})

</script>

<template>
  <div style="position: relative;border: 1px dashed gray;padding: 0;" :style="{width:width * 20 / 24 + 'px'}">
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
                :style="{ stroke: d.stroke, strokeWidth: 2, fill: d.fill, cursor: 'move' }"
        />
        <rect :id="d.id" v-if="d.type === 'rect'" :width="d.width" :height="d.height" :x="d.x" :y="d.y" :rx="d.rx" :ry="d.ry"
              :style="{ stroke: d.stroke, strokeWidth: 2, fill: d.fill, cursor: 'move' }"></rect>

        <polygon :id="d.id" v-if="d.type === 'polygon'" :points="d.points.join(' ')"
                 :style="{ stroke: d.stroke, strokeWidth: 2, fill: d.fill, cursor: 'move' }"
        />

        <foreignObject v-if="d.type === 'text'" :width="width * 20 / 24" :height="height - 60" :id="'B' + d.id">
          <div class="text-editor" :contenteditable="current.id === d.id" :id="d.id"
               :style="{
          position:'absolute', userSelect:'none',padding:'5px',minWidth:'5px', border:current.id === d.id ?'1px dashed #ccc':'unset',
          textAlign:'left', left:d.x - d.fontSize/2 +'px', top:d.y - d.fontSize/2 +'px', lineHeight:1.5, fontSize:d.fontSize + 'px',
          color:d.fill,fontFamily:d.fontFamily
        }"
          >{{d.text}}</div>
        </foreignObject>
      </g>

    </svg>


  </div>
</template>

<style scoped>
.text-editor:focus {
  border:none;
}
</style>