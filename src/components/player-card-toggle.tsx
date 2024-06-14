import { useCallback } from "react";
import SvgAutoFail from "./icons/auto-fail";
import SvgInvestigator from "./icons/investigator";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useStore } from "@/store";
import { CardTypeFilter } from "@/store/slices/filters/types";
import { selectActiveCardType } from "@/store/selectors/filters";

export function PlayerCardToggle() {
  const cardTypeFilter = useStore(selectActiveCardType);
  const setCardTypeFilter = useStore((state) => state.setCardTypeFilter);

  const onToggle = useCallback(
    (value: string) => {
      // TODO: enforce this cast in a selector.
      if (value) setCardTypeFilter(value as CardTypeFilter);
    },
    [setCardTypeFilter],
  );

  return (
    <ToggleGroup
      defaultValue="player"
      icons
      onValueChange={onToggle}
      type="single"
      value={cardTypeFilter}
    >
      <ToggleGroupItem value="player">
        <SvgInvestigator />
      </ToggleGroupItem>
      <ToggleGroupItem value="encounter">
        <SvgAutoFail />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
