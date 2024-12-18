import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast.hooks";
import { useStore } from "@/store";
import type { ResolvedDeck } from "@/store/lib/types";
import { cx } from "@/utils/cx";
import { capitalize } from "@/utils/formatting";
import { ShareIcon } from "lucide-react";
import css from "./sidebar.module.css";

type Props = {
  deck: ResolvedDeck;
};

export function Sharing(props: Props) {
  const { deck } = props;
  const toast = useToast();

  const share = useStore((state) => state.sharing.decks[props.deck.id]);

  const createShare = useStore((state) => state.createShare);
  const deleteShare = useStore((state) => state.deleteShare);
  const updateShare = useStore((state) => state.updateShare);

  async function withToast(fn: () => Promise<unknown>, action: string) {
    const id = toast.show({
      children: `${capitalize(action)} share...`,
    });

    try {
      await fn();
      toast.dismiss(id);
      toast.show({
        children: `Share ${action} successful`,
        variant: "success",
        duration: 3000,
      });
    } catch (err) {
      toast.dismiss(id);
      toast.show({
        children: `Failed to ${action} share: ${(err as Error).message}`,
        variant: "error",
      });
    }
  }

  const onCreateShare = async () => {
    await withToast(() => createShare(deck.id as string), "create");
  };

  const onDeleteShare = async () => {
    await withToast(() => deleteShare(deck.id as string), "delete");
  };

  const onUpdateShare = async () => {
    await withToast(() => updateShare(deck.id as string), "update");
  };

  const isReadOnly = !!deck.next_deck;

  return (
    <section className={css["details"]} data-testid="share">
      <div className={cx(css["detail"], css["full"])}>
        <header>
          <h3 className={css["detail-label"]}>
            <ShareIcon />
            Public share
          </h3>
        </header>
        <div className={css["detail-value"]}>
          {share ? (
            <div className={css["share"]}>
              <p>
                This deck has a public share, it can be viewed using this{" "}
                <a
                  data-testid="share-link"
                  href={`/share/${deck.id}`}
                  target="_blank"
                  rel="noreferrer "
                >
                  link
                </a>
                .
              </p>
              <p>
                Deck id: <code>{deck.id}</code>
              </p>
              <nav className={css["share-actions"]}>
                {deck.date_update !== share && (
                  <Button
                    disabled={isReadOnly}
                    onClick={onUpdateShare}
                    size="sm"
                    tooltip="Share is outdated."
                  >
                    Update share
                  </Button>
                )}
                <Button size="sm" onClick={onDeleteShare}>
                  Delete share
                </Button>
              </nav>
            </div>
          ) : (
            <div className={css["share-empty"]}>
              <p>Not shared.</p>
              <Button
                data-testid="share-create"
                disabled={isReadOnly}
                onClick={onCreateShare}
                size="sm"
                tooltip={
                  <>
                    Sharing creates a publicly accessible, read-only link to the
                    deck. Anyone with the link can view the deck, but not edit
                    it.
                    <br />
                    Shares can be removed at any time. Removing a share does not
                    affect the deck itself.
                    <br />
                    <strong>Note:</strong> For security reasons, deck notes are
                    not part of the share.
                  </>
                }
              >
                Share deck
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
