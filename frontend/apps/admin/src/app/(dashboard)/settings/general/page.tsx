"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useSettings } from "@ksu/api-client/hooks/admin";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";

export default function GeneralSettingsPage() {
    const settings = useSettings();
    const visibleSettings = settings.data?.slice(0, 6) ?? [];

    return (
        <PageTransition>
            <PageHeader
                title="General Settings"
                description="Review persisted system settings. Editing is handled in the system settings workspace."
            />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Current settings</CardTitle>
                        <CardDescription>Values come from the admin system settings endpoint.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {settings.isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
                                ))}
                            </div>
                        ) : settings.isError ? (
                            <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
                                Settings are unavailable for this session.
                            </p>
                        ) : visibleSettings.length === 0 ? (
                            <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                                No settings were returned by the backend.
                            </p>
                        ) : (
                            <div className="divide-y rounded-lg border">
                                {visibleSettings.map((setting) => (
                                    <div key={setting.id ?? setting.key} className="grid gap-1 p-4 md:grid-cols-[0.6fr_1fr]">
                                        <p className="font-medium">{setting.description || setting.key}</p>
                                        <p className="break-words text-sm text-muted-foreground">{String(setting.value ?? "--")}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Settings className="h-5 w-5" />
                        </div>
                        <CardTitle>Editing workflow</CardTitle>
                        <CardDescription>
                            The system settings page owns validation, save behavior, and audit logging.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                            This main-service route stays read-only to avoid presenting unsupported save states.
                        </p>
                        <Button asChild>
                            <Link href="/system/settings">Open system settings</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </PageTransition>
    );
}
