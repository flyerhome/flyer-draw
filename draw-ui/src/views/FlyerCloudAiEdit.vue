<script setup>
import {onMounted, reactive, ref} from "vue";
import {apost} from "../utils/Http.js";
import {message} from "ant-design-vue";

// 获取SVG元素引用
const svgEl = ref();
const toolData = reactive({
  svgWidth:1000,
  svgHeight:700,
  aiContent:'',
  host:'',
  modelName:'',
  apiKey:'',
  backgroundFlag:true,
  background:'#fff'
})
const width = ref(2000)
const height = ref(1000)

const saveAiConfig = () => {
  localStorage.setItem('cloudAiConfig', JSON.stringify(toolData))
}

const clearAiConfig = (flag) => {
  toolData.aiUrl = ''
  toolData.apiId = ''
  toolData.apiKey = ''
  if (flag) {
    localStorage.removeItem('cloudAiConfig')
  }

}




const aiDraw = async (e) => {
  const loading = message.loading('正在绘制中请稍等...', 0);
  const modelName = toolData.modelName;
  const content = "我的svg画布的宽为" + toolData.svgWidth + "，高为"+toolData.svgHeight + "，" + toolData.aiContent
  await apost('/api/cloud-ai', {
    content: content,
    model:modelName
  }, (res) => {
    const result = res.result;
    if (toolData.backgroundFlag) {
      svgEl.value.innerHTML = '<rect x="0" y="0" width="' +toolData.svgWidth+ '" height="' + toolData.svgHeight + '" fill="' + toolData.background + '"></rect>'
    } else {
      svgEl.value.innerHTML = ''
    }
    svgEl.value.innerHTML += `${result}`
    message.success('已绘制完成')
    loading()
  }, err => {
    loading()
  })

  /*try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log(`${response.data.output.text}`);
      if (toolData.backgroundFlag) {
        svgEl.value.innerHTML = '<rect x="0" y="0" width="' +toolData.svgWidth+ '" height="' + toolData.svgHeight + '" fill="' + toolData.background + '"></rect>'
      } else {
        svgEl.value.innerHTML = ''
      }
      svgEl.value.innerHTML += `${response.data.output.text}`
      message.success('已绘制完成')
      loading()
    } else {
      console.log(`request_id=${response.headers['request_id']}`);
      console.log(`code=${response.status}`);
      console.log(`message=${response.data.message}`);
      message.warn('绘制失败' + response.data.message)
      loading()
    }
  } catch (error) {
    console.error(`Error calling DashScope: ${error.message}`);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    message.warn('绘制异常' + error.message)
    loading()
  }*/

}

const exportPng = (e) => {
  const svgString = new XMLSerializer().serializeToString(svgEl.value);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const image = new Image()
  image.src = svgUrl
  image.crossOrigin = 'anonymous'; // 解决跨域渲染问题;
  image.onload = (e) => {
    let canvas = document.createElement('canvas')
    canvas.width = toolData.svgWidth
    canvas.height = toolData.svgHeight
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width, canvas.height)
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
    ctx.clearRect(0,0,canvas.width, canvas.height)
    canvas.getContext = () => null;
    canvas.width = 0
    canvas.height = 0
    canvas = null;
  }

}

onMounted(() => {
  width.value = document.body.clientWidth
  height.value = document.body.clientHeight
  toolData.svgWidth = parseInt(width.value * 0.8)
  toolData.svgHeight = parseInt(height.value * 0.8)
  let itemStr = localStorage.getItem('cloudAiConfig');
  if (itemStr) {
    const aiConfig = JSON.parse(itemStr)
    if (aiConfig) {
      if (aiConfig.host) {
        toolData.host = aiConfig.host
      }
      if (aiConfig.modelName) {
        toolData.modelName = aiConfig.modelName
      }
      if (aiConfig.apiKey) {
        toolData.apiKey = aiConfig.apiKey
      }
    }
  }
})
window.onresize = () => {
  width.value = document.body.clientWidth
  height.value = document.body.clientHeight
  console.log("resize................", width.value, height.value)
}
</script>

<template>
  <div style="width:100%;height: 100%;padding:0;background-color: #dddddd;">

    <div  style="padding: 5px;border-bottom: 1px solid #bbbbbb">
      <a-row>
        <a-col :span="4">
          <a-form-item
              label="画布大小"
              name="svgWH"
          >
            <a-input type="number" v-model:value="toolData.svgWidth" style="width: 80px"></a-input>
            <span> * </span>
            <a-input type="number" v-model:value="toolData.svgHeight" style="width: 80px"></a-input>
            <span> px</span>
          </a-form-item>
        </a-col>
        <a-col>
          <a-checkbox v-model:checked="toolData.backgroundFlag" style="padding: 5px"/>
        </a-col>
        <a-col :span="2">
          <a-form-item
              label="背景色"
              name="background"
          >

            <a-input type="color" v-model:value="toolData.background" style="width: 80px"></a-input>
          </a-form-item>
        </a-col>

        <a-col :span="4">
          <a-form-item
              label="AI模型"
              name="aiModel"
          >
            <a-textarea type="text" v-model:value="toolData.modelName" style="width: 250px" placeholder="请输入你要连接的AI云模型"></a-textarea>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
              label=""
              name="aiContent"
          >
            <a-textarea v-model:value="toolData.aiContent" style="width: calc(100% - 500px);margin-right: 10px;" placeholder="请输入需要绘制图形的详细信息，如绘制一个迷宫，有一个小人在迷宫里从入口走到出口"></a-textarea>

            <a-button @click="aiDraw">开始AI绘制</a-button>
            <a-button @click="exportPng">导出PNG</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </div>

    <a-row :gutter="[10,10]" style="padding: 5px">
      <a-col :span="24" style="padding: 10px">

        <div ref="bodyRef" style="position: relative;padding: 0;z-index: 999;width:100%;height: 100%;display: flex;justify-content: center;align-items: center;flex-direction: column">
          <div style="position: relative;padding: 0;background: rgba(204,198,198,0.47);" :style="{width:toolData.svgWidth + 'px', height:toolData.svgHeight + 'px'}">
            <svg ref="svgEl" :style="{width:'100%', height:'100%'}">
              <rect v-if="toolData.backgroundFlag" :x="0" :y="0" :width="toolData.svgWidth" :height="toolData.svgHeight" :fill="toolData.background"></rect>
            </svg>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>


<style scoped>
</style>