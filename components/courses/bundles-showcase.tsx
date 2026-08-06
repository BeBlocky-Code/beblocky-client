"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { fetchBundles } from "@/lib/api/bundle";
import type { BundleResponse } from "@/lib/api/bundle";
import { Button } from "@/components/ui/button";

export function BundlesShowcase() {
  const [bundles, setBundles] = useState<BundleResponse[]>([]);

  useEffect(() => {
    fetchBundles(true).then(setBundles);
  }, []);

  if (bundles.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Package className="h-5 w-5" />
        Curated bundles
      </h2>

      <p className="text-sm text-muted-foreground">
        Hand-picked sets of courses designed to guide learners through a focused
        journey. Start with a bundle and move smoothly into the IDE.
      </p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {bundles.map((bundle) => {
          const courseCount = Array.isArray(bundle.courseIds)
            ? bundle.courseIds.length
            : 0;

          return (
            <Link
              key={bundle._id}
              href={`/bundles/${bundle._id}`}
              className="group rounded-3xl bg-card shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-border/60"
            >
              <div className="relative">
                {bundle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bundle.imageUrl}
                    alt={bundle.name}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-muted">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                    Bundle
                  </span>
                  {bundle.isPublished && (
                    <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium shadow-sm">
                      Live
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold text-base truncate">
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {bundle.description ||
                        "A focused learning path built from Beblocky courses."}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Courses</p>
                    <p className="text-sm font-semibold">
                      {courseCount > 0 ? courseCount : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-accent/60 px-2.5 py-1">
                      Guided track
                    </span>
                    <span className="rounded-full bg-accent/40 px-2.5 py-1">
                      Ide-ready
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full px-4 py-1.5 text-xs gap-1.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    View bundle
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
