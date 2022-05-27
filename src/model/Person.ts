import { Instance, types as t } from "mobx-state-tree";
import { v4 as uuid } from "uuid";

const fields = {
  id: t.optional(t.string, () => uuid()),
  firstName: t.optional(t.string, ""),
  lastName: t.optional(t.string, ""),
  yearOfBirth: t.optional(t.number, 2000),
};

export type PersonField = keyof typeof fields;

export const Person = t
  .model(fields)
  .views((self) => ({
    get age() {
      return self.yearOfBirth
        ? new Date().getFullYear() - self.yearOfBirth
        : undefined;
    },

    get userName() {
      return `@${self.firstName[0] ?? ""}${self.lastName}`
        .toLowerCase()
        .trim()
        .replace(/\s/g, "");
    },

    toPlainObject() {
      return { ...self, age: this.age, userName: this.userName };
    },
  }))
  .actions((self) => ({
    updateField(fieldName: PersonField, value: any) {
      Object.assign(self, { [fieldName]: value });
    },
    rename(firstName: string, lastName: string) {
      self.firstName = firstName;
      self.lastName = lastName;
    },
  }));

export interface IPerson extends Instance<typeof Person> {}
