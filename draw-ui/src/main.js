import { createApp } from 'vue'
import {Button,Input,Row,Col,Select,Form,Drawer,Checkbox,Space,Spin} from 'ant-design-vue';
import Router from './utils/Router.js'
import App from './App.vue'
import './style.css'
createApp(App)
    .use(Router)
    .use(Button)
    .use(Input)
    .use(Row)
    .use(Col)
    .use(Select)
    .use(Form)
    .use(Drawer)
    .use(Checkbox)
    .use(Space)
    .use(Spin)
    .mount('#app')
