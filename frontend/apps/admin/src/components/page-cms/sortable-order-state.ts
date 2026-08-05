export type SortableOrderRecord = {
  id: string;
  display_order: number;
  revision: number;
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
  return JSON.stringify(sortByDisplayOrder(items).map(({ id, display_order, revision }) => [id, display_order, revision]));
}

function hasSameOrder<T extends SortableOrderRecord>(left: readonly T[], right: readonly T[]) {
  return left.map((item) => item.id).join("\u0000") === right.map((item) => item.id).join("\u0000");
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

  if (!state.isDirty) {
    return createOrderState(items);
  }

  const confirmedItems = normalizeDisplayOrders(sortByDisplayOrder(items));
  const serverItemsById = new Map(confirmedItems.map((item) => [item.id, item]));
  const localIds = new Set<string>();
  const orderedItems = state.orderedItems.flatMap((item) => {
    if (localIds.has(item.id)) return [];
    localIds.add(item.id);
    const serverItem = serverItemsById.get(item.id);
    return serverItem ? [serverItem] : [];
  });

  for (const item of confirmedItems) {
    if (!localIds.has(item.id)) orderedItems.push(item);
  }

  const normalizedOrderedItems = normalizeDisplayOrders(orderedItems);
  return {
    ...state,
    confirmedItems,
    orderedItems: normalizedOrderedItems,
    serverSignature: orderSignature(items),
    isDirty: !hasSameOrder(normalizedOrderedItems, confirmedItems),
    isSaving: false,
    saveError: null,
  };
}

type OrderStateListener<T extends SortableOrderRecord> = (state: SortableOrderState<T>) => void;

export class SortableOrderController<T extends SortableOrderRecord> {
  private orderState: SortableOrderState<T>;
  private serverRevision = 0;
  private readonly onStateChange?: OrderStateListener<T>;

  constructor(items: readonly T[], onStateChange?: OrderStateListener<T>) {
    this.orderState = createOrderState(items);
    this.onStateChange = onStateChange;
  }

  get state() {
    return this.orderState;
  }

  replaceDraftOrder(items: readonly T[]) {
    this.setState(replaceDraftOrder(this.orderState, items));
  }

  cancelOrderEdit() {
    if (this.orderState.isSaving) return;
    this.setState(cancelOrderEdit(this.orderState));
  }

  receiveServerOrder(items: readonly T[]) {
    const next = receiveServerOrder(this.orderState, items);
    if (next === this.orderState) return;
    this.serverRevision += 1;
    this.setState(next);
  }

  resetServerOrder(items: readonly T[]) {
    this.serverRevision += 1;
    this.setState(createOrderState(items));
  }

  async save(onOrderChange: (items: T[]) => void | Promise<void>) {
    if (!this.orderState.isDirty || this.orderState.isSaving) return;

    const normalizedItems = normalizeDisplayOrders(this.orderState.orderedItems);
    const saveRevision = this.serverRevision;
    this.setState(beginOrderSave(this.orderState));

    try {
      await onOrderChange(normalizedItems);
      if (this.serverRevision !== saveRevision) return;
      this.setState(confirmOrderSave(this.orderState, normalizedItems));
    } catch {
      if (this.serverRevision !== saveRevision) return;
      this.setState(rejectOrderSave(this.orderState, "Unable to save order. Try again or cancel to restore the saved order."));
    }
  }

  private setState(state: SortableOrderState<T>) {
    this.orderState = state;
    this.onStateChange?.(state);
  }
}
