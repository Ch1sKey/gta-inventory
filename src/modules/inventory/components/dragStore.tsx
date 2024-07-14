import { InventoryItem } from "../types/InventoryItem";
import { create } from "zustand";

type InventoryPlacementData = {
  itemUnderHover: InventoryItem | null;
  inventoryIndex: string | null;
  indexes: number[] | null;
  status: "allow" | "reject";
};

type DragSoreType = {
  items: InventoryItem[];
  isDragging: boolean;
  draggingItem: InventoryItem | null;
  draggignElement: HTMLElement | null;
  onDragStart: (item: InventoryItem, element: HTMLElement) => void;
  onDrop: () => void;
  setItems: (items: InventoryItem[]) => void;
  setHoverData: (placementData: InventoryPlacementData) => void;
  placementData: InventoryPlacementData;
};

export const useStore = create<DragSoreType>((set) => ({
  items: [],
  draggingItem: null,
  draggignElement: null,
  isDragging: false,
  placementData: {
    inventoryIndex: null,
    indexes: null,
    status: "allow",
    itemUnderHover: null,
  },
  hoverInventoryId: null,
  setItems: (items: InventoryItem[]) => set(() => ({ items })),
  setHoverData: (placementData: InventoryPlacementData) =>
    set(() => ({ placementData })),
  onDragStart: (item: InventoryItem, element: HTMLElement) =>
    set(() => ({
      isDragging: true,
      draggingItem: item,
      draggignElement: element,
      placementData: {
        inventoryIndex: null,
        indexes: null,
        status: "reject",
        itemUnderHover: null,
      },
    })),
  onDrop: () =>
    set(({ draggingItem, placementData, items }) => {
      const { indexes, inventoryIndex, status } = placementData;
      console.log("ondrop");
      if (
        !draggingItem ||
        indexes === null ||
        inventoryIndex === null ||
        status === "reject"
      ) {
        return {
          isDragging: false,
          placementData: {
            itemUnderHover: null,
            inventoryIndex: null,
            indexes: null,
            status: "allow",
          },
          draggingItem: null,
        };
      }
      const itemToMoveIndex = items.findIndex(
        ({ id }) => id === draggingItem.id
      );
      const newItems = [...items];

      const placingOnItem = newItems.find(
        ({ id }) => id === placementData.itemUnderHover?.id
      );
      const newDraggingItemIndex = newItems.findIndex(
        ({ id }) => id === draggingItem.id
      );
      const newDraggingItem = newItems[newDraggingItemIndex];

      if (placingOnItem && newDraggingItem) {
        if (placingOnItem.itemId === draggingItem.itemId) {
          const maxStack = placingOnItem.maxStack;
          if (placingOnItem.quantity + draggingItem.quantity <= maxStack) {
            placingOnItem.quantity += draggingItem.quantity;
            newDraggingItem.quantity -= draggingItem.quantity;
            if (newDraggingItem.quantity === 0) {
              newItems.splice(newDraggingItemIndex, 1);
            }
          }
        }
      } else {
        newItems.splice(itemToMoveIndex, 1, {
          ...newDraggingItem,
          itemIndex: indexes[0],
          inventoryId: inventoryIndex,
        });
      }

      return {
        items: newItems,
        isDragging: false,
        placementData: {
          inventoryIndex: null,
          itemUnderHover: null,
          indexes: null,
          status: "allow",
        },
        draggingItem: null,
      };
    }),
}));
