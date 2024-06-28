import { useState } from "react";
import styles from "./App.module.scss";
import { InventoryField } from "./components/InventoryField/InventoryField";
import { InventoryItem } from "./types/InventoryItem";
import { useStore } from "./components/dragStore";
import { dummyItems } from "./dummyItems";

function App() {
  const [items, setItems] = useState<InventoryItem[]>(dummyItems);

  const setItemsStore = useStore((state) => state.setItems);
  setItemsStore(items);

  return (
    <div className={styles.coverContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.fieldContainer}>
          <>
            <div className={styles.left}>
              <InventoryField
                title="Карман"
                width={5}
                height={2}
                maxWeight={20}
                inventoryIndex="pocket"
              />
              <InventoryField
                title="Портфель"
                width={5}
                height={4}
                maxWeight={40}
                inventoryIndex="backpack"
              />
            </div>
            <div className={styles.right}>
              <InventoryField
                title="Багажник"
                width={5}
                height={7}
                maxWeight={60}
                inventoryIndex="trunk"
              />
            </div>
          </>
        </div>
      </div>
    </div>
  );
}

export default App;
