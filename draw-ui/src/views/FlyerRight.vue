<template>
  <a-drawer title="属性" :size="size" :visible="visible" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
    </template>
    <a-form :label-col="{style: { width: '80px'}}">

      <a-row v-if="data.selected.type === 'text'">
        <a-col :span="24">
          <a-form-item
              label="文本"
              name="text"
          >
            <a-textarea v-model:value="data.selected.text" style="width: 200px"></a-textarea>
          </a-form-item>
        </a-col>
      </a-row>
    <a-row v-if="data.selected.type === 'circle' || data.selected.type === 'rect'  || data.selected.type === 'text' ">
      <a-col :span="24">
        <a-form-item
            label="X"
            name="fill"
        >
          <a-input type="number" v-model:value="data.selected.x" style="width: 120px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row v-if="data.selected.type === 'circle' || data.selected.type === 'rect'  || data.selected.type === 'text' ">
      <a-col :span="24">
        <a-form-item
            label="Y"
            name="fill"
        >
          <a-input type="number" v-model:value="data.selected.y" style="width: 120px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row v-if="data.selected.type === 'circle'">
      <a-col :span="24">
        <a-form-item
            label="半径"
            name="r"
        >
          <a-input type="number" v-model:value="data.selected.r" style="width: 80px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row v-if="data.selected.type === 'rect'">
      <a-col :span="24">
        <a-form-item
            label="宽"
            name="width"
        >
          <a-input type="number" v-model:value="data.selected.width" style="width: 80px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row v-if="data.selected.type === 'rect'">
      <a-col :span="24">
        <a-form-item
            label="高"
            name="height"
        >
          <a-input type="number" v-model:value="data.selected.height" style="width: 80px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <a-form-item
            label="填充色"
            name="fill"
        >
          <a-input type="color" v-model:value="data.selected.fill" style="width: 80px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row v-if="data.selected.type !== 'text'">
      <a-col :span="24">
        <a-form-item
            label="边框色"
            name="stroke"
        >
          <a-input type="color" v-model:value="data.selected.stroke" style="width: 80px"></a-input>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row v-if="data.selected.type === 'text'">
      <a-col :span="24">
        <a-form-item
            label="字体大小"
            name="fontSize"
        >
          <a-input type="number" v-model:value="data.selected.fontSize" style="width: 61px" ></a-input>
          <span> px </span>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row v-if="data.selected.type !== 'text'">
      <a-col :span="24">
        <a-form-item
            label="边框大小"
            name="cc"
        >
          <a-input type="number" min="0" max="10" v-model:value="data.selected.strokeWidth" style="width: 61px"></a-input>
          <span> px </span>
        </a-form-item>
      </a-col>
    </a-row>
    </a-form>
  </a-drawer>
</template>
<script setup>
import {reactive, ref} from 'vue';
const visible = ref(false);
const size = ref('default');
const data = reactive({
  selected:{
    type:'',
    fill:'red',
    stroke:'red',
    strokeWidth:0,
    fontSize:26,
  }
})
const show = (selected) => {
  console.log("show", selected)
  data.selected = selected
  visible.value = true;
};

const close = () => {
  visible.value = false;
};
const onClose = () => {
  visible.value = false;
};
defineExpose({show, close})
</script>