"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useEventBySlug, useEvent, useCreateEvent, useUpdateEvent } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const eventSchema = z.object({
    title: z.string().min(1, "Title is required").max(500),
    slug: z.string().max(500).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    location: z.string().optional(),
    event_type: z.string().optional(),
    is_virtual: z.boolean(),
    virtual_link: z.string().optional(),
    is_published: z.boolean(),
    is_featured: z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventFormPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const isNew = slug === "new";

    const { data: eventBySlugData, isLoading: isLoadingSlug } = useEventBySlug(!isNew ? slug : "");
    const { data: eventByIdData, isLoading: isLoadingId } = useEvent(!isNew && slug ? slug : "");
    const eventData = isNew ? null : (eventBySlugData?.data || eventByIdData?.data);
    const isLoading = !isNew && (isLoadingSlug || isLoadingId);

    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();

    const isPending = createEvent.isPending || updateEvent.isPending;

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            content: "",
            start_date: "",
            end_date: "",
            location: "",
            event_type: "",
            is_virtual: false,
            virtual_link: "",
            is_published: false,
            is_featured: false,
        },
        values: eventData ? {
            title: eventData.title || "",
            slug: eventData.slug || "",
            description: "",
            content: "",
            start_date: eventData.start_date ? eventData.start_date.split("T")[0] : "",
            end_date: eventData.end_date ? eventData.end_date.split("T")[0] : "",
            location: eventData.location || "",
            event_type: eventData.event_type || "",
            is_virtual: eventData.is_virtual || false,
            virtual_link: eventData.virtual_link || "",
            is_published: eventData.is_published || false,
            is_featured: eventData.is_featured || false,
        } : undefined,
    });

    const onSubmit = async (values: EventFormValues) => {
        try {
            const payload = {
                ...values,
                start_date: values.start_date ? new Date(values.start_date).toISOString() : null,
                end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
            };

            if (isNew) {
                await createEvent.mutateAsync(payload as any);
                toast.success("Event created successfully");
            } else {
                await updateEvent.mutateAsync({ id: eventData!.id, data: payload as any });
                toast.success("Event updated successfully");
            }
            router.push("/content/events");
        } catch (error) {
            toast.error(isNew ? "Failed to create event" : "Failed to update event");
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
                title={isNew ? "Create Event" : "Edit Event"}
                description={isNew ? "Create a new event" : `Editing: ${eventData?.title}`}
                backHref="/content/events"
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Event title..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="event-slug" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Short Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Brief description..." rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Content</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Event details..." rows={10} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="start_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="end_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Venue or address..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="event_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Event Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="conference">Conference</SelectItem>
                                                        <SelectItem value="workshop">Workshop</SelectItem>
                                                        <SelectItem value="seminar">Seminar</SelectItem>
                                                        <SelectItem value="webinar">Webinar</SelectItem>
                                                        <SelectItem value="social">Social</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                    <CardTitle>Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="is_published"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <FormLabel className="cursor-pointer">Published</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_featured"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <FormLabel className="cursor-pointer">Featured</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_virtual"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <FormLabel className="cursor-pointer">Virtual Event</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("is_virtual") && (
                                        <FormField
                                            control={form.control}
                                            name="virtual_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Virtual Link</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : isNew ? "Create Event" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/content/events")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}