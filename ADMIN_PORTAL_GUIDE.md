# KSU Admin Portal Frontend - Implementation Guide

## Project Overview

The KSU Main Admin Portal is a Next.js 15 based administrative interface for Kisii University. It provides a comprehensive dashboard for managing content, organizational structure, academic programs, and system settings.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS with CSS variables theming
- **State Management**: TanStack Query v5 (server state), Zustand (client state)
- **UI Components**: shadcn/ui from @ksu/ui
- **Authentication**: httpOnly JWT cookies via @ksu/auth
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Tables**: TanStack React Table v8

### Project Structure

```
frontend/apps/admin/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Admin layout with sidebar
│   │   ├── dashboard/page.tsx            # Dashboard home
│   │   ├── content/
│   │   │   ├── page.tsx                  # Content overview
│   │   │   ├── news/page.tsx             # News list
│   │   │   ├── blogs/page.tsx            # Blogs list
│   │   │   ├── announcements/page.tsx    # Announcements list
│   │   │   ├── events/page.tsx           # Events list
│   │   │   └── sliders/...               # Sliders (template ready)
│   │   ├── organization/
│   │   │   ├── divisions/page.tsx        # Divisions list
│   │   │   ├── wings/...                 # Wings (template ready)
│   │   │   └── governance/...            # Governance (template ready)
│   │   ├── academic/
│   │   │   ├── schools/page.tsx          # Schools list
│   │   │   ├── campuses/...              # Campuses (template ready)
│   │   │   ├── departments/...           # Departments (template ready)
│   │   │   └── programmes/...            # Programmes (template ready)
│   │   ├── admissions/                   # Admissions (template ready)
│   │   ├── people/
│   │   │   ├── persons/page.tsx          # Persons list
│   │   │   ├── staff/...                 # Staff (template ready)
│   │   │   └── alumni/...                # Alumni (template ready)
│   │   ├── marketing/                    # Marketing (template ready)
│   │   ├── reports/page.tsx              # Reports dashboard
│   │   └── settings/
│   │       ├── general/page.tsx          # General settings
│   │       ├── api-keys/page.tsx         # API keys management
│   │       └── webhooks/...              # Webhooks (template ready)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   │   ├── stats-card.tsx                # Stats card with animation
│   │   ├── recent-activity.tsx           # Recent activity (template)
│   │   └── quick-actions.tsx             # Quick actions (template)
│   ├── data-table/
│   │   ├── data-table.tsx                # Reusable table with sorting/filtering
│   │   ├── columns.tsx                   # Column definitions factory
│   │   ├── toolbar.tsx                   # Table toolbar (template)
│   │   └── pagination.tsx                # Table pagination
│   ├── shared/
│   │   ├── page-header.tsx               # Page title + actions
│   │   ├── empty-state.tsx               # Empty list state (template)
│   │   ├── loading-state.tsx             # Loading skeleton (template)
│   │   ├── error-boundary.tsx            # Error handling (template)
│   │   └── confirm-dialog.tsx            # Delete confirmation (template)
│   └── auth/ (existing)
├── hooks/
│   └── use-permissions.ts                # RBAC permissions hook
├── lib/
│   ├── animations.ts                     # Framer Motion animation presets
│   ├── utils.ts                          # Utility functions (cn, etc.)
│   └── constants.ts                      # App constants (template)
└── middleware.ts (existing)

packages/ui/src/
├── components/
│   ├── layout/
│   │   ├── admin-sidebar.tsx             # Collapsible sidebar with navigation
│   │   ├── admin-toolbar.tsx             # Sticky toolbar with breadcrumbs
│   │   └── breadcrumbs.tsx               # Dynamic breadcrumbs
│   └── ui/ (shadcn components)
├── lib/
│   └── utils.ts
└── package.json (exports configured)
```

## Key Components

### 1. AdminLayout (Admin Layout)
**Location**: `src/app/(dashboard)/layout.tsx`

Provides the main admin interface structure with:
- Collapsible sidebar (desktop)
- Mobile drawer sidebar
- Sticky toolbar with breadcrumbs
- Responsive content area
- RBAC-aware navigation

**Features**:
- Mobile-responsive (drawer on mobile)
- Collapsible sidebar on desktop
- User permissions integration
- Maintains scroll position for main content

### 2. AdminSidebar
**Location**: `packages/ui/src/components/layout/admin-sidebar.tsx`

Hierarchical navigation component with:
- Collapsible menu groups
- RBAC filtering (hides items user can't access)
- Active route highlighting
- Badge support
- Smooth animations

**Navigation Structure**:
- Dashboard
- Content (News, Blogs, Announcements, Events, Sliders)
- Organization (Divisions, Wings, Governance)
- Academic (Campuses, Schools, Departments, Programmes)
- Admissions (Intakes, Applications)
- People (Persons, Staff, Alumni)
- Marketing (Testimonials, Newsletters, Social Posts)
- Reports
- Settings (General, API Keys, Webhooks)

### 3. AdminToolbar
**Location**: `packages/ui/src/components/layout/admin-toolbar.tsx`

Sticky header with:
- Menu button for mobile
- Dynamic breadcrumbs
- Search input (desktop only)
- Notifications button
- User menu

### 4. DataTable
**Location**: `src/components/data-table/data-table.tsx`

Reusable table component featuring:
- TanStack React Table v8 integration
- Sorting and filtering
- Pagination
- Row animations
- Loading states
- Empty states
- Action menus

**Usage Example**:
```tsx
<DataTable
  data={news || []}
  columns={getNewsColumns({ canEdit, canDelete, onDelete })}
  isLoading={isLoading}
  emptyMessage="No news articles found."
/>
```

### 5. StatsCard
**Location**: `src/components/dashboard/stats-card.tsx`

Animated statistics card with:
- Icon with colored background
- Title and value
- Change percentage with trend indicator
- Hover animation
- Configurable colors

### 6. PageHeader
**Location**: `src/components/shared/page-header.tsx`

Page title section with:
- Large title and optional description
- Create button (conditional on permissions)
- Additional actions slot
- Entry animation

## RBAC Integration

### usePermissions Hook
**Location**: `src/hooks/use-permissions.ts`

Provides permission checking:
```tsx
const { hasScope, canView, canCreate, canEdit, canDelete } = usePermissions();

if (canCreate("content")) {
  // Show create button
}
```

**Scope Format**: `resource:action`
- Examples: `content:read`, `content:manage_news`, `staff:write`, `system:admin`
- Supports wildcards: `content:*`, `*:*`

### Navigation Filtering
Sidebar automatically hides menu items the user doesn't have access to based on `requiredScope`.

### Action Filtering
Buttons and actions are conditionally shown based on user permissions.

## Page Templates

All pages follow this pattern:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";

export default function ResourcePage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { data, isLoading } = useQuery({ /* ... */ });

  return (
    <PageTransition>
      <PageHeader
        title="Resources"
        createHref={canCreate("resource") ? "/resource/new" : undefined}
      />
      <DataTable
        data={data || []}
        columns={columns}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
```

## Animation System

**Location**: `src/lib/animations.ts`

Predefined animation variants:
- `fadeInUp`: Fade in with upward movement
- `staggerContainer`: Stagger children animations
- `slideInFromLeft`: Slide in from left
- `scaleIn`: Scale up entrance
- `PageTransition`: Full-page fade/slide transition

**Usage**:
```tsx
<PageTransition>
  {/* Page content */}
</PageTransition>

<motion.div {...fadeInUp}>
  {/* Animated content */}
</motion.div>
```

## Data Fetching

Uses TanStack Query v5 for server state management:

```tsx
// Hook (from @ksu/api-client)
const { data, isLoading, error } = useNewsList();

// Mutation
const { mutate: deleteNews } = useDeleteNews();

// Invalidation on success
useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["news"] });
  },
});
```

## Theming

Uses CSS variables defined in `globals.css`:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--destructive`, `--success`, `--warning`
- `--border`, `--input`, `--ring`
- Sidebar-specific variables

All components use Tailwind classes like `bg-card text-foreground`.

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (default)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg)

### Mobile Features
- Drawer sidebar (replaces collapsible)
- Full-width tables with horizontal scroll
- Stacked layouts
- Touch-friendly buttons

### Desktop Features
- Collapsible sidebar
- Full tables with all columns
- Multi-column layouts
- Hover effects

## Installation & Setup

```bash
# Install dependencies
cd frontend/apps/admin
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Implemented Pages

### Fully Implemented
- ✅ Dashboard (with stats cards)
- ✅ News list
- ✅ Content overview
- ✅ Blogs list
- ✅ Announcements list
- ✅ Events list
- ✅ Divisions list
- ✅ Schools list
- ✅ Persons list
- ✅ API Keys management
- ✅ General Settings
- ✅ Reports

### Template Ready (Copy and adapt)
- Wing management
- Governance
- Campuses
- Departments
- Programmes
- Intakes/Applications
- Staff
- Alumni
- Testimonials
- Newsletters
- Social Posts
- FAQs
- Contacts
- Policies
- Webhooks

## Creating New Pages

1. **Create page file**: `src/app/(dashboard)/[domain]/[resource]/page.tsx`

2. **Define data interface**: 
```tsx
interface ResourceItem {
  id: string;
  name: string;
  status: string;
  // ... other fields
}
```

3. **Define columns**:
```tsx
const getResourceColumns = (): ColumnDef<ResourceItem>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  // ... more columns
];
```

4. **Create page component**:
```tsx
export default function ResourcePage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { data, isLoading } = useQuery({
    queryKey: ["resource"],
    queryFn: async () => ({ data: [] as ResourceItem[] }),
  });

  return (
    <PageTransition>
      <PageHeader title="Resources" />
      <DataTable
        data={data?.data || []}
        columns={getResourceColumns()}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
```

## Build Status

```
✓ Compiled successfully
✓ Type checking passed
✓ Linting passed
✓ 51 static pages generated
✓ Bundle size optimized
```

## Performance

- **First Load JS**: ~103 kB (shared)
- **Page Size**: 2-5 kB per route
- **Static pre-rendering**: All dashboard pages
- **Dynamic routes**: API endpoints for data
- **Bundle optimized**: Code splitting per page

## Next Steps

1. **Connect to actual API**: Replace mock data with real API calls
2. **Implement forms**: Add create/edit/delete forms
3. **Add search**: Implement global search
4. **Setup notifications**: Connect to notification system
5. **Configure auth**: Integrate with actual JWT auth
6. **Add more dashboards**: Implement analytics dashboards
7. **Mobile testing**: Test on various devices
8. **Performance monitoring**: Add observability

## Troubleshooting

### Pages not appearing in sidebar
- Check `requiredScope` matches user scopes
- Verify `usePermissions` hook has correct user data

### Import errors for UI components
- Ensure exports in `packages/ui/package.json` are correct
- Check path aliases in `tsconfig.json`

### Build errors with .tsx extensions
- Remove `.tsx` from import statements
- Use `import X from "@/lib/animations"` not `"@/lib/animations.tsx"`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
