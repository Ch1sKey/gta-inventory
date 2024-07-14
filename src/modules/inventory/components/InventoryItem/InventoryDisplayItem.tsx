import { MouseEventHandler, useCallback, useMemo, useRef } from "react";
import { InventoryItem } from "../../types/InventoryItem";
import styles from "./InventoryItem.module.scss";
import appleImg from "../../assets/items/apple.png";
import gunImg from "../../assets/items/gun.png";
import hammerImg from "../../assets/items/hammer.png";
import unknownImg from "../../assets/items/unknown.png";
import { useStore } from "../dragStore";

interface InventoryItemProps {
  item: InventoryItem;
  itemIndex: number;
  inventoryId: string;
  cellSize: number;
  gridWidth: number;
  onDrop: () => boolean;
  onDragStart: (item: InventoryItem, element: HTMLElement) => void;
}
const itemIdToImageMap: Record<string, string> = {
  "1": appleImg,
  "2": gunImg,
  "3": hammerImg,
};

export const indexToCoords = (index: number, gridWidth: number) => {
  return { col: index % gridWidth, row: Math.floor(index / gridWidth) };
};

export const InventoryDisplayItem = ({
  item,
  cellSize,
  gridWidth,
  onDragStart,
  onDrop,
}: InventoryItemProps) => {
  const { placementData, draggingItem } = useStore((state) => ({
    placementData: state.placementData,
    draggingItem: state.draggingItem,
  }));
  const itemElem = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const coords = useMemo(() => {
    const { col, row } = indexToCoords(item.itemIndex, gridWidth);
    return {
      x: col * cellSize,
      y: row * cellSize,
    };
  }, [cellSize, gridWidth, item.itemIndex]);

  const imageSrc = useMemo(() => {
    return itemIdToImageMap[item.itemId] ?? unknownImg;
  }, [item.itemId]);

  const handlePointerMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (!itemElem.current || !dragStart.current) return;
      const x = e.clientX - dragStart.current?.x;
      const y = e.clientY - dragStart.current?.y;
      itemElem.current.style.transform = `translate(${x}px, ${y}px)`;
      itemElem.current.style.zIndex = "105";
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    dragStart.current = null;
    window.removeEventListener("mousemove", handlePointerMove);
    if (itemElem.current) {
      onDrop();
      const successfullyDropped = true;
      itemElem.current.style.transform = "";
      itemElem.current.style.zIndex = "10";
      if (successfullyDropped) return;
      setTimeout(() => {
        if (!itemElem.current) return;
        itemElem.current.style.transition = "0.3s";
        itemElem.current.style.transition = "";
      }, 400);
    }
  }, [handlePointerMove, onDrop]);

  const handlePointerDown = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (!itemElem.current) return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      onDragStart(item, itemElem.current);
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp, { once: true });
    },
    [handlePointerMove, handlePointerUp, item, onDragStart]
  );

  const isRejectedDragging = useMemo(() => {
    return (
      draggingItem?.id === item.id &&
      placementData.inventoryIndex &&
      placementData.status === "reject"
    );
  }, [draggingItem, item.id, placementData]);

  const itemBg = useMemo(() => {
    if (!draggingItem || draggingItem.id !== item.id) return "rgb(22, 22, 22)";
    if (isRejectedDragging) return "tomato";
    return "unset";
  }, [draggingItem, isRejectedDragging, item.id]);

  return (
    <div
      ref={itemElem}
      style={{
        width: `${item.width * cellSize - 2}px`,
        height: `${item.height * cellSize - 2}px`,
        left: `${coords.x + 1}px`,
        top: `${coords.y + 1}px`,
        backgroundColor: itemBg,
        opacity: isRejectedDragging ? "0.9" : "1",
        borderRadius: draggingItem?.id === item.id ? `15px` : "0",
      }}
      onMouseDown={handlePointerDown}
      className={styles.item}
      key={item.id}
    >
      <div className={styles.itemData}>
        <div className={styles.topLeft}></div>
        <div className={styles.topRight}>
          {item.quantity > 1 ? `x${item.quantity}` : ""}
        </div>
        <div className={styles.bottomLeft}></div>
        <div className={styles.bottomRight}></div>
      </div>
      <div
        className={styles.itemImage}
        style={{
          backgroundImage: `url(${imageSrc})`,
          opacity: isRejectedDragging ? "0.9" : "1",
        }}
      ></div>
    </div>
  );
};
