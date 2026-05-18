"use client";

import { motion } from "framer-motion";
import { Search, Bell, User, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Breadcrumbs } from "./breadcrumbs";

interface ToolbarProps {
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
}

export function AdminToolbar({ onMenuToggle, showMenuButton }: ToolbarProps) {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-sticky flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6"
        >
            <div className="flex items-center gap-4">
                {showMenuButton && (
                    <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Search - Hidden on mobile, visible on md+ */}
                <div className="hidden md:block relative w-64 lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-muted/50"
                    />
                </div>

                {/* Mobile search button */}
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                        3
                    </span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
}
