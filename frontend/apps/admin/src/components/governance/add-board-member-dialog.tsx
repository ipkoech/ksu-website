"use client";

import { useState, useEffect } from "react";
import { Button, Input, RichTextEditor, richTextToPlainText, Switch, Label, Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useAddBoardMember, usePersons } from "@ksu/api-client";

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

export function AddBoardMemberDialog({ boardSlug, open, onOpenChange, onSuccess }: AddBoardMemberDialogProps) {
    const [formData, setFormData] = useState({
        person_id: "",
        role: "member",
        title: "",
        is_acting: false,
        start_date: "",
        term_end_date: "",
        is_ex_officio: false,
        notes: "",
    });

    const addMutation = useAddBoardMember();
    const { data: personsData } = usePersons();

    useEffect(() => {
        if (open) {
            setFormData({
                person_id: "",
                role: "member",
                title: "",
                is_acting: false,
                start_date: new Date().toISOString().split("T")[0],
                term_end_date: "",
                is_ex_officio: false,
                notes: "",
            });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.person_id) {
            toast.error("Please select a person");
            return;
        }
        try {
            await addMutation.mutateAsync({ 
                id: boardSlug,
                personId: formData.person_id,
                role: formData.role,
                data: {
                    title: formData.title,
                    is_acting: formData.is_acting,
                    start_date: formData.start_date,
                    end_date: formData.term_end_date || undefined,
                    notes: richTextToPlainText(formData.notes),
                }
            });
            toast.success("Member added successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to add member");
        }
    };

    return (
        <div className={open ? "fixed inset-0 z-50 flex items-center justify-center" : "hidden"}>
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Add Board Member</h2>
                <Card>
                    <CardContent className="space-y-4 pt-4">
                        <div>
                            <Label>Person *</Label>
                            <Select value={formData.person_id} onValueChange={(v) => setFormData(p => ({ ...p, person_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                                <SelectContent>
                                    {personsData?.data?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.title} {p.first_name} {p.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Role *</Label>
                            <Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Title (optional)</Label>
                            <Input 
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g., Dean of Sciences"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input 
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Term End Date</Label>
                                <Input 
                                    type="date"
                                    value={formData.term_end_date}
                                    onChange={(e) => setFormData(p => ({ ...p, term_end_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Switch 
                                    checked={formData.is_acting}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, is_acting: v }))}
                                />
                                <Label>Acting/Interim</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch 
                                    checked={formData.is_ex_officio}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, is_ex_officio: v }))}
                                />
                                <Label>Ex-Officio</Label>
                            </div>
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <RichTextEditor
                                value={formData.notes}
                                onChange={(notes) => setFormData(p => ({ ...p, notes }))}
                                placeholder="Additional notes..."
                                toolbar="simple"
                                minHeight="150px"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={addMutation.isPending}>
                                {addMutation.isPending ? "Adding..." : "Add Member"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
