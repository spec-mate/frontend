import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target:
          "http://specmate-backend-alb-736149231.ap-northeast-2.elb.amazonaws.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
