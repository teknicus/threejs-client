import { createApp } from "vue";
import drie from '@janvorisek/drie';
import App from "./App.vue";
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
app.use(createPinia())
app.use(drie);
app.use(ElementPlus)
app.mount("#app");
