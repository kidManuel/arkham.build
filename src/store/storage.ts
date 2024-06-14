import { del, get, set } from "idb-keyval";
import { PersistStorage, StorageValue } from "zustand/middleware";

import { DataVersion } from "./graphql/types";
import { StoreState } from "./slices";
import { getInitialLookupTables } from "./slices/lookup-tables";
import { LookupTables } from "./slices/lookup-tables/types";
import { getInitialMetadata } from "./slices/metadata";
import { Metadata } from "./slices/metadata/types";
import { getInitialState } from "./slices/settings";
import { SettingsState } from "./slices/settings/types";

const VERSION = 1;

export const storageConfig = {
  name: "deckbuilder",
  storage: createCustomStorage(),
  version: VERSION,
  partialize(state: StoreState) {
    return {
      metadata: state.metadata,
      lookupTables: state.lookupTables,
      settings: state.settings,
    };
  },
  onRehydrateStorage: () => {
    console.time("[persist] hydration");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (state: StoreState | undefined, error?: unknown) => {
      if (state) state.setInitialized();
      if (error) console.error(error);
      console.timeEnd("[persist] hydration");
    };
  },
};

type MetadataVal = {
  metadata: Metadata;
  lookupTables: LookupTables;
};

type AppdataVal = {
  settings: SettingsState["settings"];
};

type Val = MetadataVal & AppdataVal;

function getMetadataDbName(name: string) {
  return `${name}-metadata`;
}

function getAppdataDbName(name: string) {
  return `${name}-app`;
}

function getMetadataKey(name: string) {
  return `${name}-data-version`;
}

export function getDataVersionIdentifier(version?: DataVersion) {
  return version
    ? `${version.locale}_${version.cards_updated_at}_${version.translation_updated_at}`
    : undefined;
}

type CustomStorage = {
  getAppdata: (name: string) => Promise<StorageValue<AppdataVal> | undefined>;
  getMetadata: (name: string) => Promise<StorageValue<MetadataVal> | undefined>;
  setAppdata: (name: string, value: StorageValue<Val>) => void;
  setMetadata: (name: string, value: StorageValue<Val>) => void;
};

function createCustomStorage():
  | (CustomStorage & PersistStorage<Val>)
  | undefined {
  return {
    async getAppdata(name: string) {
      return get(getAppdataDbName(name));
    },

    async getMetadata(name: string) {
      const data = await get(getMetadataDbName(name));

      if (data == null) {
        console.debug(`[persist] no metadata found in storage.`);
        // the item may have been deleted by the user, ensure storage key is purged as well.
        localStorage.removeItem(getMetadataKey(name));
        return null;
      }

      try {
        const parsed = JSON.parse(data);

        const version = getDataVersionIdentifier(
          parsed?.state?.metadata?.dataVersion,
        );
        if (!version) throw new TypeError(`stored data is missing version.`);
        localStorage.setItem(getMetadataKey(name), version);

        console.debug(`[persist] rehydrated card version: ${version}`);
        return parsed;
      } catch (err) {
        console.error("error during metadata hydration:", err);
        localStorage.removeItem(getMetadataKey(name));
        return null;
      }
    },

    async setAppdata(name, value) {
      console.debug(`[persist] save app data.`);
      return set(
        getAppdataDbName(name),
        JSON.stringify({
          state: { settings: value.state.settings },
          version: value.version,
        }),
      );
    },
    async setMetadata(name, value) {
      // TODO:support storing lookup tables and decks in separate IDB stores.
      // TODO: support translated data.
      const currentDataVersion = getDataVersionIdentifier(
        value.state.metadata.dataVersion,
      );

      const lookupTablesDataVersion = value.state.lookupTables.dataVersion;

      if (
        !currentDataVersion ||
        !lookupTablesDataVersion ||
        lookupTablesDataVersion !== currentDataVersion
      ) {
        console.debug("[persist] skip: store is uninitialized.");
        return;
      }

      const persistedDataVersion = localStorage.getItem(getMetadataKey(name));

      if (currentDataVersion === persistedDataVersion) {
        console.debug(`[persist] skip: stored metadata is in sync.`);
        return;
      } else {
        console.debug(`[persist] save: stored metadata is out of sync.`);
        localStorage.setItem(`${name}_data_version`, currentDataVersion);
        return set(
          getMetadataDbName(name),
          JSON.stringify({
            state: {
              metadata: value.state.metadata,
              lookupTables: value.state.lookupTables,
            },
            version: value.version,
          }),
        );
      }
    },
    async getItem(name) {
      try {
        const [metadata, appdata] = await Promise.all([
          this.getMetadata(name),
          this.getAppdata(name),
        ]);

        if (!metadata && !appdata) return null;

        const val: StorageValue<Val> = {
          state: {
            metadata: metadata?.state?.metadata ?? getInitialMetadata(),
            lookupTables:
              metadata?.state?.lookupTables ?? getInitialLookupTables(),
            settings: appdata?.state?.settings ?? getInitialState().settings,
          },
          version: Math.min(metadata?.version ?? 1, appdata?.version ?? 1),
        };

        return val;
      } catch (err) {
        console.error(err);
        localStorage.removeItem(getMetadataKey(name));
        return null;
      }
    },
    async setItem(name, value) {
      await Promise.all([
        this.setAppdata(name, value),
        this.setMetadata(name, value),
      ]);
    },
    async removeItem(name) {
      return del(name);
    },
  };
}
