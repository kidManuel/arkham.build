import { DeckSummary } from "@/components/deck-summary";
import { DecklistGroups } from "@/components/decklist/decklist-groups";
import { DecklistSection } from "@/components/decklist/decklist-section";
import { Scroller } from "@/components/ui/scroller";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DeckValidationResult } from "@/store/lib/deck-validation";
import type { Tab } from "@/store/slices/deck-edits.types";

import css from "./editor.module.css";

import type { ResolvedDeck } from "@/store/lib/types";
import type { Card } from "@/store/services/queries.types";
import { useAccentColor } from "@/utils/use-accent-color";
import { EditorActions } from "./editor-actions";
import { InvestigatorListcard } from "./investigator-listcard";
import { MetaEditor } from "./meta-editor";

type Props = {
  className?: string;
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  deck: ResolvedDeck;
  renderListCardAfter?: (card: Card, quantity?: number) => React.ReactNode;
  validation?: DeckValidationResult;
};

export function Editor(props: Props) {
  const { currentTab, onTabChange, deck, renderListCardAfter, validation } =
    props;

  const cssVariables = useAccentColor(deck.investigatorBack.card.faction_code);

  return (
    <div className={css["editor"]} style={cssVariables}>
      <DeckSummary deck={deck} validation={validation} />

      <InvestigatorListcard deck={deck} />

      <Tabs
        className={css["editor-tabs"]}
        length={deck.hasExtraDeck ? 4 : 3}
        onValueChange={(value: string) => {
          onTabChange(value as Tab);
        }}
        value={currentTab}
      >
        <TabsList className={css["editor-tabs-list"]}>
          <TabsTrigger value="slots" data-testid="editor-tab-slots">
            Deck
          </TabsTrigger>
          <TabsTrigger value="sideSlots" data-testid="editor-tab-sideslots">
            Side
          </TabsTrigger>
          {deck.hasExtraDeck && (
            <TabsTrigger value="extraSlots" data-testid="editor-tab-extraslots">
              Spirits
            </TabsTrigger>
          )}
          <TabsTrigger value="meta" data-testid="editor-tab-meta">
            Meta
          </TabsTrigger>
        </TabsList>

        <Scroller className={css["editor-tabs-content"]}>
          <TabsContent value="slots" data-testid="editor-tabs-slots">
            <DecklistSection title="Cards">
              <DecklistGroups
                group={deck.groups.slots.data}
                ignoredCounts={deck.ignoreDeckLimitSlots ?? undefined}
                layout="two_column"
                listCardSize="sm"
                mapping="slots"
                renderListCardAfter={renderListCardAfter}
                quantities={deck.slots}
              />
            </DecklistSection>
            {deck.groups.bondedSlots && deck.bondedSlots && (
              <DecklistSection showTitle title="Bonded cards">
                <DecklistGroups
                  group={deck.groups.bondedSlots.data}
                  layout="two_column"
                  listCardSize="sm"
                  mapping="bonded"
                  quantities={deck.bondedSlots}
                />
              </DecklistSection>
            )}
          </TabsContent>

          <TabsContent value="sideSlots">
            <DecklistSection title="Side Deck">
              {deck.groups.sideSlots?.data ? (
                <DecklistGroups
                  group={deck.groups.sideSlots.data}
                  layout="two_column"
                  listCardSize="sm"
                  mapping="sideSlots"
                  quantities={deck.sideSlots ?? undefined}
                />
              ) : (
                <Placeholder name="Side deck" />
              )}
            </DecklistSection>
          </TabsContent>

          {deck.hasExtraDeck && (
            <TabsContent value="extraSlots">
              <DecklistSection title="Spirits">
                {deck.groups.extraSlots?.data ? (
                  <DecklistGroups
                    group={deck.groups.extraSlots.data}
                    layout="one_column"
                    listCardSize="sm"
                    mapping="extraSlots"
                    quantities={deck.extraSlots ?? undefined}
                  />
                ) : (
                  <Placeholder name="Spirit deck" />
                )}
              </DecklistSection>
            </TabsContent>
          )}

          <TabsContent value="meta">
            <MetaEditor deck={deck} />
          </TabsContent>
        </Scroller>
        <EditorActions currentTab={currentTab} deck={deck} />
      </Tabs>
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return <div className={css["editor-placeholder"]}>{name} is empty.</div>;
}
