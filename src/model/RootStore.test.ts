import { test, expect, describe, vi, beforeEach } from "vitest";
import { RootStore } from "./RootStore";
import { applyPatch, getSnapshot, onPatch } from "mobx-state-tree";
import { Person } from "./Person";
import { v4 as uuid } from "uuid";

export const initialState = {
  people: [
    {
      id: uuid(),
      firstName: "Jani",
      lastName: "Eväkallio",
      yearOfBirth: 1986,
    },
    {
      id: uuid(),
      firstName: "Hayat",
      lastName: "Rachi",
      yearOfBirth: 1990,
    },
  ],
};

let store = RootStore.create(initialState);

describe("RootStore", () => {
  beforeEach(() => {
    store = RootStore.create(initialState);
  });

  test("life is like a sewer", () => {
    expect(getSnapshot(store)).toEqual(initialState);
  });

  test("life multiplies", () => {
    store.addPerson(
      Person.create({
        firstName: "Sunil",
        lastName: "Pai",
        yearOfBirth: 1983,
      })
    );
    expect(store.people.length).toEqual(3);
  });

  test("patch adams", () => {
    const patchListener = vi.fn();
    onPatch(store, patchListener);

    store.addPerson(
      Person.create({
        firstName: "Eli",
        lastName: "Schutze",
        yearOfBirth: 1991,
      })
    );
    store.addPerson(
      Person.create({
        firstName: "John",
        lastName: "Doe",
        yearOfBirth: 1982,
      })
    );

    store.people.forEach((person) => {
      if (person.lastName === "Doe") {
        person.rename("Jon", "Snow");
      }
    });

    const patches = patchListener.mock.calls;

    expect(patches[0]).toMatchObject([
      {
        op: "add",
        path: "/people/2",
        value: {
          firstName: "Eli",
          lastName: "Schutze",
          yearOfBirth: 1991,
        },
      },
      {
        op: "remove",
        path: "/people/2",
      },
    ]);

    expect(patches[1]).toMatchObject([
      {
        op: "add",
        path: "/people/3",
        value: {
          firstName: "John",
          lastName: "Doe",
          yearOfBirth: 1982,
        },
      },
      {
        op: "remove",
        path: "/people/3",
      },
    ]);

    expect(patches[2]).toMatchObject([
      {
        op: "replace",
        path: "/people/3/firstName",
        value: "Jon",
      },
      {
        op: "replace",
        path: "/people/3/firstName",
        value: "John",
      },
    ]);

    expect(patches[3]).toMatchObject([
      {
        op: "replace",
        path: "/people/3/lastName",
        value: "Snow",
      },
      {
        op: "replace",
        path: "/people/3/lastName",
        value: "Doe",
      },
    ]);

    // rollback patches
    expect(store.people.length).toEqual(4);
    expect(store.people[3].firstName).toEqual("Jon");
    expect(store.people[3].lastName).toEqual("Snow");

    patches.reverse().forEach(([, revert]) => applyPatch(store, revert));

    // verify we get back to the same state
    expect(getSnapshot(store)).toEqual(initialState);
  });
});
