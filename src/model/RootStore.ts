import { v4 as uuid } from "uuid";
import { Instance, types as t } from "mobx-state-tree";
import { Person, IPerson } from "./Person";

export const RootStore = t
  .model({
    people: t.array(Person),
  })
  .actions((store) => ({
    addPerson(person: IPerson) {
      store.people.push(person);
    },
    insertPersonAfter(id: string) {
      const index = store.people.findIndex((p) => p.id === id);
      if (index !== -1) {
        store.people.splice(index + 1, 0, Person.create());
      }
    },
    removePerson(id: string) {
      const index = store.people.findIndex((p) => p.id === id);
      if (index !== -1) {
        store.people.splice(index, 1);
      }
    },
  }));

export type RootInstance = Instance<typeof RootStore>;
