import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            less: {
                // Дополнительные настройки для Less при необходимости
            }
        }
    }
})
