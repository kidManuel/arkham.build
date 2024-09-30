import { createSelector } from "reselect";

import { assert } from "@/utils/assert";
import { FACTION_ORDER } from "@/utils/constants";
import { and, or } from "@/utils/fp";
import uFuzzy from "@leeoniya/ufuzzy";
import type { ResolvedDeck } from "../lib/types";
import type { StoreState } from "../slices";
import type { MultiselectFilter } from "../slices/lists.types";
import { selectLocalDecks } from "./decks";

import { capitalize } from "@/utils/formatting";
import type {
  DeckFiltersKey,
  DeckPropertyName,
  DeckValidity,
  RangeMinMax,
} from "../slices/deck-collection-filters.types";

// Arbitrarily chosen for now
const MATCHING_MAX_TOKEN_DISTANCE_DECKS = 4;

export const selectDeckFilters = (state: StoreState) =>
  state.deckFilters.filters;

export const selectDeckFilterValue = createSelector(
  selectDeckFilters,
  (_, filter: DeckFiltersKey) => filter,
  (filters, filter) => {
    return filters[filter];
  },
);

// Search
export const selectDeckSearchTerm = (state: StoreState) =>
  state.deckFilters.filters.search;

export const selectSearchableTextInDecks = createSelector(
  selectLocalDecks,
  (decks) => {
    // deck.investigator_name doesn't work for imported decks?
    return decks.map(
      (deck) =>
        `${deck.name}|${deck.investigator_name || deck.cards.investigator.card.real_name}`,
    );
  },
);

// Faction
export const selectDeckFactionFilter = (state: StoreState) =>
  state.deckFilters.filters.faction;

const filterDeckByFaction = (faction: string) => {
  return (deck: ResolvedDeck) => {
    return deck.cards.investigator.card.faction_code === faction;
  };
};

const makeDeckFactionFilter = (values: MultiselectFilter) => {
  return or(values.map((value) => filterDeckByFaction(value)));
};

// Tag
const filterDeckByTag = (tag: string) => {
  return (deck: ResolvedDeck) => {
    return deck.tags.includes(tag);
  };
};

const makeDeckTagsFilter = (values: MultiselectFilter) => {
  return or(values.map((value) => filterDeckByTag(value)));
};

export const selectTagsChanges = createSelector(
  selectDeckFilters,
  (filters) => {
    const tagsFilters = filters.tags;
    if (!tagsFilters.length) return "";
    return tagsFilters.map(capitalize).join(" or ");
  },
);

// Properties
export const selectDeckPropertiesFilter = (state: StoreState) =>
  state.deckFilters.filters.properties;

export const selectPropertiesChanges = createSelector(
  selectDeckPropertiesFilter,
  (properties) => {
    return Object.keys(properties)
      .filter((prop) => properties[prop as DeckPropertyName])
      .map(capitalize)
      .join(" and ");
  },
);

const makeDeckPropertiesFilter = (
  properties: Record<DeckPropertyName, boolean>,
) => {
  const filters = [];
  for (const property of Object.keys(properties)) {
    if (properties[property as DeckPropertyName]) {
      switch (property) {
        case "parallel":
          filters.push((deck: ResolvedDeck) =>
            Boolean(
              deck.investigatorFront.card.parallel ||
                deck.investigatorBack.card.parallel,
            ),
          );
      }
    }
  }
  return and(filters);
};

// Validity
const makeDeckValidityFilter = (value: Omit<DeckValidity, "all">) => {
  switch (value) {
    case "valid":
      return (deck: ResolvedDeck) => deck.problem === null;
    case "invalid":
      return (deck: ResolvedDeck) => Boolean(deck.problem);
    default:
      return (_: ResolvedDeck) => true;
  }
};

// Exp Cost
export const selectDecksMinMaxExpCost = createSelector(
  selectLocalDecks,
  (decks) => {
    const minmax: RangeMinMax = decks.reduce<[number, number]>(
      (acc, val) => {
        const { xpRequired } = val.stats;
        acc[0] = Math.min(acc[0], xpRequired);
        acc[1] = Math.max(acc[1], xpRequired);
        return acc;
      },
      [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    );
    return minmax;
  },
);

export const selectExpCostChanges = createSelector(
  selectDeckFilters,
  (filters) => {
    const expMinMax = filters.expCost;
    return expMinMax ? `${expMinMax[0]}-${expMinMax[1]} experience` : "";
  },
);

export const makeDeckExpCostFilter = (minmax: [number, number]) => {
  return (deck: ResolvedDeck) => {
    return (
      deck.stats.xpRequired >= minmax[0] && deck.stats.xpRequired <= minmax[1]
    );
  };
};

const selectFilteringFunc = createSelector(selectDeckFilters, (filters) => {
  const filterFuncs = [];
  for (const filter of Object.keys(filters) as DeckFiltersKey[]) {
    switch (filter) {
      case "faction": {
        const currentFilter = filters[filter];
        if (currentFilter.length) {
          filterFuncs.push(makeDeckFactionFilter(currentFilter));
        }
        break;
      }
      case "tags": {
        const currentFilter = filters[filter];
        if (currentFilter.length) {
          filterFuncs.push(makeDeckTagsFilter(currentFilter));
        }
        break;
      }
      case "properties": {
        const currentFilter = filters[filter];
        filterFuncs.push(makeDeckPropertiesFilter(currentFilter));
        break;
      }
      case "validity": {
        const currentFilter = filters[filter];
        if (currentFilter !== "all") {
          filterFuncs.push(makeDeckValidityFilter(currentFilter));
        }
        break;
      }
      case "expCost": {
        const currentFilter = filters[filter];
        if (currentFilter) {
          filterFuncs.push(makeDeckExpCostFilter(currentFilter));
          break;
        }
      }
    }
  }

  return and(filterFuncs);
});

export const selectDecksFiltered = createSelector(
  selectLocalDecks,
  selectDeckSearchTerm,
  selectSearchableTextInDecks,
  selectFilteringFunc,
  (decks, searchTerm, searchableText, filterFunc) => {
    let decksToFilter: ResolvedDeck[];

    if (searchTerm) {
      const finder = new uFuzzy({
        intraMode: 0,
        interIns: MATCHING_MAX_TOKEN_DISTANCE_DECKS,
      });

      const results = finder.search(searchableText, searchTerm);

      decksToFilter = [];

      if (results[0]) {
        for (const result of results[0]) {
          assert(decks[result], "Searching outside of bounds");
          decksToFilter.push(decks[result]);
        }
      }
    } else {
      decksToFilter = [...decks];
    }

    const filteredDecks = decksToFilter.filter(filterFunc);
    return filteredDecks ?? decks;
  },
);

export const selectFactionsInLocalDecks = createSelector(
  selectLocalDecks,
  (state: StoreState) => state.metadata.factions,
  (decks, factionMeta) => {
    if (!decks) return [];

    const factionsSet = new Set<string>();

    for (const deck of decks) {
      factionsSet.add(deck.cards.investigator.card.faction_code);
    }

    const factions = Array.from(factionsSet).map((code) => factionMeta[code]);

    return factions.sort(
      (a, b) => FACTION_ORDER.indexOf(a.code) - FACTION_ORDER.indexOf(b.code),
    );
  },
);

export const selectTagsInLocalDecks = createSelector(
  selectLocalDecks,
  (decks) => {
    let tags: string[] = [];

    for (const deck of decks) {
      if (deck.tags) {
        const tagArray = deck.tags.split(" ");
        tags = tags.concat(tagArray);
      }
    }

    const uniqueTags = [...new Set(tags)].map((tag) => {
      return {
        code: tag,
      };
    });
    return uniqueTags;
  },
);
