"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { Newspaper, FileText, Bell, Calendar, ImageIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@ksu/ui/button";

interface ContentTypeCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    count: number;
}

export default function ContentPage() {
    const contentTypes: ContentTypeCard[] = [
        {
            title: "News",
            description: "Manage university news articles",
            icon: <Newspaper className="h-6 w-6" />,
            href: "/content/news",
            count: 12,
        },
        {
            title: "Blogs",
            description: "Manage blog posts",
            icon: <FileText className="h-6 w-6" />,
            href: "/content/blogs",
            count: 8,
        },
        {
            title: "Announcements",
            description: "Manage announcements",
            icon: <Bell className="h-6 w-6" />,
            href: "/content/announcements",
            count: 24,
        },
        {
            title: "Events",
            description: "Manage events and calendar",
            icon: <Calendar className="h-6 w-6" />,
            href: "/content/events",
            count: 15,
        },
        {
            title: "Sliders",
            description: "Manage homepage sliders",
            icon: <ImageIcon className="h-6 w-6" />,
            href: "/content/sliders",
            count: 5,
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
