import type { Plugin } from "./index";

export const TaskbarPlugin: Plugin = {
  name: "TaskbarPlugin",
  install(_app) {
    void _app;
    // placeholder: register taskbar UI or API here
    // Plugins should use public APIs only per CHECKLIST.md
  }
};

export default TaskbarPlugin;
