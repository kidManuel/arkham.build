import { useEffect, useReducer } from "react";

type StateLoading = {
  error: undefined;
  data: undefined;
  loading: true;
};

type StateSuccess<T> = {
  error: undefined;
  data: T;
  loading: false;
};

type StateError = {
  error: unknown;
  data: undefined;
  loading: false;
};

type State<T> = StateLoading | StateError | StateSuccess<T>;

type Action<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; payload: unknown };

function reducer<T>(_: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "LOADING":
      return { error: undefined, data: undefined, loading: true };
    case "SUCCESS":
      return { error: undefined, loading: false, data: action.payload };
    case "ERROR":
      return { data: undefined, loading: false, error: action.payload };
  }
}

type Query<T> = () => Promise<T>;

export function useQuery<T>(
  query: Query<T> | undefined,
  paused: boolean = false,
): State<T> {
  const [state, dispatch] = useReducer(reducer<T>, {
    loading: false,
    error: undefined,
    data: undefined,
  } as State<T>);

  useEffect(() => {
    if (!paused && query && !state.loading && !state.data && !state.error) {
      dispatch({ type: "LOADING" });

      query()
        .then((data) => {
          dispatch({ type: "SUCCESS", payload: data });
        })
        .catch((error) => {
          dispatch({ type: "ERROR", payload: error });
        });
    }
  }, [query, state, paused]);

  return state;
}
