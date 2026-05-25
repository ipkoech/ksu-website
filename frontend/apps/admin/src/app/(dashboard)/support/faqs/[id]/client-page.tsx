"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardHeader, CardTitle, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { faqsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const faqSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
    category: z.string().optional(),
    display_order: z.number().optional(),
    status: z.string(),
    is_public: z.boolean(),
});

type FAQFormValues = z.infer<typeof faqSchema>;

export default function FAQFormPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === "new";
    const queryClient = useQueryClient();

    const { data: faqData, isLoading } = useQuery({
        queryKey: queryKeys.faqs.detail(id),
        queryFn: () => faqsApi.get(id),
        enabled: !isNew && !!id,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<FAQFormValues>) => faqsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
            toast.success("FAQ created successfully");
            router.push("/support/faqs");
        },
        onError: () => {
            toast.error("Failed to create FAQ");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FAQFormValues> }) => 
            faqsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.faqs.detail(id) });
            toast.success("FAQ updated successfully");
            router.push("/support/faqs");
        },
        onError: () => {
            toast.error("Failed to update FAQ");
        },
    });

    const form = useForm<FAQFormValues>({
        resolver: zodResolver(faqSchema),
        defaultValues: {
            question: "",
            answer: "",
            category: "",
            display_order: 0,
            status: "draft",
            is_public: true,
        },
        values: faqData?.data ? {
            question: faqData.data.question || "",
            answer: faqData.data.answer_rich_text || faqData.data.answer_plain_text || faqData.data.answer || "",
            category: faqData.data.category || "",
            display_order: faqData.data.display_order || 0,
            status: faqData.data.status || "draft",
            is_public: faqData.data.is_public ?? true,
        } : undefined,
    });

    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = async (values: FAQFormValues) => {
        const payload = {
            question: richTextToPlainText(values.question),
            answer_plain_text: richTextToPlainText(values.answer),
            answer_rich_text: values.answer,
            category: values.category || null,
            display_order: values.display_order ?? 100,
            status: values.status,
            is_public: values.is_public,
        };

        if (isNew) {
            createMutation.mutate(payload as any);
        } else {
            updateMutation.mutate({ id, data: payload as any });
        }
    };

    if (isLoading) {
        return <LoadingSkeleton rows={6} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title={isNew ? "Add FAQ" : "Edit FAQ"}
                description={isNew ? "Add a new frequently asked question" : `Editing: ${faqData?.data?.question}`}
                backHref="/support/faqs"
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>FAQ Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question *</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                placeholder="What is the admission process?"
                                                toolbar="simple"
                                                minHeight="110px"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="answer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Answer *</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                placeholder="The admission process involves..."
                                                minHeight="260px"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Admissions" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display_order"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Order</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    {...field}
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
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
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="published">Published</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <FormField
                                    control={form.control}
                                    name="is_public"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormLabel className="cursor-pointer">Public</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : isNew ? "Add FAQ" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/support/faqs")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}
