import { assert } from "@/utils/assert";
import type { StateCreator } from "zustand";
import type { StoreState } from ".";
import { formatDeckExport, formatDeckImport } from "../lib/deck-io";
import { selectClientId } from "../selectors/shared";
import { createShare, deleteShare, updateShare } from "../services/queries";
import { type Deck, isDeck } from "./data.types";
import type { SharingSlice } from "./sharing.types";

export function getInitialSharingState() {
  return {
    decks: {},
  };
}

export const createSharingSlice: StateCreator<
  StoreState,
  [],
  [],
  SharingSlice
> = (set, get) => ({
  sharing: getInitialSharingState(),

  async createShare(id) {
    const state = get();

    assert(!state.sharing.decks[id], `Deck with id ${id} is already shared.`);

    const deck = state.data.deckCollection.decks[id];
    assert(deck, `Deck with id ${id} not found.`);

    await createShare(selectClientId(state), formatDeckExport(deck));

    set({
      sharing: {
        decks: {
          ...state.sharing.decks,
          [id]: deck.date_update,
        },
      },
    });
  },

  async updateShare(id) {
    const state = get();

    if (!state.sharing.decks[id]) return;

    const deck = state.data.deckCollection.decks[id];
    assert(deck, `Deck with id ${id} not found.`);

    await updateShare(selectClientId(state), id, formatDeckExport(deck));

    set({
      sharing: {
        ...state.sharing,
        decks: {
          ...state.sharing.decks,
          [id]: deck.date_update,
        },
      },
    });

    return id;
  },

  async deleteShare(id) {
    const state = get();

    if (!state.sharing.decks[id]) return;

    await deleteShare(selectClientId(state), id);

    const decks = { ...state.sharing.decks };
    delete decks[id];

    set({
      sharing: {
        decks,
      },
    });
  },

  async deleteAllShares() {
    const state = get();

    const decks = { ...state.sharing.decks };

    // TODO: surface this error.
    await Promise.all(
      Object.keys(decks).map((id) => deleteShare(selectClientId(state), id)),
    ).catch(console.error);

    set({
      sharing: {
        decks: {},
      },
    });
  },
  importSharedDeck(importDeck) {
    const state = get();

    assert(
      !state.data.deckCollection.decks[importDeck.id],
      `Deck with id ${importDeck.id} already exists.`,
    );

    const deck = formatDeckImport(state, importDeck as Deck, "deck");
    assert(isDeck(deck), "Invalid deck data.");

    set({
      data: {
        ...state.data,
        deckCollection: {
          filters: { ...state.data.deckCollection.filters },
          decks: {
            ...state.data.deckCollection.decks,
            [deck.id]: deck,
          },
        },
        history: {
          ...state.data.history,
          [deck.id]: [],
        },
      },
    });

    return deck.id;
  },
});
