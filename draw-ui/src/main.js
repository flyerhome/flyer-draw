import { createApp } from 'vue'
import {Button,Input,Row,Col,Select,Form,Drawer,Checkbox} from 'ant-design-vue';
import App from './App.vue'
import './style.css'
createApp(App)
    .use(Button)
    .use(Input)
    .use(Row)
    .use(Col)
    .use(Select)
    .use(Form)
    .use(Drawer)
    .use(Checkbox)
    .mount('#app')
