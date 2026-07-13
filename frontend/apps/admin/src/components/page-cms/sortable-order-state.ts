export type SortableOrderRecord = {
  id: string;
  display_order: number;
};

export type SortableOrderState<T extends SortableOrderRecord> = {
  confirmedItems: T[];
  orderedItems: T[];
  serverSignature: string;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
};

export function sortByDisplayOrder<T extends SortableOrderRecord>(items: readonly T[]) {
  return [...items].sort((left, right) => left.display_order - right.display_order || left.id.localeCompare(right.id));
}

export function normalizeDisplayOrders<T extends SortableOrderRecord>(items: readonly T[]) {
  return items.map((item, index) => ({ ...item, display_order: (index + 1) * 10 }));
}

export function orderSignature<T extends SortableOrderRecord>(items: readonly T[]) {
  return JSON.stringify(sortByDisplayOrder(items).map((item) => item.id));
}

function hasSameOrder<T extends SortableOrderRecord>(left: readonly T[], right: readonly T[]) {
  return orderSignature(left) === orderSignature(right);
}

export function createOrderState<T extends SortableOrderRecord>(items: readonly T[]): SortableOrderState<T> {
  const confirmedItems = normalizeDisplayOrders(sortByDisplayOrder(items));

  return {
    confirmedItems,
    orderedItems: confirmedItems,
    serverSignature: orderSignature(items),
    isDirty: false,
    isSaving: false,
    saveError: null,
  };
}

export function replaceDraftOrder<T extends SortableOrderRecord>(state: SortableOrderState<T>, items: readonly T[]): SortableOrderState<T> {
  const orderedItems = normalizeDisplayOrders(items);

  return {
    ...state,
    orderedItems,
    isDirty: !hasSameOrder(orderedItems, state.confirmedItems),
    saveError: null,
  };
}

export function beginOrderSave<T extends SortableOrderRecord>(state: SortableOrderState<T>): SortableOrderState<T> {
  return { ...state, isSaving: true, saveError: null };
}

export function confirmOrderSave<T extends SortableOrderRecord>(
  state: SortableOrderState<T>,
  items: readonly T[],
): SortableOrderState<T> {
  const confirmedItems = normalizeDisplayOrders(items);

  return {
    ...state,
    confirmedItems,
    orderedItems: confirmedItems,
    serverSignature: orderSignature(confirmedItems),
    isDirty: false,
    isSaving: false,
    saveError: null,
  };
}

export function rejectOrderSave<T extends SortableOrderRecord>(state: SortableOrderState<T>, saveError: string): SortableOrderState<T> {
  return { ...state, isSaving: false, saveError };
}

export function cancelOrderEdit<T extends SortableOrderRecord>(state: SortableOrderState<T>): SortableOrderState<T> {
  return {
    ...state,
    orderedItems: state.confirmedItems,
    isDirty: false,
    saveError: null,
  };
}

export function receiveServerOrder<T extends SortableOrderRecord>(state: SortableOrderState<T>, items: readonly T[]): SortableOrderState<T> {
  if (state.serverSignature === orderSignature(items)) {
    return state;
  }

  return createOrderState(items);
}
