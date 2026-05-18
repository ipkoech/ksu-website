"use client";

import { useNewsList, useDeleteNews } from "@ksu/api-client";
import type { News } from "@ksu/api-client/main";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { getNewsColumns } from "./columns";
import { PageTransition } from "@/lib/animations";


export default function NewsPage() {
    const { data: newsResponse, isLoading } = useNewsList();
    const news = newsResponse?.data || [];
    const { mutate: deleteNews } = useDeleteNews();
    const { canCreate, canEdit, canDelete } = usePermissions();

    const columns = getNewsColumns({
        canEdit: canEdit("content"),
        canDelete: canDelete("content"),
        onDelete: (id) => deleteNews(id),
    });

    return (
        <PageTransition>
            <PageHeader
                title="News"
                description="Manage university news articles"
                createHref={canCreate("content") ? "/content/news/new" : undefined}
                createLabel="Add News"
            />
            <DataTable
                data={news || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No news articles found. Create your first article."
            />
        </PageTransition>
    );
}
