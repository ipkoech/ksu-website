"use client";

import { useAdminNewsList, useDeleteNews } from "@ksu/api-client";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { getNewsColumns } from "./columns";
import { PageTransition } from "@/lib/animations";
import { TableSearch } from "@/components/shared/table-search";
import { useState } from "react";


export default function NewsPage() {
    const [search, setSearch] = useState("");
    const { data: newsResponse, isLoading } = useAdminNewsList({ search: search || undefined });
    const news = newsResponse?.data || [];
    const { mutateAsync: deleteNews } = useDeleteNews();
    const { canCreate, canEdit, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();

    const columns = getNewsColumns({
        canEdit: canEdit("content"),
        canDelete: canDelete("content"),
        onDelete: (id) => confirmDelete("news article", () => deleteNews(id)),
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
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search news by title, slug, or summary" />}
                emptyMessage={search ? "No news articles match this search." : "No news articles found. Create your first article."}
            />
            {dialog}
        </PageTransition>
    );
}
