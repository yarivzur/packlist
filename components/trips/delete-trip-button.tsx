"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteTripButtonProps {
  tripId: string;
  variant: "card" | "detail";
  onDeleted?: () => void;
}

export function DeleteTripButton({ tripId, variant, onDeleted }: DeleteTripButtonProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Delete?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {deleting ? "Deleting…" : "Yes, delete"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)} disabled={deleting}>
          Cancel
        </Button>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setConfirm(true)}
        title="Delete trip"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  // card variant: always visible on mobile, hover-only on desktop
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirm(true);
      }}
      title="Delete trip"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
