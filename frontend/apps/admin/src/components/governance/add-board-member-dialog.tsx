"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RichTextEditor,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  richTextToPlainText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useAddBoardMember } from "@ksu/api-client";
import { PersonPicker } from "@/components/relationships";

interface AddBoardMemberDialogProps {
  boardSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const roleOptions = [
  { value: "chairperson", label: "Chairperson" },
  { value: "vice_chairperson", label: "Vice Chairperson" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "member", label: "Member" },
  { value: "observer", label: "Observer" },
];

const initialFormData = {
  person_id: "",
  role: "member",
  title: "",
  is_acting: false,
  start_date: "",
  term_end_date: "",
  is_ex_officio: false,
  notes: "",
};

export function AddBoardMemberDialog({
  boardSlug,
  open,
  onOpenChange,
  onSuccess,
}: AddBoardMemberDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const addMutation = useAddBoardMember();

  useEffect(() => {
    if (!open) return;
    setFormData({
      ...initialFormData,
      start_date: new Date().toISOString().split("T")[0],
    });
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.person_id) {
      toast.error("Please select a person");
      return;
    }

    try {
      await addMutation.mutateAsync({
        id: boardSlug,
        data: {
          person_id: formData.person_id,
          role: formData.is_ex_officio ? "ex_officio" : formData.role,
          title: formData.title || null,
          is_acting: formData.is_acting,
          start_date: formData.start_date || null,
          end_date: formData.term_end_date || null,
          notes: richTextToPlainText(formData.notes) || null,
        },
      });
      toast.success("Member added successfully");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Board Member</DialogTitle>
          <DialogDescription>
            Attach a person to this board with a public role, term dates, and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <PersonPicker
            label="Person"
            required
            value={formData.person_id}
            filters={{ status: "active" }}
            onChange={(value) => setFormData((current) => ({ ...current, person_id: value }))}
            placeholder="Select person"
          />

          <div className="flex flex-col gap-2">
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((current) => ({ ...current, role: value }))}
              disabled={formData.is_ex_officio}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Dean of Sciences"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(event) => setFormData((current) => ({ ...current, start_date: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Term End Date</Label>
              <Input
                type="date"
                value={formData.term_end_date}
                onChange={(event) => setFormData((current) => ({ ...current, term_end_date: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={formData.is_acting}
                onCheckedChange={(checked) => setFormData((current) => ({ ...current, is_acting: checked }))}
              />
              Acting/Interim
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={formData.is_ex_officio}
                onCheckedChange={(checked) => setFormData((current) => ({ ...current, is_ex_officio: checked }))}
              />
              Ex-Officio
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Notes</Label>
            <RichTextEditor
              value={formData.notes}
              onChange={(notes) => setFormData((current) => ({ ...current, notes }))}
              placeholder="Additional notes..."
              toolbar="simple"
              minHeight="150px"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
