import { CollapseSidebarButton } from "@/components/collapse-sidebar-button";
import { DeckCollectionFilters } from "@/components/deck-collection-filters/deck-filters-wrapper";
import {
  useDeleteDeck,
  useDuplicateDeck,
} from "@/components/deck-display/hooks";
import { DeckSummary } from "@/components/deck-summary";
import { DeckTags } from "@/components/deck-tags";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Scroller } from "@/components/ui/scroller";
import { useToast } from "@/components/ui/toast.hooks";
import { useStore } from "@/store";
import { selectDecksDisplayList } from "@/store/selectors/deck-filters";
import { EllipsisIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "wouter";
import { DeckCollectionImport } from "./deck-collection-import";
import css from "./deck-collection.module.css";

export function DeckCollection() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const deckCollection = useStore(selectDecksDisplayList);

  const importDecks = useStore((state) => state.importFromFiles);
  const deleteAllDecks = useStore((state) => state.deleteAllDecks);
  const setSidebarOpen = useStore((state) => state.setSidebarOpen);

  const toast = useToast();

  const onAddFiles = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const files = evt.target.files;
      if (files?.length) {
        importDecks(files);
        setPopoverOpen(false);
      }
    },
    [importDecks],
  );

  const onDeleteAll = useCallback(async () => {
    const confirmed = confirm(
      "Are you sure you want to delete all local decks in your collection?",
    );

    if (confirmed) {
      setPopoverOpen(false);

      const toastId = toast.show({
        children: "Deleting all decks...",
      });
      try {
        await deleteAllDecks();
        toast.dismiss(toastId);
        toast.show({
          children: "Decks delete successful.",
          duration: 3000,
          variant: "success",
        });
      } catch (err) {
        toast.dismiss(toastId);
        toast.show({
          children: `Decks could not be deleted: ${(err as Error)?.message}.`,
          variant: "error",
        });
      }
    }
  }, [deleteAllDecks, toast]);

  const deleteDeck = useDeleteDeck();
  const duplicateDeck = useDuplicateDeck();

  return (
    <div className={css["container"]}>
      <CollapseSidebarButton
        onClick={() => {
          setSidebarOpen(false);
        }}
        orientation="left"
        className={css["collapse"]}
      />
      <header className={css["header"]}>
        <h2 className={css["title"]}>Decks</h2>
        <div className={css["actions"]}>
          <Popover>
            <DeckCollectionImport />
          </Popover>
          <Link asChild to="/deck/create">
            <Button
              as="a"
              data-testid="collection-create-deck"
              tooltip="Create new deck"
            >
              <PlusIcon />
            </Button>
          </Link>
          <Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="bare"
                data-testid="collection-more-actions"
                tooltip="More actions"
              >
                <EllipsisIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <DropdownMenu>
                <Button
                  as="label"
                  data-testid="collection-import-file"
                  htmlFor="collection-import"
                  size="full"
                  variant="bare"
                >
                  <UploadIcon /> Import from JSON files
                </Button>
                <input
                  id="collection-import"
                  type="file"
                  accept="application/json"
                  className={css["import-input"]}
                  multiple
                  onChange={onAddFiles}
                />
                <Button
                  as="label"
                  data-testid="collection-delete-all"
                  onClick={onDeleteAll}
                  size="full"
                  variant="bare"
                >
                  <Trash2Icon /> Delete all local decks
                </Button>
              </DropdownMenu>
            </PopoverContent>
          </Popover>
        </div>
      </header>
      {deckCollection.total > 1 && <DeckCollectionFilters />}
      {deckCollection.total ? (
        <Scroller>
          <ol className={css["decks"]}>
            {deckCollection.decks.map((deck) => (
              <li
                className={css["deck"]}
                data-testid="collection-deck"
                key={deck.id}
              >
                <Link href={`/deck/view/${deck.id}`}>
                  <DeckSummary
                    deck={deck}
                    interactive
                    onDeleteDeck={deleteDeck}
                    onDuplicateDeck={duplicateDeck}
                    showThumbnail
                    validation={deck.problem}
                  >
                    {deck.tags && <DeckTags tags={deck.tags} />}
                  </DeckSummary>
                </Link>
              </li>
            ))}
          </ol>
        </Scroller>
      ) : (
        <div className={css["placeholder-container"]}>
          <figure className={css["placeholder"]}>
            <i className="icon-deck" />
            <figcaption className={css["placeholder-caption"]}>
              Collection empty
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
