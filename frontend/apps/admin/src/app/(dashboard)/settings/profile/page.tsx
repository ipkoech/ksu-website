"use client";

import Link from "next/link";
import { useAuth } from "@ksu/auth";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";

export default function ProfileSettingsPage() {
    const { user } = useAuth();

    return (
        <PageTransition>
            <PageHeader
                title="Profile Settings"
                description="Review the authenticated admin profile returned by the auth session."
                backHref="/settings"
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Session-backed identity details.</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y rounded-lg border p-0">
                        <div className="grid gap-1 p-4 md:grid-cols-[0.4fr_1fr]">
                            <p className="font-medium">Name</p>
                            <p className="break-words text-sm text-muted-foreground">{user?.name ?? "--"}</p>
                        </div>
                        <div className="grid gap-1 p-4 md:grid-cols-[0.4fr_1fr]">
                            <p className="font-medium">Email</p>
                            <p className="break-words text-sm text-muted-foreground">{user?.email ?? "--"}</p>
                        </div>
                        <div className="grid gap-1 p-4 md:grid-cols-[0.4fr_1fr]">
                            <p className="font-medium">Services</p>
                            <p className="break-words text-sm text-muted-foreground">
                                {user?.services?.length ? user.services.map((service) => service.service).join(", ") : "--"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account changes</CardTitle>
                        <CardDescription>Password and account lifecycle operations are handled by auth workflows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                            This route does not expose unsupported profile edit fields.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/select-service">Switch service</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </PageTransition>
    );
}
