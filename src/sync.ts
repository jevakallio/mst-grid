import { onPatch } from "mobx-state-tree";
import { RootInstance } from "./model/RootStore";

export function autosync(store: RootInstance) {
  onPatch(store, (patch, revert) => {
    console.log("sync", patch);
  });
}
