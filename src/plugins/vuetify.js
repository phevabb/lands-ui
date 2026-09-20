import Vue from "vue";
import Vuetify from "vuetify/lib";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi"
  },

  theme: {
    dark: false,

    themes: {
      light: {
        primary: "#2563EB",
        secondary: "#4F46E5",
        accent: "#7C3AED",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#0284C7",
        background: "#F5F7FB"
      },

      dark: {
        primary: "#60A5FA",
        secondary: "#818CF8",
        accent: "#A78BFA",
        success: "#4ADE80",
        warning: "#FBBF24",
        error: "#F87171",
        info: "#38BDF8",
        background: "#0F172A"
      }
    }
  }
});
