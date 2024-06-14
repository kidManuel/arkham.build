import clsx from "clsx";

import { Card } from "@/store/graphql/types";

import css from "./multiclass-icons.module.css";

import { FactionIcon } from "./faction-icon";

type Props = {
  className?: string;
  card: Card;
  inverted?: boolean;
};

export function MulticlassIcons({ className, card, inverted }: Props) {
  if (!card.faction2_code) return null;

  return (
    <ol className={clsx(css["container"], className)}>
      <li>
        <FactionIcon
          className={inverted ? undefined : `color-${card.faction_code}`}
          code={card.faction_code}
        />
      </li>
      {card.faction2_code && (
        <li>
          <FactionIcon
            className={inverted ? undefined : `color-${card.faction2_code}`}
            code={card.faction2_code}
          />
        </li>
      )}
      {card.faction3_code && (
        <li>
          <FactionIcon
            className={inverted ? undefined : `color-${card.faction3_code}`}
            code={card.faction3_code}
          />
        </li>
      )}
    </ol>
  );
}
