import type { Plugin } from "../../core/types";
import Taskbar from "./Taskbar";

export { default as Taskbar } from "./Taskbar";

export const TaskbarPlugin: Plugin = {
  name: "taskbar",
  install(desktop) {
    const unregister = desktop.registerUI({
      id: "taskbar-main",
      slot: "taskbar",
      component: Taskbar,
      order: 0
    });

    return unregister;
  }
};
