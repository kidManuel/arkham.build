import type { CardWithRelations, ResolvedCard } from "@/store/lib/types";

export type CardSet = {
  canSetQuantity?: boolean;
  canSelect?: boolean;
  cards: ResolvedCard[];
  id: string;
  quantities?: Record<string, number>;
  selected: boolean;
  title: string;
};

const CARD_SET_ORDER = [
  "parallel",
  "requiredCards",
  "advanced",
  "replacement",
  "parallelCards",
  "bound",
  "bonded",
  "level",
];

export function sortCardSets(a: string, b: string) {
  return CARD_SET_ORDER.indexOf(a) - CARD_SET_ORDER.indexOf(b);
}

export function getCardSetTitle(id: string) {
  if (id === "parallel") return "Parallel investigator";
  if (id === "parallelCards") return "Parallel cards";
  if (id === "requiredCards") return "Signatures";
  if (id === "advanced") return "Advanced signatures";
  if (id === "replacement") return "Replacements";
  if (id === "bound") return "Bound";
  if (id === "bonded") return "Bonded";
  if (id === "restrictedTo") return "Restricted";
  if (id === "level") return "Other levels";
  return id;
}

export function pickRelatedCardSets(card: CardWithRelations) {
  const relations = card?.relations ?? {};
  return Object.entries(relations)
    .filter(
      ([key, value]) =>
        key !== "duplicates" &&
        key !== "level" &&
        (Array.isArray(value) ? value.length > 0 : value),
    )
    .toSorted((a, b) => sortCardSets(a[0], b[0]));
}

export function getRelatedCardQuantity(
  key: string,
  set: ResolvedCard | ResolvedCard[],
) {
  const cards = Array.isArray(set) ? set : [set];
  const canShowQuantity = key !== "parallel" && key !== "level";

  return canShowQuantity
    ? cards.reduce(
        (acc, { card }) => ({
          ...acc,
          [card.code]: card.quantity,
        }),
        {},
      )
    : undefined;
}
