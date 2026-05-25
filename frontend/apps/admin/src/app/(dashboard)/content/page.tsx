"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { Newspaper, FileText, Bell, Calendar, ImageIcon } from "lucide-react";
import {
    announcementsApi,
    blogsApi,
    queryKeys,
    slidersApi,
    useAdminEvents,
    useAdminNewsList,
} from "@ksu/api-client";
import { formatCount } from "@/lib/counts";

interface ContentTypeCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    count: string;
}

const countParams = { page: 1, per_page: 1, fields: "id" };

export default function ContentPage() {
    const news = useAdminNewsList(countParams);
    const events = useAdminEvents(countParams);
    const blogs = useQuery({
        queryKey: [...queryKeys.blogs.list(countParams), "admin"] as const,
        queryFn: () => blogsApi.listAdmin(countParams),
    });
    const announcements = useQuery({
        queryKey: queryKeys.announcements.list(countParams),
        queryFn: () => announcementsApi.list(countParams),
    });
    const sliders = useQuery({
        queryKey: queryKeys.sliders.groupList(countParams),
        queryFn: () => slidersApi.listGroups(countParams),
    });

    const contentTypes: ContentTypeCard[] = [
        {
            title: "News",
            description: "Manage university news articles",
            icon: <Newspaper className="h-6 w-6" />,
            href: "/content/news",
            count: formatCount(news.data, news.isLoading, news.isError),
        },
        {
            title: "Blogs",
            description: "Manage blog posts",
            icon: <FileText className="h-6 w-6" />,
            href: "/content/blogs",
            count: formatCount(blogs.data, blogs.isLoading, blogs.isError),
        },
        {
            title: "Announcements",
            description: "Manage announcements",
            icon: <Bell className="h-6 w-6" />,
            href: "/content/announcements",
            count: formatCount(announcements.data, announcements.isLoading, announcements.isError),
        },
        {
            title: "Events",
            description: "Manage events and calendar",
            icon: <Calendar className="h-6 w-6" />,
            href: "/content/events",
            count: formatCount(events.data, events.isLoading, events.isError),
        },
        {
            title: "Sliders",
            description: "Manage homepage sliders",
            icon: <ImageIcon className="h-6 w-6" />,
            href: "/content/sliders",
            count: formatCount(sliders.data, sliders.isLoading, sliders.isError),
        },
    ];

    return (
        <PageTransition>
            <PageHeader
                title="Content Management"
                description="Manage all university content"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contentTypes.map((contentType, index) => (
                    <motion.div
                        key={contentType.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link href={contentType.href}>
                            <div className="rounded-lg border border-border bg-card p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-muted p-3 text-primary">
                                        {contentType.icon}
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground">
                                        {contentType.count}
                                    </span>
                                </div>
                                <h3 className="mb-1 text-lg font-semibold">{contentType.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {contentType.description}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </PageTransition>
    );
}
