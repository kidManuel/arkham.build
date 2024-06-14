import clsx from "clsx";
import type { ReactNode } from "react";
import { Redirect, useParams } from "wouter";

import { Card } from "@/components/card/card";
import { ResolvedCard } from "@/components/card/resolved-card";
import { AppLayout } from "@/components/layouts/app-layout";
import { CenterLayout } from "@/components/layouts/center-layout";
import { CardViewSidebar } from "@/pages/card-view/card-view-sidebar";
import { useStore } from "@/store";
import { selectCardWithRelations } from "@/store/selectors/card-view";

import css from "./card-view.module.css";

type Props = {
  title: string;
  children: ReactNode;
};

function CardViewSection({ title, children }: Props) {
  return (
    <section className={css["view-section"]}>
      <h2 className={css["view-section-title"]}>{title}</h2>
      <div className={css["view-section-cards"]}>{children}</div>
    </section>
  );
}

export function CardView() {
  const { code } = useParams();

  const cardWithRelations = useStore((state) =>
    selectCardWithRelations(state, code),
  );

  if (!cardWithRelations) return null;

  const { relations } = cardWithRelations;

  const canonicalCode = cardWithRelations.card.duplicate_of_code;
  if (canonicalCode) return <Redirect to={`/card/${canonicalCode}`} />;

  return (
    <AppLayout
      sidebar="Deck list"
      centerScroller
      filters={<CardViewSidebar resolvedCard={cardWithRelations} />}
      title={cardWithRelations.card.real_name}
    >
      <CenterLayout>
        <div className={clsx(css["view"])}>
          <ResolvedCard resolvedCard={cardWithRelations} />

          {relations?.parallel && (
            <CardViewSection title="Parallel">
              <Card resolvedCard={relations.parallel} />
            </CardViewSection>
          )}

          {!!relations?.bound?.length && (
            <CardViewSection title="Bound Cards">
              {relations.bound.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.bonded?.length && (
            <CardViewSection title="Bonded">
              {relations.bonded.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.requiredCards?.length && (
            <CardViewSection title="Required cards">
              {relations.requiredCards.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.parallelCards?.length && (
            <CardViewSection title="Parallel cards">
              {relations.parallelCards.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.replacement?.length && (
            <CardViewSection title="Alternate cards">
              {relations.replacement.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.advanced?.length && (
            <CardViewSection title="Advanced cards">
              {relations.advanced.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}

          {!!relations?.restrictedTo && (
            <CardViewSection title="Restricted">
              <ResolvedCard
                resolvedCard={relations.restrictedTo}
                linked
                size="compact"
              />
            </CardViewSection>
          )}

          {!!relations?.level?.length && (
            <CardViewSection title="Other levels">
              {relations.level.map((c) => (
                <ResolvedCard
                  key={c.card.code}
                  resolvedCard={c}
                  linked
                  size="compact"
                />
              ))}
            </CardViewSection>
          )}
        </div>
      </CenterLayout>
    </AppLayout>
  );
}
