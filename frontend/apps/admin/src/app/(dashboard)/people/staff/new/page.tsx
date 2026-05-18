"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Label } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { StepWizard } from "@/components/ui/step-wizard";
import { usePersons, useEntityTypes, useRoles, useCreateStaffAssignment } from "@ksu/api-client";
import { EntityTypeInfo } from "@/components/staff/info-dialogs/entity-type-info";
import { RoleSelectionInfo } from "@/components/staff/info-dialogs/role-selection-info";

const steps = [
    { id: 1, title: "Person" },
    { id: 2, title: "Entity Type" },
    { id: 3, title: "Entity" },
    { id: 4, title: "Role" },
    { id: 5, title: "Details" },
];

export default function NewAssignmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        person_id: "",
        entity_type: "",
        entity_id: "",
        role: "",
        title: "",
        hierarchy_level: 10,
        is_primary: true,
        is_acting: false,
        is_public: true,
        start_date: "",
        term_years: undefined as number | undefined,
        term_renewable: true,
        show_term_dates: false,
        notes: "",
    });

    const { data: personsData } = usePersons();
    const { data: entityTypesData } = useEntityTypes();
    const { data: rolesData } = useRoles(formData.entity_type);

    const createAssignment = useCreateStaffAssignment();

    const entityTypeRoles = rolesData?.data?.filter((r: any) => {
        if (!formData.entity_type) return true;
        const entityRoles: Record<string, string[]> = {
            university: ["vc", "vice_chancellor", "chancellor", "council_member"],
            division: ["dvc", "deputy_vice_chancellor", "dvc_arsa", "dvc_apf"],
            wing: ["registrar", "registrar_academic", "registrar_admin", "finance_officer", "director"],
            school: ["dean", "deputy_dean", "coordinator"],
            department: ["hod", "head", "cod", "deputy_hod", "coordinator", "lecturer", "senior_lecturer"],
            board: ["chairperson", "vice_chairperson", "secretary", "member"],
            committee: ["chairperson", "vice_chairperson", "secretary", "member"],
        };
        return entityRoles[formData.entity_type]?.includes(r.role);
    }) || [];

    const canProceed = () => {
        switch (currentStep) {
            case 1: return !!formData.person_id;
            case 2: return !!formData.entity_type;
            case 3: return true;
            case 4: return !!formData.role;
            case 5: return true;
            default: return true;
        }
    };

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const handleSubmit = async () => {
        try {
            await createAssignment.mutateAsync(formData as any);
            toast.success("Assignment created successfully");
            router.push("/people/staff");
        } catch (error) {
            toast.error("Failed to create assignment");
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Card>
                        <CardHeader><CardTitle>Select Person</CardTitle></CardHeader>
                        <CardContent>
                            <Select value={formData.person_id} onValueChange={(v) => updateFormData("person_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Select a person" /></SelectTrigger>
                                <SelectContent>
                                    {personsData?.data?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.title} {p.first_name} {p.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Select Entity Type</CardTitle>
                            <EntityTypeInfo />
                        </CardHeader>
                        <CardContent>
                            <Select value={formData.entity_type} onValueChange={(v) => { updateFormData("entity_type", v); updateFormData("entity_id", ""); updateFormData("role", ""); }}>
                                <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                                <SelectContent>
                                    {entityTypesData?.data?.map((et: any) => (
                                        <SelectItem key={et.type} value={et.type}>{et.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                );

            case 3:
                return (
                    <Card>
                        <CardHeader><CardTitle>Select Entity</CardTitle></CardHeader>
                        <CardContent>
                            {formData.entity_type === 'university' ? (
                                <p className="text-muted-foreground">University-level position - no entity needed</p>
                            ) : (
                                <Input 
                                    placeholder="Entity ID (school/department UUID)"
                                    value={formData.entity_id}
                                    onChange={(e) => updateFormData("entity_id", e.target.value)}
                                />
                            )}
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Select Role</CardTitle>
                            <RoleSelectionInfo />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={formData.role} onValueChange={(v) => { 
                                updateFormData("role", v); 
                                const role = entityTypeRoles.find((r: any) => r.role === v);
                                if (role) updateFormData("hierarchy_level", role.hierarchy_level);
                            }}>
                                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>
                                    {entityTypeRoles.map((role: any) => (
                                        <SelectItem key={role.role} value={role.role}>
                                            {role.label} {role.is_unique && " (Unique)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input 
                                placeholder="Display title (optional)"
                                value={formData.title}
                                onChange={(e) => updateFormData("title", e.target.value)}
                            />
                        </CardContent>
                    </Card>
                );

            case 5:
                return (
                    <Card>
                        <CardHeader><CardTitle>Assignment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date</Label>
                                    <Input type="date" value={formData.start_date} onChange={(e) => updateFormData("start_date", e.target.value)} />
                                </div>
                                <div>
                                    <Label>Term Years</Label>
                                    <Input type="number" placeholder="3" value={formData.term_years || ""} onChange={(e) => updateFormData("term_years", e.target.value ? parseInt(e.target.value) : undefined)} />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch checked={formData.is_primary} onCheckedChange={(v) => updateFormData("is_primary", v)} />
                                    <Label>Primary Role</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={formData.is_acting} onCheckedChange={(v) => updateFormData("is_acting", v)} />
                                    <Label>Acting/Interim</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={formData.is_public} onCheckedChange={(v) => updateFormData("is_public", v)} />
                                    <Label>Public</Label>
                                </div>
                            </div>
                            <Textarea 
                                placeholder="Internal notes..."
                                value={formData.notes}
                                onChange={(e) => updateFormData("notes", e.target.value)}
                            />
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="New Staff Assignment" description="Assign a person to a position" backHref="/people/staff" />
            <StepWizard
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
                onNext={handleNext}
                onPrev={() => setCurrentStep(prev => prev - 1)}
                onComplete={handleSubmit}
                isNextDisabled={!canProceed()}
                isCompleting={createAssignment.isPending}
            >
                {renderStepContent()}
            </StepWizard>
        </div>
    );
}