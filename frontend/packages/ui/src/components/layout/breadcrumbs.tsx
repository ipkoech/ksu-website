"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(segment => segment);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;
                    const displayName = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                                ) : (
                                    <Link href={href} className="transition-colors hover:text-foreground">{displayName}</Link>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
