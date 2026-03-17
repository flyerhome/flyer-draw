import { createWebHashHistory, createRouter } from 'vue-router'

import FlyerEdit from "../views/FlyerEdit.vue";
import FlyerAiEdit from "../views/FlyerAiEdit.vue";

const routes = [
    { path: '/ai', component: FlyerAiEdit },
    { path: '/', component:  FlyerEdit},
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router