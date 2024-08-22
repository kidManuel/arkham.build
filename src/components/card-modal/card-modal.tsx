import { ExternalLink, MessageSquare } from "lucide-react";
import { useCallback } from "react";
import { Link } from "wouter";

import { useStore } from "@/store";
import {
  getRelatedCardQuantity,
  getRelatedCards,
} from "@/store/lib/resolve-card";
import { selectCardWithRelations } from "@/store/selectors/card-view";
import { formatRelationTitle } from "@/utils/formatting";
import { useMedia } from "@/utils/use-media";

import css from "./card-modal.module.css";

import { useResolvedDeck } from "@/utils/use-resolved-deck";
import { Card } from "../card/card";
import { CardSet } from "../cardset";
import { Customizations } from "../customizations/customizations";
import { CustomizationsEditor } from "../customizations/customizations-editor";
import { Button } from "../ui/button";
import { useDialogContext } from "../ui/dialog.hooks";
import { Modal } from "../ui/modal";
import { CardModalQuantities } from "./card-modal-quantities";

type Props = {
  code: string;
};

export function CardModal(props: Props) {
  const ctx = useResolvedDeck();
  const canEdit = ctx.canEdit;

  const modalContext = useDialogContext();

  const onCloseModal = useCallback(() => {
    modalContext?.setOpen(false);
  }, [modalContext]);

  const cardWithRelations = useStore((state) =>
    selectCardWithRelations(state, props.code, true, ctx.resolvedDeck),
  );

  const showQuantities =
    !!ctx.resolvedDeck && cardWithRelations?.card.type_code !== "investigator";

  const showExtraQuantities = ctx.resolvedDeck?.hasExtraDeck;

  const canRenderFull = useMedia("(min-width: 45rem)");

  if (!cardWithRelations) return null;

  const related = getRelatedCards(cardWithRelations);

  const cardNode = (
    <>
      <Card
        resolvedCard={cardWithRelations}
        size={canRenderFull ? "full" : "compact"}
      >
        {cardWithRelations.card.customization_options ? (
          ctx.resolvedDeck ? (
            <CustomizationsEditor
              canEdit={canEdit}
              card={cardWithRelations.card}
              deck={ctx.resolvedDeck}
            />
          ) : (
            <Customizations card={cardWithRelations.card} />
          )
        ) : undefined}
      </Card>
      {!!related.length && (
        <div className={css["related"]}>
          {related.map(([key, value]) => {
            const cards = Array.isArray(value) ? value : [value];
            return (
              <CardSet
                key={key}
                set={{
                  title: formatRelationTitle(key),
                  cards,
                  id: key,
                  selected: false,
                  quantities: getRelatedCardQuantity(key, cards),
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <Modal
      actions={
        <>
          {cardWithRelations.card.type_code === "investigator" && (
            <Link
              asChild
              href={`/deck/create/${cardWithRelations.card.code}`}
              onClick={onCloseModal}
            >
              <Button as="a" data-testid="card-modal-create-deck">
                <i className="icon-deck" /> Create deck
              </Button>
            </Link>
          )}
          <Button
            as="a"
            href={`/card/${cardWithRelations.card.code}`}
            target="_blank"
          >
            <ExternalLink />
            Card page
          </Button>
          <Button
            as="a"
            href={`https://arkhamdb.com/card/${cardWithRelations.card.code}#reviews-header`}
            rel="noreferrer"
            target="_blank"
          >
            <MessageSquare />
            Reviews
          </Button>
        </>
      }
      data-testid="card-modal"
      onClose={onCloseModal}
      size="52rem"
    >
      {showQuantities ? (
        <div className={css["container"]}>
          <div>{cardNode}</div>
          {showQuantities && (
            <CardModalQuantities
              canEdit={canEdit}
              card={cardWithRelations.card}
              deck={ctx.resolvedDeck}
              onClickBackground={onCloseModal}
              showExtraQuantities={showExtraQuantities}
            />
          )}
        </div>
      ) : (
        cardNode
      )}
    </Modal>
  );
}
