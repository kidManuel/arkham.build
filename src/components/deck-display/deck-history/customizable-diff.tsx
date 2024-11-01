import { CustomizationOption } from "@/components/customizations/customization-option";
import { ListCard } from "@/components/list-card/list-card";
import type { CustomizationUpgrade } from "@/store/selectors/decks";
import { cx } from "@/utils/cx";
import css from "./diffs.module.css";

type Props = {
  differences: CustomizationUpgrade[];
  size?: "sm";
  title: React.ReactNode;
};

export function CustomizableDiff(props: Props) {
  const { differences, size, title } = props;

  if (!differences.length) return null;

  return (
    <article className={cx(css["diffs-container"], size && css[size])}>
      <header>
        <h4 className={css["diffs-title"]}>{title}</h4>
      </header>
      <ol className={css["diffs"]}>
        {differences.map(({ card, diff, xpMax }) => (
          <li key={card.code}>
            <ListCard
              key={card.code}
              card={card}
              omitBorders
              omitThumbnail={size === "sm"}
              size={size === "sm" ? "xs" : "sm"}
            />
            <ol className={css["diff-customizations"]}>
              {diff.map(
                (customization) =>
                  (customization.xp_spent !== 0 ||
                    !card.customization_options?.[customization.index].xp) &&
                  !!card.customization_options &&
                  !!card.real_customization_text && (
                    <li
                      className={css["diff-customization"]}
                      key={customization.index}
                    >
                      <CustomizationOption
                        card={card}
                        index={customization.index}
                        choice={customization}
                        readonly
                        omitOptionText
                        xpMax={xpMax}
                        option={card.customization_options[customization.index]}
                        text={card.real_customization_text.split("\n")}
                      />
                    </li>
                  ),
              )}
            </ol>
          </li>
        ))}
      </ol>
    </article>
  );
}
