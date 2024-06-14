import clsx from "clsx";
import type { ReactNode } from "react";

import css from "./decklist-section.module.css";

type Props = {
  children: ReactNode;
  showTitle?: boolean;
  title: string;
};

export function DecklistSection({ children, showTitle, title }: Props) {
  return (
    <article className={clsx(css["decklist-section"])}>
      <header className={css["decklist-section-header"]}>
        <h3
          className={clsx(
            css["decklist-section-title"],
            !showTitle && "sr-only",
          )}
        >
          {title}
        </h3>
      </header>
      <div className={css["decklist-section-content"]}>{children}</div>
    </article>
  );
}