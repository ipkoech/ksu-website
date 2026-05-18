"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useDepartment, useCreateDepartment, useUpdateDepartment, useSchools } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const departmentSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    code: z.string().max(20).optional(),
    school_id: z.string().min(1, "School is required"),
    about: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    hod_name: z.string().optional(),
    hod_email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    address: z.string().optional(),
    is_active: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentFormPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === "new";

    const { data: departmentData, isLoading } = useDepartment(!isNew && id ? id : "");
    const { data: schoolsData } = useSchools();
    const createDepartment = useCreateDepartment();
    const updateDepartment = useUpdateDepartment();

    const isPending = createDepartment.isPending || updateDepartment.isPending;

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: "",
            code: "",
            school_id: "",
            about: "",
            mission: "",
            vision: "",
            hod_name: "",
            hod_email: "",
            phone: "",
            email: "",
            website: "",
            address: "",
            is_active: true,
        },
        values: departmentData?.data ? {
            name: departmentData.data.name || "",
            code: departmentData.data.code || "",
            school_id: departmentData.data.school_id || "",
            about: departmentData.data.about || "",
            mission: departmentData.data.mission || "",
            vision: departmentData.data.vision || "",
            hod_name: departmentData.data.hod_name || "",
            hod_email: departmentData.data.hod_email || "",
            phone: departmentData.data.phone || "",
            email: departmentData.data.email || "",
            website: departmentData.data.website || "",
            address: departmentData.data.address || "",
            is_active: departmentData.data.is_active ?? true,
        } : undefined,
    });

    const onSubmit = async (values: DepartmentFormValues) => {
        try {
            if (isNew) {
                await createDepartment.mutateAsync(values as any);
                toast.success("Department created successfully");
            } else {
                await updateDepartment.mutateAsync({ id, data: values as any });
                toast.success("Department updated successfully");
            }
            router.push("/academic/departments");
        } catch (error) {
            toast.error(isNew ? "Failed to create department" : "Failed to update department");
        }
    };

    if (isLoading) {
        return <LoadingSkeleton rows={10} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title={isNew ? "Create Department" : "Edit Department"}
                description={isNew ? "Add a new department" : `Editing: ${departmentData?.data?.name}`}
                backHref="/academic/departments"
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
                                                <FormLabel>Department Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Department of Computer Science" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="DCS" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="school_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>School *</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select School</option>
                                                            {schoolsData?.data?.map((school) => (
                                                                <option key={school.id} value={school.id}>
                                                                    {school.name}
                                                                </option>
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
                                        name="about"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Brief description..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="mission"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mission</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Mission statement..." rows={2} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="vision"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vision</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Vision statement..." rows={2} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+254..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="dept@university.ac.ke" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Physical address..." rows={2} {...field} />
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
                                    <CardTitle>Head of Department</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="hod_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HOD Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dr. Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hod_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HOD Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="hod@university.ac.ke" {...field} />
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
                            {isPending ? "Saving..." : isNew ? "Create Department" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/academic/departments")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}