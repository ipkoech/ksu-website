"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { usePerson, useCreatePerson, useUpdatePerson, useDepartments } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Plus, Trash2 } from "lucide-react";

const personSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    other_names: z.string().optional(),
    title: z.string().optional(),
    gender: z.string().optional(),
    email: z.string().email("Invalid email").min(1, "Email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    full_bio: z.string().optional(),
    person_type: z.string().min(1, "Person type is required"),
    department_id: z.string().optional(),
    academic_rank: z.string().optional(),
    office_location: z.string().optional(),
    office_hours: z.string().optional(),
    google_scholar_id: z.string().optional(),
    orcid: z.string().optional(),
    linkedin_url: z.string().url().optional().or(z.literal("")),
    twitter_handle: z.string().optional(),
    is_active: z.boolean(),
});

type PersonFormValues = z.infer<typeof personSchema>;

const PERSON_TYPES = ["Faculty", "Staff", "Student", "Alumni", "Visitor", "Contractor"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function PersonFormPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === "new";

    const { data: personData, isLoading } = usePerson(!isNew && id ? id : "");
    const { data: departmentsData } = useDepartments();
    const createPerson = useCreatePerson();
    const updatePerson = useUpdatePerson();

    const isPending = createPerson.isPending || updatePerson.isPending;

    const form = useForm<PersonFormValues>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            other_names: "",
            title: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
            bio: "",
            full_bio: "",
            person_type: "Staff",
            department_id: "",
            academic_rank: "",
            office_location: "",
            office_hours: "",
            google_scholar_id: "",
            orcid: "",
            linkedin_url: "",
            twitter_handle: "",
            is_active: true,
        },
        values: personData?.data ? {
            first_name: personData.data.first_name || "",
            last_name: personData.data.last_name || "",
            other_names: personData.data.other_names || "",
            title: personData.data.title || "",
            gender: personData.data.gender || "",
            email: personData.data.email || "",
            phone: personData.data.phone || "",
            address: personData.data.address || "",
            bio: personData.data.bio || "",
            full_bio: personData.data.full_bio || "",
            person_type: personData.data.person_type || "",
            department_id: personData.data.department_id || "",
            academic_rank: personData.data.academic_rank || "",
            office_location: personData.data.office_location || "",
            office_hours: personData.data.office_hours || "",
            google_scholar_id: personData.data.google_scholar_id || "",
            orcid: personData.data.orcid || "",
            linkedin_url: personData.data.linkedin_url || "",
            twitter_handle: personData.data.twitter_handle || "",
            is_active: personData.data.is_active ?? true,
        } : undefined,
    });

    const onSubmit = async (values: PersonFormValues) => {
        try {
            if (isNew) {
                await createPerson.mutateAsync(values as any);
                toast.success("Person created successfully");
            } else {
                await updatePerson.mutateAsync({ id, data: values as any });
                toast.success("Person updated successfully");
            }
            router.push("/people/persons");
        } catch (error) {
            toast.error(isNew ? "Failed to create person" : "Failed to update person");
        }
    };

    if (isLoading) {
        return <LoadingSkeleton rows={12} />;
    }

    const fullName = personData?.data 
        ? [personData.data.title, personData.data.first_name, personData.data.last_name].filter(Boolean).join(" ")
        : "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title={isNew ? "Add Person" : "Edit Person"}
                description={isNew ? "Add a new person" : `Editing: ${fullName}`}
                backHref="/people/persons"
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
                                    <div className="grid grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Prof." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="other_names"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Other Names</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Middle names" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="john.doe@university.ac.ke" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="person_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Person Type *</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select Type</option>
                                                            {PERSON_TYPES.map((type) => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <FormControl>
                                                        <select 
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Select Gender</option>
                                                            {GENDERS.map((gender) => (
                                                                <option key={gender} value={gender}>{gender}</option>
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="department_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
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
                                            name="academic_rank"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Academic Rank</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Senior Lecturer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="office_location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Office Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Room 101" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="office_hours"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Office Hours</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Mon-Fri 9am-5pm" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Short Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Brief biography..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="full_bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Detailed biography..." rows={5} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Research & Social</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="google_scholar_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Google Scholar ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="abc123..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="orcid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ORCID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0000-0000-0000-0000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="linkedin_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="twitter_handle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Twitter Handle</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="@username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
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
                            {isPending ? "Saving..." : isNew ? "Add Person" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/people/persons")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}