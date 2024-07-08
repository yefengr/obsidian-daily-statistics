import { ItemView, WorkspaceLeaf } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import Calendar from "@/ui/Calendar.vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from "element-plus";


export const VIEW_TYPE_EXAMPLE = "example-view";

export class Calendar extends ItemView {

  _vueApp: VueApp | undefined;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Example view";
  }

  async onOpen() {
    // const container = this.containerEl.children[1];
    // container.empty();
    // container.createEl("h4", { text: "Example view" });
    const _app = createApp(Calendar);
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }

  async onClose() {
    // Nothing to clean up.
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }

  // display(): void {
  //   const _app = createApp(Calendar);
  //   this._vueApp = _app;
  //   _app.mount(this.containerEl);
  // }
  //
  // hide() {
  //   if (this._vueApp) {
  //     this._vueApp.unmount();
  //   }
  //   this.containerEl.empty();
  // }
}
