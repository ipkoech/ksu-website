"use client";

import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useAuth, getHighestRole, formatRoleName } from "@ksu/auth";
import type { Service } from "@ksu/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, LogoIcon } from "@ksu/ui/components";
import { Building, FlaskConical, Library, Settings } from "lucide-react";

const SERVICE_META: Record<Service, {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}> = {
  main: {
    title: "University Portal",
    description: "Content, academic structure, admissions, student life",
    icon: Building,
    color: "bg-blue-500",
  },
  research: {
    title: "Research Portal",
    description: "Projects, publications, grants, innovation",
    icon: FlaskConical,
    color: "bg-green-500",
  },
  library: {
    title: "Library System",
    description: "Catalog, circulation, patrons, acquisitions",
    icon: Library,
    color: "bg-amber-500",
  },
  system: {
    title: "System Administration",
    description: "Users, roles, audit logs, system settings",
    icon: Settings,
    color: "bg-purple-500",
  },
};

export default function SelectServicePage() {
  const router = useRouter();
  const { user, switchService } = useAuth();

  if (!user) return null;

  const services = Array.from(new Set(user.services.map((service) => service.service)));

  const handleSelect = (service: Service) => {
    switchService(service);
    router.push(`/${service}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <LogoIcon size="lg" className="mx-auto mb-4" priority />
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Select a service to manage</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const meta = SERVICE_META[service];
            const Icon = meta.icon;
            const role = getHighestRole(user.roles, service);

            return (
              <Card
                key={service}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => handleSelect(service)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`rounded-lg p-3 ${meta.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{meta.title}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {role ? formatRoleName(role) : "Access Granted"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}

        </div>
      </div>
    </div>
  );
}
