import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellEditorParams,
  ICellRendererParams,
  RowDataTransaction,
} from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import { AgGridReact } from "ag-grid-react";
import { observer } from "mobx-react-lite";
import { IJsonPatch, onPatch } from "mobx-state-tree";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { PersonField } from "../model/Person";
import { RootInstance } from "../model/RootStore";

function CellRenderer(props: any) {
  return <span>{props.value}</span>;
}

const AddButtonRenderer = observer(({ node }: ICellRendererParams) => {
  const store = useStore();
  const insert = () => store.insertPersonAfter(node.data.id);
  const remove = () => store.removePerson(node.data.id);
  return (
    <>
      <button onClick={insert}>+</button>
      <button onClick={remove}>-</button>
    </>
  );
});

const CellEditor = observer(
  // cell editors need to forward refs, even if we don't use it
  forwardRef<{}, ICellEditorParams>(({ rowIndex, colDef }, ref) => {
    const store = useStore();
    const field = colDef.field as PersonField;
    const value = field !== undefined ? store.people[rowIndex][field] : "";
    const type = Array.isArray(colDef.type) ? colDef.type[0] : colDef.type;

    /** Extract value from input */
    const getValue = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number") {
        return event.target.valueAsNumber;
      } else {
        return event.target.value;
      }
    };

    /** Update entity when editor value changes */
    const onChangeListener = (event: React.ChangeEvent<HTMLInputElement>) => {
      store.people[rowIndex].updateField(field, getValue(event));
    };

    // focus on mount
    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <input
        type={type || "text"}
        className="my-editor"
        ref={inputRef}
        value={value}
        onChange={onChangeListener}
      />
    );
  })
);

const columnDefs: ColDef[] = [
  {
    field: "firstName",
    cellEditor: CellEditor,
    editable: true,
    type: "text",
  },
  { field: "lastName", cellEditor: CellEditor, editable: true, type: "text" },
  { field: "userName", cellRenderer: CellRenderer },
  {
    field: "yearOfBirth",
    cellEditor: CellEditor,
    editable: true,
    type: "number",
  },
  { field: "age", cellRenderer: CellRenderer },
  { field: "add", cellRenderer: AddButtonRenderer },
];

const patchToGridTransaction = (
  patch: IJsonPatch,
  revert: IJsonPatch,
  store: RootInstance
): RowDataTransaction | undefined => {
  const index = +patch.path.split("/")[2];
  switch (patch.op) {
    case "replace":
      return { update: [store.people[index].toPlainObject()] };
    case "add":
      return { add: [store.people[index].toPlainObject()], addIndex: index };
    case "remove":
      return { remove: [{ id: revert.value?.id }] };
    default:
      break;
  }
};

export const DataGridImpl = ({ store }: { store: RootInstance }) => {
  const [grid, setGrid] = useState<GridApi | null>(null);

  const onGridReady = ({ api }: GridReadyEvent) => setGrid(api);

  useEffect(() => {
    return onPatch(store, (patch, revert) => {
      const transaction = patchToGridTransaction(patch, revert, store);
      if (grid && transaction) {
        grid.applyTransaction(transaction);
      }
    });
  }, [grid]);

  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        getRowId={(row) => row.data.id}
        rowData={store.people.map((person) => person.toPlainObject())}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export const DataGrid = () => {
  const store = useStore();
  return <DataGridImpl store={store} />;
};
