import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./InventoryField.module.scss";
import { InventoryItem } from "../../types/InventoryItem";
import {
  indexToCoords,
  InventoryDisplayItem,
} from "../InventoryItem/InventoryDisplayItem";
import { useStore } from "../dragStore";
import { InventoryCell } from "../InventoryCell/InventoryCell";

const numberFormat = new Intl.NumberFormat();

const useCalculateCellSize = (
  gridField: React.MutableRefObject<HTMLDivElement | null>,
  gridWidth: number
) => {
  const [cellSize, setCellSize] = useState(0);

  const calculateCellSize = useCallback(() => {
    if (!gridField.current) return;
    setCellSize(gridField.current.offsetWidth / gridWidth);
  }, [gridField, gridWidth]);

  useEffect(() => {
    calculateCellSize();
    window.addEventListener("resize", calculateCellSize);
    return () => {
      window.removeEventListener("resize", calculateCellSize);
    };
  }, [calculateCellSize]);
  return cellSize;
};

interface InventoryFieldProps {
  title: string;
  width: number;
  height: number;
  maxWeight: number;
  inventoryIndex: string;
}

const isInRect = (x: number, y: number, rect: DOMRect) => {
  return (
    x > rect.x &&
    x < rect.x + rect.width &&
    y > rect.y &&
    y < rect.y + rect.height
  );
};

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const getItemIndexesInGrid = (
  startIndex: number,
  item: InventoryItem,
  gridWidth: number
) => {
  const indexes = [];
  for (let w = 0; w < item.width; w++) {
    for (let h = 0; h < item.height; h++) {
      console.log(startIndex + w + gridWidth * h);
      indexes.push(startIndex + w + gridWidth * h);
    }
  }
  return indexes;
};

const isOverweight = (
  item: InventoryItem,
  currentWeight: number,
  maxWeight: number
) => {
  return currentWeight + item.weight * item.quantity > maxWeight;
};

export const InventoryField = ({
  title,
  width,
  height,
  maxWeight,
  inventoryIndex,
}: InventoryFieldProps) => {
  const {
    setHoverData,
    isDragging,
    draggignElement,
    draggingItem,
    placementData,
    onDrop,
    onDragStart,
    items: storeItems,
  } = useStore((state) => state);

  const items = useMemo(() => {
    return storeItems.filter((item) => item.inventoryId === inventoryIndex);
  }, [inventoryIndex, storeItems]);

  const [hiddenIndexes, setHiddenIndexes] = useState<number[]>([4, 19]);

  const filledIndexes = useRef<Map<number, InventoryItem>>(new Map());
  useEffect(() => {
    const indexes = filledIndexes.current;
    for (const item of items) {
      getItemIndexesInGrid(item.itemIndex, item, width).forEach((index) =>
        indexes.set(index, item)
      );
    }
    return () => {
      indexes.clear();
    };
  }, [items, width]);

  const gridField = useRef<HTMLDivElement | null>(null);
  const gridDetect = useRef<HTMLDivElement | null>(null);
  const cellSize = useCalculateCellSize(gridField, width);
  const bagWeight = useMemo(
    () => items.reduce((acc, curr) => acc + curr.weight * curr.quantity, 0),
    [items]
  );

  const triggetMaxWeight = useMemo(() => {
    return (
      draggingItem &&
      draggingItem.inventoryId !== inventoryIndex &&
      placementData.inventoryIndex === inventoryIndex &&
      isOverweight(draggingItem, bagWeight, maxWeight)
    );
  }, [
    bagWeight,
    draggingItem,
    inventoryIndex,
    maxWeight,
    placementData.inventoryIndex,
  ]);

  const gridStyles = useMemo<React.CSSProperties>(() => {
    return {
      // Use cellSize here after ingame check
      gridTemplateColumns: `repeat(${width}, minmax(20px, calc( 100vw / 15 ))`,
    };
  }, [width]);

  const handleMouseMove = useCallback(() => {
    if (!gridDetect.current) return;
    if (!draggignElement) return;
    if (!draggingItem) return;
    const detectRect = gridDetect.current.getBoundingClientRect();
    const elementRect = draggignElement.getBoundingClientRect();
    const clientX = elementRect.x + elementRect.width / 2;
    const clientY = elementRect.y + elementRect.height / 2;
    if (!isInRect(clientX, clientY, detectRect)) return;
    const gridCursorPos = {
      x: clientX - detectRect.left,
      y: clientY - detectRect.top,
    };
    const x = Math.floor(gridCursorPos.x / cellSize);
    const y = Math.floor(gridCursorPos.y / cellSize);
    const index = width * y + x;

    const indexes = getItemIndexesInGrid(index, draggingItem, width);
    let status: "allow" | "reject" = "allow";
    let itemUnderHover: null | InventoryItem = null;

    for (let i = 0; i < indexes.length; i++) {
      const currentIndex = indexes[i];

      // Is index filled
      if (
        filledIndexes.current.has(currentIndex) &&
        filledIndexes.current.get(currentIndex)?.id !== draggingItem.id
      ) {
        itemUnderHover = filledIndexes.current.get(currentIndex) ?? null;
        if (itemUnderHover?.itemId === draggingItem.itemId) {
          console.log(
            itemUnderHover.quantity + draggingItem.quantity <=
              itemUnderHover.maxStack
          );
          if (
            itemUnderHover.quantity + draggingItem.quantity <=
            itemUnderHover.maxStack
          ) {
            status = "allow";
          } else {
            status = "reject";
          }
        } else {
          console.log("reject?");
          status = "reject";
        }
      }

      if (hiddenIndexes.includes(currentIndex)) {
        status = "reject";
      }
    }
    // Is in dimentions
    const { col, row } = indexToCoords(indexes[0], width);
    if (col + draggingItem.width > width) {
      status = "reject";
    }
    if (row + draggingItem.height > height) {
      status = "reject";
    }

    // If inventory fits
    const isItemInSameBag = draggingItem.inventoryId === inventoryIndex;
    if (!isItemInSameBag && isOverweight(draggingItem, bagWeight, maxWeight)) {
      status = "reject";
    }
    setHoverData({
      itemUnderHover,
      inventoryIndex,
      indexes,
      status,
    });
  }, [
    bagWeight,
    cellSize,
    draggignElement,
    draggingItem,
    height,
    hiddenIndexes,
    inventoryIndex,
    maxWeight,
    setHoverData,
    width,
  ]);

  const handleMouseLeave = useCallback(() => {
    setHoverData({
      itemUnderHover: null,
      inventoryIndex: null,
      indexes: null,
      status: "allow",
    });
  }, [setHoverData]);

  const handleDrop = () => {
    onDrop();
    return true;
  };

  const handleDragStart = (item: InventoryItem, elem: HTMLElement) => {
    onDragStart(item, elem);
  };

  useEffect(() => {
    if (!gridDetect.current) return;
    const grid = gridDetect.current;

    if (isDragging) {
      grid.addEventListener("mousemove", handleMouseMove);
      grid.addEventListener("mouseleave", handleMouseLeave);
    } else {
      grid.addEventListener("mousemove", handleMouseMove);
      grid.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      grid?.removeEventListener("mousemove", handleMouseMove);
      grid?.addEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave, handleMouseMove, isDragging]);

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{title}</div>
        <div
          style={{ color: triggetMaxWeight ? "tomato" : "rgb(57, 57, 57)" }}
          className={styles.headerInfo}
        >{`${numberFormat.format(bagWeight)} /${numberFormat.format(
          maxWeight
        )} кг`}</div>
      </div>
      <div className={styles.fieldContainer}>
        <div className={styles.fieldItems}>
          {items.map((item, index) => (
            <InventoryDisplayItem
              itemIndex={index}
              item={item}
              inventoryId={inventoryIndex}
              key={item.id}
              cellSize={cellSize}
              gridWidth={width}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
        <div className={styles.gridContainer}>
          <div
            ref={gridDetect}
            className={styles.gridMoveLayer}
            style={{
              width: width * cellSize,
              height: height * cellSize,
              zIndex: isDragging ? 120 : "unset",
              display: isDragging ? "block" : "none",
              backgroundColor: triggetMaxWeight
                ? "rgba(255,100,100, 0.3)"
                : "unset",
            }}
          ></div>
          <div ref={gridField} style={gridStyles} className={styles.fieldGrid}>
            {Array.from({ length: width * height }, (_, i) => (
              <InventoryCell
                key={i}
                onReveal={() =>
                  setHiddenIndexes((indexes) =>
                    indexes.filter((index) => index !== i)
                  )
                }
                inventoryIndex={inventoryIndex}
                isHidden={hiddenIndexes.includes(i)}
                cellIndex={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
