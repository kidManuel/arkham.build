import type { ChartableData } from "@/store/lib/types";
import type { FactionName } from "@/utils/constants";
import { capitalize } from "@/utils/formatting";
import { useRef } from "react";
import { VictoryPie } from "victory";
import { useElementSize } from "../../utils/use-element-size";
import { chartsTheme } from "./chart-theme";
import css from "./deck-tools.module.css";

type Props = {
  data: ChartableData<FactionName>;
};

export default function FactionsChart({ data }: Props) {
  const ref = useRef(null);
  const { width } = useElementSize(ref);

  return (
    <div ref={ref} className={css["chart-container"]}>
      <h4 className={css["chart-title"]}>Factions</h4>
      <VictoryPie
        data={data}
        theme={chartsTheme}
        labelPlacement="perpendicular"
        labels={({ datum }) => capitalize(datum.xName)}
        width={width}
        sortKey={"y"}
        style={{
          data: {
            fill: ({ datum }) =>
              `var(--${datum.xName === "neutral" ? "text" : "color"}-${
                datum.xName
              })`,
          },
        }}
      />
    </div>
  );
}
