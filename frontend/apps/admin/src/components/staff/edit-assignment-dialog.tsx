"use client";

import { useState, useEffect } from "react";
import { Button, ConfirmDialog, Input, RichTextEditor, richTextToPlainText, Switch, Label, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useUpdateStaffAssignment } from "@ksu/api-client";

interface EditAssignmentDialogProps {
    assignment: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditAssignmentDialog({ assignment, open, onOpenChange, onSuccess }: EditAssignmentDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        hierarchy_level: 10,
        is_primary: true,
        is_acting: false,
        is_public: true,
        term_years: undefined as number | undefined,
        term_renewable: true,
        show_term_dates: false,
        notes: "",
        end_date: "",
    });

    const updateMutation = useUpdateStaffAssignment();
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (assignment && open) {
            setFormData({
                title: assignment.title || "",
                hierarchy_level: assignment.hierarchy_level || 10,
                is_primary: assignment.is_primary ?? true,
                is_acting: assignment.is_acting ?? false,
                is_public: assignment.is_public ?? true,
                term_years: assignment.term_years,
                term_renewable: assignment.term_renewable ?? true,
                show_term_dates: assignment.show_term_dates ?? false,
                notes: assignment.notes || "",
                end_date: assignment.end_date || "",
            });
        }
    }, [assignment, open]);

    const performSubmit = async () => {
        try {
            await updateMutation.mutateAsync({ id: assignment.id, data: { ...formData, notes: richTextToPlainText(formData.notes) } });
            toast.success("Assignment updated successfully");
            setConfirmOpen(false);
            onSuccess();
        } catch (error) {
            toast.error("Failed to update assignment");
        }
    };

    return (
        <div className={open ? "fixed inset-0 z-50 flex items-center justify-center" : "hidden"}>
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-lg p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Display Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder="Optional display title"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Hierarchy Level</Label>
                                <Input
                                    type="number"
                                    value={formData.hierarchy_level}
                                    onChange={(e) => setFormData(p => ({ ...p, hierarchy_level: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <Label>Term Years</Label>
                                <Input
                                    type="number"
                                    value={formData.term_years || ""}
                                    onChange={(e) => setFormData(p => ({ ...p, term_years: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    placeholder="3"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_primary}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, is_primary: v }))}
                                />
                                <Label>Primary Role</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_acting}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, is_acting: v }))}
                                />
                                <Label>Acting/Interim</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_public}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, is_public: v }))}
                                />
                                <Label>Public</Label>
                            </div>
                        </div>

                        <div>
                            <Label>End Date (if ending)</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <RichTextEditor
                                value={formData.notes}
                                onChange={(notes) => setFormData(p => ({ ...p, notes }))}
                                placeholder="Internal notes..."
                                toolbar="simple"
                                minHeight="150px"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={() => setConfirmOpen(true)} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Save assignment changes?"
                description="This will update the assignment record and may affect public staff listings."
                confirmLabel="Save changes"
                isLoading={updateMutation.isPending}
                onConfirm={performSubmit}
            />
        </div>
    );
}
