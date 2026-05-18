"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useProgramme, useCreateProgramme, useUpdateProgramme, useDepartments } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const programmeSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    code: z.string().max(20).optional(),
    department_id: z.string().min(1, "Department is required"),
    level: z.string().min(1, "Level is required"),
    mode_of_study: z.string().min(1, "Mode of study is required"),
    duration: z.string().optional(),
    credits_required: z.number().optional(),
    about: z.string().optional(),
    objectives: z.string().optional(),
    career_prospects: z.string().optional(),
    curriculum_overview: z.string().optional(),
    entry_requirements: z.string().optional(),
    min_students: z.number().optional(),
    max_students: z.number().optional(),
    accreditation_status: z.string().optional(),
    accrediting_body: z.string().optional(),
    is_active: z.boolean(),
});

type ProgrammeFormValues = z.infer<typeof programmeSchema>;

const LEVELS = ["Certificate", "Diploma", "Bachelor", "Master", "Doctoral", "Postgraduate"];
const MODES = ["Full-time", "Part-time", "Online", "Evening", "Weekend", "Blended"];

export default function ProgrammeFormPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === "new";

    const { data: programmeData, isLoading } = useProgramme(!isNew && id ? id : "");
    const { data: departmentsData } = useDepartments();
    const createProgramme = useCreateProgramme();
    const updateProgramme = useUpdateProgramme();

    const isPending = createProgramme.isPending || updateProgramme.isPending;

    const form = useForm<ProgrammeFormValues>({
        resolver: zodResolver(programmeSchema),
        defaultValues: {
            name: "",
            code: "",
            department_id: "",
            level: "Bachelor",
            mode_of_study: "Full-time",
            duration: "",
            credits_required: undefined,
            about: "",
            objectives: "",
            career_prospects: "",
            curriculum_overview: "",
            entry_requirements: "",
            min_students: undefined,
            max_students: undefined,
            accreditation_status: "",
            accrediting_body: "",
            is_active: true,
        },
        values: programmeData?.data ? {
            name: programmeData.data.name || "",
            code: programmeData.data.code || "",
            department_id: programmeData.data.department_id || "",
            level: programmeData.data.level || "",
            mode_of_study: programmeData.data.mode_of_study || "",
            duration: programmeData.data.duration || "",
            credits_required: programmeData.data.credits_required,
            about: programmeData.data.about || "",
            objectives: programmeData.data.objectives || "",
            career_prospects: programmeData.data.career_prospects || "",
            curriculum_overview: programmeData.data.curriculum_overview || "",
            entry_requirements: programmeData.data.entry_requirements || "",
            min_students: programmeData.data.min_students,
            max_students: programmeData.data.max_students,
            accreditation_status: programmeData.data.accreditation_status || "",
            accrediting_body: programmeData.data.accrediting_body || "",
            is_active: programmeData.data.is_active ?? true,
        } : undefined,
    });

    const onSubmit = async (values: ProgrammeFormValues) => {
        try {
            if (isNew) {
                await createProgramme.mutateAsync(values as any);
                toast.success("Programme created successfully");
            } else {
                await updateProgramme.mutateAsync({ id, data: values as any });
                toast.success("Programme updated successfully");
            }
            router.push("/academic/programmes");
        } catch (error) {
            toast.error(isNew ? "Failed to create programme" : "Failed to update programme");
        }
    };

    if (isLoading) {
        return <LoadingSkeleton rows={15} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title={isNew ? "Create Programme" : "Edit Programme"}
                description={isNew ? "Add a new programme" : `Editing: ${programmeData?.data?.name}`}
                backHref="/academic/programmes"
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Programme Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Bachelor of Computer Science" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="BSC-CS" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="department_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department *</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select Department</option>
                                                            {departmentsData?.data?.map((dept) => (
                                                                <option key={dept.id} value={dept.id}>
                                                                    {dept.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="4 years" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Level *</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select Level</option>
                                                            {LEVELS.map((level) => (
                                                                <option key={level} value={level}>{level}</option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="mode_of_study"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mode of Study *</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select Mode</option>
                                                            {MODES.map((mode) => (
                                                                <option key={mode} value={mode}>{mode}</option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="credits_required"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Credits Required</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="120" 
                                                        value={field.value || ""}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Programme Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="about"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>About</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Programme overview..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="objectives"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Objectives</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Programme objectives..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="entry_requirements"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Entry Requirements</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Admission requirements..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="career_prospects"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Career Prospects</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Career opportunities..." rows={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="curriculum_overview"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Curriculum Overview</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Course structure..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Capacity & Accreditation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="min_students"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Min Students</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            placeholder="10"
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="max_students"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Students</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            placeholder="100"
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="accreditation_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Accreditation Status</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Accredited" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accrediting_body"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Accrediting Body</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="KUCCPS" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <FormLabel className="cursor-pointer">Active</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : isNew ? "Create Programme" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/academic/programmes")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}