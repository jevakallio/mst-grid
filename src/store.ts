import { Instance } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { RootStore, RootInstance } from "./model/RootStore";
import { v4 as uuid } from "uuid";
import Chance from "chance";
import { autosync } from "./sync";

// generate some initial names
const chance = new Chance();
const initialState = {
  people: [...Array(10000)].map((_, i) => ({
    id: uuid(),
    firstName: chance.first({ gender: i % 2 === 0 ? "male" : "female" }),
    lastName: chance.last(),
    yearOfBirth: chance.birthday().getFullYear(),
  })),
};

// create store context
export const rootStore = RootStore.create(initialState);
export const RootStoreContext = createContext<null | RootInstance>(null);
export const RootStoreProvider = RootStoreContext.Provider;

autosync(rootStore);

// hook for accessing context
export function useStore() {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error("Missing RootStoreProvider");
  }

  return store;
}
