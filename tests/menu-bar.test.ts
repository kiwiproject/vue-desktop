import { describe, it, expect, vi } from "vitest";
import { createDesktop } from "../src/core/DesktopInstance";
import type { MenuBarDefinition, MenuBarMenu, MenuBarItem } from "../src/core/types";

describe("Menu bar types and integration", () => {
  describe("type definitions", () => {
    it("allows creating a menu bar item", () => {
      const item: MenuBarItem = {
        id: "test",
        label: "Test Item"
      };
      expect(item.id).toBe("test");
      expect(item.label).toBe("Test Item");
    });

    it("allows menu item with all properties", () => {
      const action = vi.fn();
      const item: MenuBarItem = {
        id: "save",
        label: "Save",
        icon: "\uD83D\uDCBE",
        shortcut: "Ctrl+S",
        action,
        disabled: false,
        separator: true
      };
      expect(item.id).toBe("save");
      expect(item.icon).toBe("\uD83D\uDCBE");
      expect(item.shortcut).toBe("Ctrl+S");
      expect(item.action).toBe(action);
      expect(item.disabled).toBe(false);
      expect(item.separator).toBe(true);
    });

    it("allows nested menu items (submenus)", () => {
      const item: MenuBarItem = {
        id: "recent",
        label: "Recent Files",
        children: [
          { id: "file1", label: "Document.txt" },
          { id: "file2", label: "Notes.md" }
        ]
      };
      expect(item.children).toHaveLength(2);
      expect(item.children![0].label).toBe("Document.txt");
    });

    it("allows creating a menu bar menu", () => {
      const menu: MenuBarMenu = {
        id: "file",
        label: "File",
        items: [
          { id: "new", label: "New" },
          { id: "open", label: "Open" }
        ]
      };
      expect(menu.id).toBe("file");
      expect(menu.label).toBe("File");
      expect(Array.isArray(menu.items)).toBe(true);
      expect((menu.items as MenuBarItem[]).length).toBe(2);
    });

    it("allows dynamic menu items via function", () => {
      const menu: MenuBarMenu = {
        id: "edit",
        label: "Edit",
        items: () => [
          { id: "undo", label: "Undo", disabled: false },
          { id: "redo", label: "Redo", disabled: true }
        ]
      };
      expect(typeof menu.items).toBe("function");
      const items = (menu.items as () => MenuBarItem[])();
      expect(items).toHaveLength(2);
      expect(items[1].disabled).toBe(true);
    });

    it("allows creating a full menu bar definition", () => {
      const menuBar: MenuBarDefinition = [
        {
          id: "file",
          label: "File",
          items: [
            { id: "new", label: "New", shortcut: "Ctrl+N" },
            { id: "open", label: "Open", shortcut: "Ctrl+O" },
            { id: "sep1", label: "", separator: true },
            { id: "exit", label: "Exit" }
          ]
        },
        {
          id: "edit",
          label: "Edit",
          items: [
            { id: "undo", label: "Undo", shortcut: "Ctrl+Z" },
            { id: "redo", label: "Redo", shortcut: "Ctrl+Y" }
          ]
        },
        {
          id: "help",
          label: "Help",
          items: [
            { id: "about", label: "About" }
          ]
        }
      ];
      expect(menuBar).toHaveLength(3);
      expect(menuBar[0].id).toBe("file");
      expect(menuBar[1].id).toBe("edit");
      expect(menuBar[2].id).toBe("help");
    });
  });

  describe("window definition with menu bar", () => {
    it("creates window without menu bar", () => {
      const d = createDesktop();
      const win = d.createWindow({
        type: "test",
        title: "Test Window",
        component: {} as never
      });
      expect(win.menuBar).toBeUndefined();
    });

    it("creates window with menu bar", () => {
      const d = createDesktop();
      const menuBar: MenuBarDefinition = [
        {
          id: "file",
          label: "File",
          items: [
            { id: "new", label: "New" }
          ]
        }
      ];
      const win = d.createWindow({
        type: "test",
        title: "Test Window",
        component: {} as never,
        menuBar
      });
      expect(win.menuBar).toBeDefined();
      expect(win.menuBar).toHaveLength(1);
      expect(win.menuBar![0].id).toBe("file");
    });

    it("preserves menu bar on retrieved window", () => {
      const d = createDesktop();
      const menuBar: MenuBarDefinition = [
        {
          id: "edit",
          label: "Edit",
          items: [{ id: "cut", label: "Cut" }]
        }
      ];
      const win = d.createWindow({
        type: "test",
        title: "Test Window",
        component: {} as never,
        menuBar
      });

      const retrieved = d.getWindow(win.id!);
      expect(retrieved?.menuBar).toBeDefined();
      expect(retrieved?.menuBar?.[0].id).toBe("edit");
    });
  });

  describe("menu item actions", () => {
    it("action function can be called", () => {
      const action = vi.fn();
      const item: MenuBarItem = {
        id: "save",
        label: "Save",
        action
      };

      item.action?.();
      expect(action).toHaveBeenCalledOnce();
    });

    it("disabled items can still have actions defined", () => {
      const action = vi.fn();
      const item: MenuBarItem = {
        id: "save",
        label: "Save",
        action,
        disabled: true
      };

      // The UI should prevent calling, but action is still defined
      expect(item.action).toBeDefined();
      expect(item.disabled).toBe(true);
    });
  });

  describe("dynamic menu items", () => {
    it("function items are re-evaluated each time", () => {
      let callCount = 0;
      const menu: MenuBarMenu = {
        id: "view",
        label: "View",
        items: () => {
          callCount++;
          return [{ id: "item", label: `Call ${callCount}` }];
        }
      };

      const items1 = (menu.items as () => MenuBarItem[])();
      const items2 = (menu.items as () => MenuBarItem[])();

      expect(callCount).toBe(2);
      expect(items1[0].label).toBe("Call 1");
      expect(items2[0].label).toBe("Call 2");
    });

    it("dynamic items can reflect external state", () => {
      let canUndo = false;
      let canRedo = false;

      const menu: MenuBarMenu = {
        id: "edit",
        label: "Edit",
        items: () => [
          { id: "undo", label: "Undo", disabled: !canUndo },
          { id: "redo", label: "Redo", disabled: !canRedo }
        ]
      };

      // Initial state
      let items = (menu.items as () => MenuBarItem[])();
      expect(items[0].disabled).toBe(true);
      expect(items[1].disabled).toBe(true);

      // After making changes
      canUndo = true;
      items = (menu.items as () => MenuBarItem[])();
      expect(items[0].disabled).toBe(false);
      expect(items[1].disabled).toBe(true);
    });
  });

  describe("submenu support", () => {
    it("allows deeply nested submenus", () => {
      const item: MenuBarItem = {
        id: "format",
        label: "Format",
        children: [
          {
            id: "text",
            label: "Text",
            children: [
              { id: "bold", label: "Bold" },
              { id: "italic", label: "Italic" }
            ]
          },
          {
            id: "paragraph",
            label: "Paragraph",
            children: [
              { id: "left", label: "Align Left" },
              { id: "center", label: "Align Center" }
            ]
          }
        ]
      };

      expect(item.children).toHaveLength(2);
      expect(item.children![0].children).toHaveLength(2);
      expect(item.children![1].children![0].label).toBe("Align Left");
    });
  });
});
