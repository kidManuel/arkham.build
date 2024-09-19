function migrate(_state: unknown, version: number) {
  const state = _state as {
    data: {
      decks: Record<
        string,
        {
          id: string;
          next_deck: string;
        }
      >;
      history: Record<string | number, (string | number)[]>;
    };
  };

  if (version < 2) {
    for (const deck of Object.values(state.data.decks)) {
      if (deck.next_deck != null) {
        delete state.data.decks[deck.id];
      }
    }

    state.data.history = {
      ...Object.values(state.data.decks).reduce<{
        [id: string | number]: (string | number)[];
      }>((acc, curr) => {
        acc[curr.id] = [];
        return acc;
      }, {}),
    };
  }
}

export default migrate;
