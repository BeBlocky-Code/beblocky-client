"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Shared surface classes for Beblocky app dialogs */
export const dialogContentClass = cn(
  "gap-0 overflow-hidden rounded-3xl border-border/50 bg-background p-0 shadow-2xl",
  "sm:max-w-lg",
);

export const dialogContentWideClass = cn(
  dialogContentClass,
  "sm:max-w-2xl",
);

export const dialogContentXLClass = cn(
  dialogContentClass,
  "sm:max-w-4xl",
);

type AppDialogHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Compact header without atmospheric band */
  dense?: boolean;
};

export function AppDialogHeader({
  icon,
  title,
  description,
  className,
  dense = false,
}: AppDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn(
        "relative overflow-hidden text-left",
        dense ? "px-6 pt-6 pb-2" : "px-6 pt-7 pb-5",
        className,
      )}
    >
      {!dense && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
        />
      )}

      <div className="relative z-10 space-y-3">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="space-y-1.5">
          <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}

export function AppDialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-5", className)}>{children}</div>
  );
}

export function AppDialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const dialogFieldLabelClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground";

export const dialogInputClass =
  "h-11 rounded-xl border-border/60 bg-muted/30 px-4 shadow-none focus-visible:bg-background";

export const dialogTextareaClass =
  "min-h-[120px] resize-none rounded-xl border-border/60 bg-muted/30 px-4 py-3 shadow-none focus-visible:bg-background";

export const dialogPrimaryBtnClass =
  "h-11 flex-1 rounded-full font-semibold shadow-sm";

export const dialogSecondaryBtnClass =
  "h-11 flex-1 rounded-full border-border/60 bg-background font-semibold";
