import clsx from "clsx";
import { Fragment } from "react";

import type { Card } from "@/store/services/types";
import { SKILL_KEYS } from "@/utils/constants";

import css from "./skill-icons.module.css";

import { CostIcon } from "./icons/cost-icon";
import { SkillIconFancy } from "./icons/skill-icon-fancy";

type Props = {
  card: Card;
  className?: string;
  iconClassName?: string;
};

export function SkillIconsInvestigator({
  className,
  card,
  iconClassName,
}: Props) {
  if (card.type_code !== "investigator") return null;

  const entries = SKILL_KEYS.reduce<[string, number][]>((acc, key) => {
    const val = card[`skill_${key}`];
    if (val != null) acc.push([key, val]);
    return acc;
  }, []);

  if (!entries.length) return null;

  return (
    <ol className={clsx(css["skills"], className)}>
      {entries.map(([key, val]) => {
        return (
          <Fragment key={key}>
            <li
              className={clsx(css["skill_numbered"], iconClassName)}
              key={key}
            >
              <CostIcon className={css["skill-cost"]} cost={val} />
              <SkillIconFancy className={css["skill-icon"]} skill={key} />
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
