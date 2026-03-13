"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2, Minus, PackageCheck, List, LayoutList } from "lucide-react";
import type { ChecklistItem } from "@/lib/db/schema";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  type ChecklistCategory,
} from "@/lib/domain/checklists/templates";

/** Split "sunglasses, sunscreen and a hat" → ["sunglasses", "sunscreen", "a hat"] */
function parseItemText(raw: string): string[] {
  return raw
    .split(/,|(?:\s+and\s+)|(?:\s+&\s+)/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

type ViewMode = "grouped" | "flat";

interface ChecklistViewProps {
  tripId: string;
  grouped: Record<ChecklistCategory, ChecklistItem[]>;
  reviewed: boolean;
}

export function ChecklistView({ tripId, grouped, reviewed }: ChecklistViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [addingText, setAddingText] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");

  const isReview = !reviewed;

  // Items parsed from the current add-input
  const parsedItems = addingText.trim() ? parseItemText(addingText) : [];
  const isMulti = parsedItems.length > 1;

  // Flat sorted list for "All items" view
  const allItems: Array<ChecklistItem & { category: ChecklistCategory }> =
    CATEGORY_ORDER.flatMap((cat) =>
      (grouped[cat] ?? []).map((item) => ({ ...item, category: cat }))
    );

  const toggleItem = async (item: ChecklistItem) => {
    await fetch(`/api/checklist-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });
    startTransition(() => router.refresh());
  };

  const deleteItem = async (itemId: string) => {
    await fetch(`/api/checklist-items/${itemId}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  };

  const addCustomItem = async () => {
    if (!addingText.trim()) return;
    setAdding(true);
    // Add all parsed items in parallel
    await Promise.all(
      parsedItems.map((text) =>
        fetch("/api/checklist-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, text }),
        })
      )
    );
    setAddingText("");
    setShowAdd(false);
    setAdding(false);
    startTransition(() => router.refresh());
  };

  const confirmList = async () => {
    setConfirming(true);
    await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: true }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      {/* Review banner — shown only before the user confirms their list */}
      {isReview && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0" aria-hidden>✏️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">Your list is ready — make it yours!</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-4">
                Trim anything you won&apos;t use and tweak the quantities. Happy with it? Let&apos;s go!
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={confirmList}
            disabled={confirming}
          >
            <PackageCheck className="h-4 w-4" />
            {confirming ? "Almost there…" : "Looks great — let's pack! 🎒"}
          </Button>
        </div>
      )}

      {/* View mode toggle */}
      {allItems.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="flex rounded-lg border overflow-hidden text-xs">
            <button
              onClick={() => setViewMode("grouped")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
                viewMode === "grouped"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Categories
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
                viewMode === "flat"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <List className="h-3.5 w-3.5" />
              All items
            </button>
          </div>
        </div>
      )}

      {/* Grouped view */}
      {viewMode === "grouped" && CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items?.length) return null;
        return (
          <CategoryGroup
            key={cat}
            category={cat}
            items={items}
            isReview={isReview}
            onToggle={toggleItem}
            onDelete={deleteItem}
          />
        );
      })}

      {/* Flat view */}
      {viewMode === "flat" && (
        <div className="rounded-xl border overflow-hidden">
          <ul className="divide-y">
            {allItems.map((item) => {
              const showDelete = isReview || item.sourceRule === "custom";
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 group hover:bg-accent/50 transition-colors"
                >
                  <button
                    onClick={() => !isReview && toggleItem(item)}
                    disabled={isReview}
                    className={cn(
                      "relative flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      "before:absolute before:-inset-2.5 before:content-['']",
                      item.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                      !isReview && "hover:border-primary cursor-pointer",
                      isReview && "cursor-default opacity-40"
                    )}
                  >
                    {item.done && <Check className="h-3 w-3" />}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm leading-5",
                      item.done && !isReview && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  {/* Category pill */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {CATEGORY_ICONS[item.category]}
                  </span>
                  {showDelete && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="hidden group-hover:flex items-center text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Add custom item */}
      <div className="rounded-xl border p-4 space-y-3">
        {showAdd ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. sunglasses, sunscreen and a hat…"
                value={addingText}
                onChange={(e) => setAddingText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !adding && addingText.trim() && addCustomItem()}
                autoFocus
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="sm" onClick={addCustomItem} disabled={adding || !addingText.trim()}>
                {adding ? "Adding…" : "Add"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setAddingText(""); }}>
                Cancel
              </Button>
            </div>
            {/* Multi-item preview */}
            {isMulti && (
              <p className="text-xs text-muted-foreground pl-1">
                Adding {parsedItems.length} items:{" "}
                {parsedItems.map((t, i) => (
                  <span key={i}>
                    <span className="font-medium text-foreground">{t}</span>
                    {i < parsedItems.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Forgot something? Add it here
          </button>
        )}
      </div>
    </div>
  );
}

interface CategoryGroupProps {
  category: ChecklistCategory;
  items: ChecklistItem[];
  isReview: boolean;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (id: string) => void;
}

function CategoryGroup({ category, items, isReview, onToggle, onDelete }: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  // Local optimistic quantity state — keyed by item id
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(items.map((i) => [i.id, i.quantity]))
  );

  const adjustQuantity = async (item: ChecklistItem, delta: number) => {
    const current = quantities[item.id] ?? item.quantity;
    const next = Math.max(1, current + delta);
    setQuantities((q) => ({ ...q, [item.id]: next }));
    await fetch(`/api/checklist-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next }),
    });
  };

  return (
    <div className="rounded-xl border overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent",
          allDone && "bg-green-50 dark:bg-green-950/20"
        )}
      >
        <div className="flex items-center gap-2">
          <span>{CATEGORY_ICONS[category]}</span>
          <span className="font-medium text-sm">{CATEGORY_LABELS[category]}</span>
          {allDone && <span className="text-green-600 text-xs">✓ all done!</span>}
        </div>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{items.length}
        </span>
      </button>

      {!collapsed && (
        <ul className="divide-y">
          {items.map((item) => {
            const qty = quantities[item.id] ?? item.quantity;
            const showQtyControls = item.rationale !== null || qty > 1;
            // Show delete on hover: always in review mode, or for custom items otherwise
            const showDelete = isReview || item.sourceRule === "custom";

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 group hover:bg-accent/50 transition-colors"
              >
                {/* Toggle checkbox — hidden in review mode (can't mark done during review) */}
                <button
                  onClick={() => !isReview && onToggle(item)}
                  disabled={isReview}
                  className={cn(
                    "relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    "before:absolute before:-inset-2.5 before:content-['']",
                    item.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40",
                    !isReview && "hover:border-primary cursor-pointer",
                    isReview && "cursor-default opacity-40"
                  )}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </button>

                {/* Text + rationale — flex-1 takes remaining space */}
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm leading-5 block",
                      item.done && !isReview && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  {item.rationale && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-4">
                      {item.rationale}
                    </p>
                  )}
                </div>

                {/* Quantity stepper — fixed right column, always aligned */}
                {showQtyControls && (
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => adjustQuantity(item, -1)}
                      disabled={qty <= 1}
                      className="flex h-5 w-5 items-center justify-center rounded border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <span className="text-xs font-medium tabular-nums w-6 text-right select-none pr-0.5">
                      {qty}
                    </span>
                    <button
                      onClick={() => adjustQuantity(item, 1)}
                      className="flex h-5 w-5 items-center justify-center rounded border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}

                {/* Delete button */}
                {showDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="hidden group-hover:flex items-center text-muted-foreground hover:text-destructive transition-colors mt-0.5 ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
