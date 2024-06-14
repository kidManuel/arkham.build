import type { DeckOptionSelectType } from "@/store/services/types";

export type Slot = "slots" | "sideSlots" | "extraSlots";

export type Tab = Slot | "meta";

type SlotEdit = {
  code: string;
  quantity: number;
};

export type EditState = {
  edits: {
    quantities: {
      slots?: SlotEdit[];
      sideSlots?: SlotEdit[];
      extraSlots?: SlotEdit[];
    };
    meta: Record<string, string | null>;
    tabooId?: number | null;
    investigatorFront?: string | null;
    investigatorBack?: string | null;
  };
  mode: "edit";
  activeTab: Tab;
};

export type ViewState = {
  mode: "view";
};

export type DeckViewState = {
  id: string;
} & (EditState | ViewState);

export type DeckViewSlice = {
  deckView: DeckViewState | null;

  setActiveDeck(id?: string, type?: "view" | "edit"): void;

  changeCardQuantity(code: string, quantity: number, slot?: Slot): void;

  updateActiveTab(value: string): void;

  updateTabooId(value: number | null): void;

  updateInvestigatorSide(side: string, code: string): void;

  updateMetaProperty(
    key: string,
    value: string | null,
    type: DeckOptionSelectType,
  ): void;
};