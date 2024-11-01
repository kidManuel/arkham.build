import type { ResolvedDeck } from "@/store/lib/types";
import type { Card } from "@/store/services/queries.types";
import type { AttachableDefinition } from "@/utils/constants";
import { useCallback } from "react";
import { AttachmentIcon } from "../attachments/attachments";
import {
  attachmentDefinitionLimit,
  canAttach,
  canUpdateAttachment,
  getAttachedQuantity,
} from "../attachments/utils";
import { useAttachmentsChangeHandler } from "../attachments/utils";
import { QuantityInput } from "../ui/quantity-input";
import css from "./card-modal.module.css";

type Props = {
  card: Card;
  resolvedDeck: ResolvedDeck;
};

export function CardModalAttachmentQuantities(props: Props) {
  const { card, resolvedDeck } = props;

  if (!resolvedDeck.availableAttachments.length) return null;

  return (
    <>
      {resolvedDeck.availableAttachments.map((definition) => (
        <AttachmentQuantity
          card={card}
          definition={definition}
          key={definition.code}
          resolvedDeck={resolvedDeck}
        />
      ))}
    </>
  );
}

function AttachmentQuantity(
  props: Props & {
    card: Card;
    resolvedDeck: ResolvedDeck;
    definition: AttachableDefinition;
  },
) {
  const { card, definition, resolvedDeck } = props;
  const onAttachmentChange = useAttachmentsChangeHandler();

  const onValueChange = useCallback(
    (value: number) => onAttachmentChange?.(definition, card, value),
    [onAttachmentChange, definition, card],
  );

  if (!canAttach(card, definition)) return null;

  const attached = getAttachedQuantity(card, definition, resolvedDeck);

  return (
    <article className={css["quantity"]} key={definition.code}>
      <h3 className={css["quantity-title"]}>
        <AttachmentIcon name={definition.icon} /> {definition.name}
      </h3>
      <QuantityInput
        data-testid={`card-modal-quantities-${definition.code}`}
        disabled={!canUpdateAttachment(card, definition, resolvedDeck)}
        limit={attachmentDefinitionLimit(
          card,
          resolvedDeck.slots[card.code] ?? 0,
          definition.limit,
        )}
        onValueChange={onValueChange}
        value={attached}
      />
    </article>
  );
}
