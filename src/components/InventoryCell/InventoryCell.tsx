import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../dragStore";
import styles from "./InventiryCell.module.scss";

type InventoryCell = {
  onReveal: () => void;
  isHidden: boolean;
  inventoryIndex: string;
  cellIndex: number;
};

export const InventoryCell = ({
  isHidden,
  cellIndex,
  inventoryIndex,
}: InventoryCell) => {
  const cover = useRef<HTMLDivElement | null>(null);
  const isDragging = useStore((state) => state.isDragging);
  const placementData = useStore((state) => state.placementData);

  return (
    <div
      className={`${styles.fieldCell} ${
        isDragging &&
        placementData.indexes?.includes(cellIndex) &&
        placementData.status === "allow" &&
        placementData.inventoryIndex === inventoryIndex
          ? styles.ghost
          : ""
      }`}
    >
      <div
        ref={cover}
        style={{ display: isHidden ? "block" : "none" }}
        className={styles.cellCover}
      ></div>
    </div>
  );
};
