"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { Button } from "@ksu/ui/button";
import { Input } from "@ksu/ui/input";

export default function GeneralSettingsPage() {
    return (
        <PageTransition>
            <PageHeader
                title="General Settings"
                description="Configure general application settings"
            />

            <div className="grid gap-6 max-w-2xl">
                {/* Site Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <h2 className="mb-4 text-lg font-semibold">Site Information</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Site Name</label>
                            <Input type="text" placeholder="Kisii University" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Site URL</label>
                            <Input type="url" placeholder="https://kisiiuniversity.ac.ke" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Support Email</label>
                            <Input type="email" placeholder="support@kisiiuniversity.ac.ke" />
                        </div>
                        <Button className="mt-2">Save Changes</Button>
                    </form>
                </motion.div>

                {/* Maintenance Mode */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <h2 className="mb-4 text-lg font-semibold">Maintenance Mode</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable Maintenance Mode</p>
                                <p className="text-sm text-muted-foreground">
                                    Temporarily disable access to the portal
                                </p>
                            </div>
                            <input type="checkbox" className="w-4 h-4" />
                        </div>
                    </div>
                </motion.div>

                {/* System Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <h2 className="mb-4 text-lg font-semibold">System Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Application Version</span>
                            <span className="font-medium">0.1.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment</span>
                            <span className="font-medium">Development</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Database Status</span>
                            <span className="font-medium text-green-600">Connected</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
}
