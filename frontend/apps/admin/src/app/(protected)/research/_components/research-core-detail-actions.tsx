"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ResearchGenericRecord, type ResearchGenericPayload } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ksu/ui/components";
import { Eye, EyeOff, MoreVertical, Star, StarOff, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type CoreDetailResource = {
  update: (id: string, data: Partial<ResearchGenericPayload>) => Promise<{ data: ResearchGenericRecord }>;
  delete: (id: string) => Promise<void>;
};

type CoreActionConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  payload?: Partial<ResearchGenericPayload>;
  deleteRecord?: boolean;
};

export function ResearchCoreDetailActions({
  record,
  resource,
  resourceLabel,
  listHref,
}: {
  record: ResearchGenericRecord;
  resource: CoreDetailResource;
  resourceLabel: string;
  listHref: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<CoreActionConfirmation | null>(null);
  const id = String(record.id);
  const isActive = record.is_active !== false;
  const isFeatured = Boolean(record.is_featured);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ResearchGenericPayload>) => resource.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research-detail"] });
      toast.success(`${resourceLabel} updated`);
    },
    onError: () => toast.error(`Failed to update ${resourceLabel.toLowerCase()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => resource.delete(id),
    onSuccess: () => {
      toast.success(`${resourceLabel} deleted`);
      router.push(listHref);
      router.refresh();
    },
    onError: () => toast.error(`Failed to delete ${resourceLabel.toLowerCase()}`),
  });

  const busy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmation({
            title: isActive ? `Deactivate ${resourceLabel.toLowerCase()}` : `Activate ${resourceLabel.toLowerCase()}`,
            description: isActive ? "Hide this record from active research workflows without deleting it." : "Return this record to active research workflows.",
            confirmText: isActive ? "Deactivate" : "Activate",
            variant: isActive ? "warning" : "success",
            payload: { is_active: !isActive },
          })}
        >
          {isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {isActive ? "Deactivate" : "Activate"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" disabled={busy}>
              <MoreVertical className="mr-2 h-4 w-4" />
              More actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{resourceLabel} actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setConfirmation({
                title: isFeatured ? `Remove featured ${resourceLabel.toLowerCase()}` : `Feature ${resourceLabel.toLowerCase()}`,
                description: isFeatured ? "Remove this record from featured research displays." : "Mark this record as featured for research displays.",
                confirmText: isFeatured ? "Remove featured" : "Feature",
                payload: { is_featured: !isFeatured },
              })}
            >
              {isFeatured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
              {isFeatured ? "Remove featured" : "Feature"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmation({
                title: `Delete ${resourceLabel.toLowerCase()}`,
                description: "Delete this record permanently. This should only be used when the backend has no dependent records that need to remain linked.",
                confirmText: "Delete",
                variant: "destructive",
                deleteRecord: true,
              })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm action"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={busy}
        onConfirm={() => {
          if (confirmation?.deleteRecord) {
            deleteMutation.mutate();
          } else if (confirmation?.payload) {
            updateMutation.mutate(confirmation.payload);
          }
          setConfirmation(null);
        }}
      />
    </>
  );
}
