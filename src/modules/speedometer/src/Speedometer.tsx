import { useEffect, useState } from "react";
import { SpeedometerSVG } from "./SpeedometerSvg";

const speedChangeEvent = 'speedometerSetSpeed'

export const Speedometer = () => {

  const [speed, setSpeed] = useState(0);
  useEffect(() => {
    mp.events.add(speedChangeEvent, (newSpeed: number) => {
      setSpeed(newSpeed)
    })
    return () => {
      mp.events.remove(speedChangeEvent)
    };
  }, [setSpeed]);
  return (
    <div className="speedometerWrapper">
        <div className="speedText">{speed}</div>
        <SpeedometerSVG nimbRadius={Math.min(speed + 500, 600)} />
    </div>
  );
};
