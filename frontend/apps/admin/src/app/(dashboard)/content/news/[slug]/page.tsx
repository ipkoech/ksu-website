"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useNewsBySlug, useNews, useCreateNews, useUpdateNews } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const newsSchema = z.object({
    title: z.string().min(1, "Title is required").max(500),
    slug: z.string().max(500).optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    is_published: z.boolean(),
    is_featured: z.boolean(),
    is_home: z.boolean(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function NewsFormPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const isNew = slug === "new";

    const { data: newsBySlugData, isLoading: isLoadingSlug } = useNewsBySlug(!isNew ? slug : "");
    const { data: newsByIdData, isLoading: isLoadingId } = useNews(!isNew && slug ? slug : "");
    const newsData = isNew ? null : (newsBySlugData?.data || newsByIdData?.data);
    const isLoading = !isNew && (isLoadingSlug || isLoadingId);

    const createNews = useCreateNews();
    const updateNews = useUpdateNews();

    const isPending = createNews.isPending || updateNews.isPending;

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            category: "",
            is_published: false,
            is_featured: false,
            is_home: false,
        },
        values: newsData ? {
            title: newsData.title || "",
            slug: newsData.slug || "",
            excerpt: "",
            content: newsData.content || "",
            category: newsData.category || "",
            is_published: newsData.is_published || false,
            is_featured: newsData.is_featured || false,
            is_home: false,
        } : undefined,
    });

    const onSubmit = async (values: NewsFormValues) => {
        try {
            if (isNew) {
                await createNews.mutateAsync(values as any);
                toast.success("News article created successfully");
            } else {
                await updateNews.mutateAsync({ id: newsData!.id, data: values as any });
                toast.success("News article updated successfully");
            }
            router.push("/content/news");
        } catch (error) {
            toast.error(isNew ? "Failed to create news article" : "Failed to update news article");
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
                title={isNew ? "Create News Article" : "Edit News Article"}
                description={isNew ? "Create a new news article" : `Editing: ${newsData?.title}`}
                backHref="/content/news"
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Article Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Article title..." {...field} />
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
                                                    <Input placeholder="article-slug" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="excerpt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Excerpt</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Brief summary..." rows={3} {...field} />
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
                                                <FormLabel>Content</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Article content..." rows={15} {...field} />
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
                                    <CardTitle>Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="announcement">Announcement</SelectItem>
                                                        <SelectItem value="event">Event</SelectItem>
                                                        <SelectItem value="research">Research</SelectItem>
                                                        <SelectItem value="academic">Academic</SelectItem>
                                                        <SelectItem value="general">General</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                        name="is_home"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <FormLabel className="cursor-pointer">Show on Home</FormLabel>
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
                            {isPending ? "Saving..." : isNew ? "Create Article" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/content/news")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}