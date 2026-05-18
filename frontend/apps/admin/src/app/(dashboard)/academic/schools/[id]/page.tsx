"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useSchool, useCreateSchool, useUpdateSchool } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const schoolSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    code: z.string().max(20).optional(),
    description: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    founded_year: z.number().optional(),
    dean_name: z.string().optional(),
    dean_email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    address: z.string().optional(),
    is_active: z.boolean(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export default function SchoolFormPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === "new";

    const { data: schoolData, isLoading } = useSchool(!isNew && id ? id : "");
    const createSchool = useCreateSchool();
    const updateSchool = useUpdateSchool();

    const isPending = createSchool.isPending || updateSchool.isPending;

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            mission: "",
            vision: "",
            founded_year: undefined,
            dean_name: "",
            dean_email: "",
            phone: "",
            email: "",
            website: "",
            address: "",
            is_active: true,
        },
        values: schoolData?.data ? {
            name: schoolData.data.name || "",
            code: schoolData.data.code || "",
            description: schoolData.data.description || "",
            mission: schoolData.data.mission || "",
            vision: schoolData.data.vision || "",
            founded_year: schoolData.data.founded_year,
            dean_name: schoolData.data.dean_name || "",
            dean_email: schoolData.data.dean_email || "",
            phone: schoolData.data.phone || "",
            email: schoolData.data.email || "",
            website: schoolData.data.website || "",
            address: schoolData.data.address || "",
            is_active: schoolData.data.is_active ?? true,
        } : undefined,
    });

    const onSubmit = async (values: SchoolFormValues) => {
        try {
            if (isNew) {
                await createSchool.mutateAsync(values as any);
                toast.success("School created successfully");
            } else {
                await updateSchool.mutateAsync({ id, data: values as any });
                toast.success("School updated successfully");
            }
            router.push("/academic/schools");
        } catch (error) {
            toast.error(isNew ? "Failed to create school" : "Failed to update school");
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
                title={isNew ? "Create School" : "Edit School"}
                description={isNew ? "Add a new school or faculty" : `Editing: ${schoolData?.data?.name}`}
                backHref="/academic/schools"
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
                                                <FormLabel>School Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="School of Computing" {...field} />
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
                                                        <Input placeholder="SOC" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="founded_year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Founded Year</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            placeholder="2020"
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
                                        name="description"
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
                                                        <Input type="email" placeholder="school@university.ac.ke" {...field} />
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
                                    <CardTitle>Dean Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="dean_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dean Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Prof. Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dean_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Dean Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="dean@university.ac.ke" {...field} />
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
                            {isPending ? "Saving..." : isNew ? "Create School" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/academic/schools")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}