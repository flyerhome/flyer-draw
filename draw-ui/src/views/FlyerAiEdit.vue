<script setup>
import {onMounted, reactive, ref} from "vue";
import {apost} from "../utils/Http.js";
import axios from "axios";
import {message} from "ant-design-vue";

// 获取SVG元素引用
const svgEl = ref();
const toolData = reactive({
  svgWidth:1000,
  svgHeight:700,
  aiContent:'',
  aiUrl:'',
  apiId:'',
  apiKey:'',
})
const width = ref(2000)
const height = ref(1000)

const saveAiConfig = () => {
  localStorage.setItem('aiConfig', JSON.stringify(toolData))
}

const clearAiConfig = (flag) => {
  toolData.aiUrl = ''
  toolData.apiId = ''
  toolData.apiKey = ''
  if (flag) {
    localStorage.removeItem('aiConfig')
  }

}



const aiDraw = async (e) => {
  const loading = message.loading('正在绘制中请稍等...', 0);
  const apiKey = toolData.apiKey;
  const appId = toolData.apiId
  const url = toolData.aiUrl;
  const data = {
    input: {
      prompt: "我的svg画布的宽为" + toolData.svgWidth + "，高为"+toolData.svgHeight + "，" + toolData.aiContent
    },
    parameters: {},
    debug: {}
  };
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log(`${response.data.output.text}`);
      svgEl.value.innerHTML = '<rect x="0" y="0" width="' +toolData.svgWidth+ '" height="' + toolData.svgHeight + '" fill="gray"></rect>'
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
  }

}



onMounted(() => {
  width.value = document.body.clientWidth
  height.value = document.body.clientHeight
  toolData.svgWidth = parseInt(width.value * 0.8)
  toolData.svgHeight = parseInt(height.value * 0.8)
  let itemStr = localStorage.getItem('aiConfig');
  if (itemStr) {
    const aiConfig = JSON.parse(itemStr)
    if (aiConfig) {
      if (aiConfig.aiUrl) {
        toolData.aiUrl = aiConfig.aiUrl
        toolData.apiKey = aiConfig.apiKey
        toolData.apiId = aiConfig.apiId
      }
      if (aiConfig.apiKey) {
        toolData.apiKey = aiConfig.apiKey
      }
      if (aiConfig.apiId) {
        toolData.apiId = aiConfig.apiId
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

    <a-row :gutter="[10,10]" style="padding: 5px;border-bottom: 1px solid #bbbbbb">
      <a-col :span="24">
        <a-row>
          <a-col :span="7">
            <a-form-item
                label="AI智能体地址"
                name="url"
            >
              <a-input type="text" style="width: 450px" v-model:value="toolData.aiUrl"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item
                label="ApiId"
                name="apiId"
            >
              <a-input type="text" style="width: 250px" v-model:value="toolData.apiId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item
                label="ApiKey"
                name="apiKey"
            >
              <a-input type="text" style="width: 250px" v-model:value="toolData.apiKey"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="4">
              <a-button @click="saveAiConfig">本地缓存</a-button>
              <a-button @click="clearAiConfig(1)">清除本地缓存</a-button>
              <a-button @click="clearAiConfig(0)">清空重录</a-button>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="23">
            <a-form-item
                label=""
                name="aiContent"
            >
              <a-textarea v-model:value="toolData.aiContent" style="width: calc(100% - 120px);margin-right: 10px;" placeholder="请输入需要绘制图形的关键信息"></a-textarea>

              <a-button @click="aiDraw">开始AI绘制</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row :gutter="[10,10]" style="padding: 5px">
      <a-col :span="24" style="padding: 10px">
        <div ref="bodyRef" style="position: relative;padding: 0;z-index: 999;width:100%;height: 100%;/* 核心居中样式 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */">
          <div  style="position: relative;padding: 0;border:1px solid #333;background: white;/* 核心居中样式 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */" :style="{width:toolData.svgWidth + 'px', height:toolData.svgHeight + 'px'}">
            <svg ref="svgEl" :style="{width:'100%', height:'100%'}">
<!--              <rect :x="0" :y="0" :width="toolData.svgWidth" :height="toolData.svgHeight" fill="white"></rect>-->
            </svg>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>


<style scoped>
</style>