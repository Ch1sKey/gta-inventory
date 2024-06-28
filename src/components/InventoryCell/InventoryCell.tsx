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
  onReveal,
}: InventoryCell) => {
  const cover = useRef<HTMLDivElement | null>(null);
  const isDragging = useStore((state) => state.isDragging);
  const placementData = useStore((state) => state.placementData);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const [height, setHeight] = useState(100);

  const abortReveal = useCallback(() => {
    if (!revealTimeout.current) return;
    if (!cover.current) return;

    clearTimeout(revealTimeout.current);
    cover.current.style.transition = "0s";
    cover.current.style.height = "100%";
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!cover.current) return;
    cover.current.style.transitionTimingFunction = "linear";
    cover.current.style.transformOrigin = "bottom";
    cover.current.style.transition = "0.5s";
    cover.current.style.height = "0";
    revealTimeout.current = setTimeout(() => {
      onReveal();
      console.log("reveal");
    }, 500);

    window.addEventListener("mouseup", abortReveal, { once: true });
  }, [abortReveal, onReveal]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mouseup", abortReveal);
    };
  });

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
      onMouseDown={handleMouseDown}
    >
      <div
        ref={cover}
        style={{ display: isHidden ? "block" : "none" }}
        className={styles.cellCover}
      ></div>
    </div>
  );
};
