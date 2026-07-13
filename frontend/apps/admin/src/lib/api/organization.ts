import api, { type ApiResponse, ListParams } from "./client";

export interface Division {
    id: string;
    name: string;
    slug: string;
    description?: string;
    director?: string;
    created_at: string;
    updated_at: string;
}

export interface Wing {
    id: string;
    name: string;
    slug: string;
    division_id?: string;
    description?: string;
    head?: string;
    created_at: string;
    updated_at: string;
}

export interface GovernanceBody {
    id: string;
    name: string;
    slug: string;
    description?: string;
    members_count?: number;
    created_at: string;
    updated_at: string;
}

export interface GovernanceRole {
    id: string;
    name: string;
    slug: string;
    category: string;
    display_group: "chairperson" | "member" | "secretary";
    public_label: string;
    default_hierarchy_level: number;
    default_display_order: number;
    badge_style?: string | null;
    description?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CouncilDashboard {
    total_active_members: number;
    chairperson?: CouncilMember | null;
    member_count: number;
    government_representative_count: number;
    other_representative_count: number;
    secretary?: CouncilMember | null;
    draft_profile_count: number;
    published_profile_count: number;
    inactive_profile_count: number;
    vacant_position_count: number;
    last_updated_at?: string | null;
}

export interface CouncilMember {
    id: string;
    person_id: string;
    person?: {
        id?: string;
        display_name?: string;
        full_name?: string;
        photo_url?: string | null;
    } | null;
    governance_role_id?: string | null;
    governance_role?: GovernanceRole | null;
    role: string;
    title?: string | null;
    public_role_label: string;
    appointment_category?: string | null;
    official_designation?: string | null;
    represented_institution?: string | null;
    current_office?: string | null;
    appointing_authority?: string | null;
    appointment_reference?: string | null;
    profile_slug?: string | null;
    profile_summary?: string | null;
    workflow_status: string;
    appointment_status: string;
    status: string;
    display_order: number;
    hierarchy_level: number;
    reports_to_id?: string | null;
    reports_to?: {
        id: string;
        display_label: string;
        role_label: string;
    } | null;
    is_acting: boolean;
    is_ex_officio?: boolean;
    is_voting_member?: boolean;
    show_contact_publicly?: boolean;
    portrait_media_id?: string | null;
    portrait_media?: {
        id?: string;
        url?: string | null;
        alt_text?: string | null;
    } | null;
    start_date?: string | null;
    end_date?: string | null;
    term_number?: number | null;
    publish_without_portrait_override?: boolean;
    publication_notes?: string | null;
    published_at?: string | null;
}

export interface CouncilPageContent {
    id?: string;
    board_id?: string;
    page_key?: string;
    title?: string | null;
    intro?: string | null;
    breadcrumb_label?: string | null;
    hero_image_id?: string | null;
    hero_focal_point?: string | null;
    overlay_intensity?: number | null;
    mandate_label?: string | null;
    mandate_heading?: string | null;
    mandate_body?: string | null;
    mandate_icon?: string | null;
    document_cta_label?: string | null;
    document_cta_url?: string | null;
    status?: string;
    workflow_status?: string;
    published_at?: string | null;
}

export interface CouncilOrderNode {
    assignment_id: string;
    display_group: "chairperson" | "member" | "secretary";
    display_order: number;
    hierarchy_level: number;
    reports_to_id?: string | null;
}

export interface CouncilPublicPreview {
    page?: Record<string, any> | null;
    mandate?: Record<string, any> | null;
    chairperson?: Record<string, any> | null;
    members: Array<Record<string, any>>;
    secretary?: Record<string, any> | null;
}

export interface GovernanceWorkspaceProfile {
    key: string;
    badgeLabel: string;
    overviewTitle: string;
    title: string;
    description: string;
    memberSingular: string;
    memberPlural: string;
    memberFallbackName: string;
    roleFallbackLabel: string;
    defaultDocumentCtaLabel: string;
    publicProfileBasePath: string;
    groupLabels: Record<CouncilOrderNode["display_group"], string>;
    api: {
        dashboard: () => Promise<ApiResponse<CouncilDashboard>>;
        listMembers: (params?: ListParams) => Promise<ApiResponse<CouncilMember[]>>;
        createMember: (data: Partial<CouncilMember>) => Promise<ApiResponse<CouncilMember>>;
        updateMember: (id: string, data: Partial<CouncilMember>) => Promise<ApiResponse<CouncilMember>>;
        deleteMember: (id: string) => Promise<ApiResponse<void>>;
        getOrder: () => Promise<ApiResponse<CouncilOrderNode[]>>;
        updateOrder: (data: { nodes: CouncilOrderNode[] }) => Promise<ApiResponse<CouncilOrderNode[]>>;
        getPageContent: () => Promise<ApiResponse<CouncilPageContent>>;
        updatePageContent: (data: Partial<CouncilPageContent>) => Promise<ApiResponse<CouncilPageContent>>;
        preview: () => Promise<ApiResponse<CouncilPublicPreview>>;
        transitionMember: (id: string, action: string, data?: { comment?: string }) => Promise<ApiResponse<CouncilMember>>;
    };
}

export const divisionsApi = {
    list: (params?: ListParams) =>
        api.get<Division[]>("/divisions", { params }),
    get: (slug: string) => api.get<Division>(`/divisions/${slug}`),
    create: (data: any) => api.post<Division>("/divisions", data),
    update: (id: string, data: any) =>
        api.patch<Division>(`/divisions/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/divisions/id/${id}`),
};

export const wingsApi = {
    list: (params?: ListParams) => api.get<Wing[]>("/wings", { params }),
    get: (slug: string) => api.get<Wing>(`/wings/${slug}`),
    create: (data: any) => api.post<Wing>("/wings", data),
    update: (id: string, data: any) =>
        api.patch<Wing>(`/wings/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/wings/id/${id}`),
};

export const governanceApi = {
    list: (params?: ListParams) =>
        api.get<GovernanceBody[]>("/governance", { params }),
    get: (slug: string) => api.get<GovernanceBody>(`/governance/${slug}`),
    create: (data: any) => api.post<GovernanceBody>("/governance", data),
    update: (id: string, data: any) =>
        api.patch<GovernanceBody>(`/governance/id/${id}`, data),
    delete: (id: string) => api.delete<void>(`/governance/id/${id}`),
};

export const governanceAdminApi = {
    dashboard: () =>
        api.get<CouncilDashboard>("/governance/admin/council/dashboard"),
    listRoles: () =>
        api.get<GovernanceRole[]>("/governance/admin/roles"),
    createRole: (data: Partial<GovernanceRole>) =>
        api.post<GovernanceRole>("/governance/admin/roles", data),
    updateRole: (id: string, data: Partial<GovernanceRole>) =>
        api.patch<GovernanceRole>(`/governance/admin/roles/${id}`, data),
    listCouncilMembers: (params?: ListParams) =>
        api.get<CouncilMember[]>("/governance/admin/council/members", { params }),
    createCouncilMember: (data: Partial<CouncilMember>) =>
        api.post<CouncilMember>("/governance/admin/council/members", data),
    getCouncilMember: (id: string) =>
        api.get<CouncilMember>(`/governance/admin/council/members/${id}`),
    updateCouncilMember: (id: string, data: Partial<CouncilMember>) =>
        api.patch<CouncilMember>(`/governance/admin/council/members/${id}`, data),
    deleteCouncilMember: (id: string) =>
        api.delete<void>(`/governance/admin/council/members/${id}`),
    getCouncilOrder: () =>
        api.get<CouncilOrderNode[]>("/governance/admin/council/order"),
    updateCouncilOrder: (data: { nodes: CouncilOrderNode[] }) =>
        api.put<CouncilOrderNode[]>("/governance/admin/council/order", data),
    getCouncilPageContent: () =>
        api.get<CouncilPageContent>("/governance/admin/council/page-content"),
    updateCouncilPageContent: (data: Partial<CouncilPageContent>) =>
        api.patch<CouncilPageContent>("/governance/admin/council/page-content", data),
    previewCouncil: () =>
        api.get<CouncilPublicPreview>("/governance/admin/council/preview"),
    transitionCouncilMember: (id: string, action: string, data?: { comment?: string }) =>
        api.post<CouncilMember>(`/governance/admin/council/members/${id}/${action}`, undefined, {
            params: data?.comment ? { comment: data.comment } : undefined,
        }),
    managementBoardDashboard: () =>
        api.get<CouncilDashboard>("/governance/admin/management-board/dashboard"),
    listManagementBoardMembers: (params?: ListParams) =>
        api.get<CouncilMember[]>("/governance/admin/management-board/members", { params }),
    createManagementBoardMember: (data: Partial<CouncilMember>) =>
        api.post<CouncilMember>("/governance/admin/management-board/members", data),
    updateManagementBoardMember: (id: string, data: Partial<CouncilMember>) =>
        api.patch<CouncilMember>(`/governance/admin/management-board/members/${id}`, data),
    deleteManagementBoardMember: (id: string) =>
        api.delete<void>(`/governance/admin/management-board/members/${id}`),
    getManagementBoardOrder: () =>
        api.get<CouncilOrderNode[]>("/governance/admin/management-board/order"),
    updateManagementBoardOrder: (data: { nodes: CouncilOrderNode[] }) =>
        api.put<CouncilOrderNode[]>("/governance/admin/management-board/order", data),
    getManagementBoardPageContent: () =>
        api.get<CouncilPageContent>("/governance/admin/management-board/page-content"),
    updateManagementBoardPageContent: (data: Partial<CouncilPageContent>) =>
        api.patch<CouncilPageContent>("/governance/admin/management-board/page-content", data),
    previewManagementBoard: () =>
        api.get<CouncilPublicPreview>("/governance/admin/management-board/preview"),
    transitionManagementBoardMember: (id: string, action: string, data?: { comment?: string }) =>
        api.post<CouncilMember>(`/governance/admin/management-board/members/${id}/${action}`, undefined, {
            params: data?.comment ? { comment: data.comment } : undefined,
        }),
};

export const councilGovernanceProfile: GovernanceWorkspaceProfile = {
    key: "university-council",
    badgeLabel: "University Council",
    overviewTitle: "Council Overview",
    title: "University Governance",
    description: "Manage Council members, page content, official order, preview, and publication workflow.",
    memberSingular: "Council Member",
    memberPlural: "Council Members",
    memberFallbackName: "Council member",
    roleFallbackLabel: "Council role",
    defaultDocumentCtaLabel: "Council Charter",
    publicProfileBasePath: "/about/university-council",
    groupLabels: {
        chairperson: "Chairperson",
        member: "Council Members",
        secretary: "Secretary to Council",
    },
    api: {
        dashboard: governanceAdminApi.dashboard,
        listMembers: governanceAdminApi.listCouncilMembers,
        createMember: governanceAdminApi.createCouncilMember,
        updateMember: governanceAdminApi.updateCouncilMember,
        deleteMember: governanceAdminApi.deleteCouncilMember,
        getOrder: governanceAdminApi.getCouncilOrder,
        updateOrder: governanceAdminApi.updateCouncilOrder,
        getPageContent: governanceAdminApi.getCouncilPageContent,
        updatePageContent: governanceAdminApi.updateCouncilPageContent,
        preview: governanceAdminApi.previewCouncil,
        transitionMember: governanceAdminApi.transitionCouncilMember,
    },
};

export const managementBoardGovernanceProfile: GovernanceWorkspaceProfile = {
    key: "university-management",
    badgeLabel: "University Management",
    overviewTitle: "Management Overview",
    title: "University Management",
    description: "Manage Management Board members, page content, official order, preview, and publication workflow.",
    memberSingular: "Management Member",
    memberPlural: "Management Board Members",
    memberFallbackName: "Management member",
    roleFallbackLabel: "Management role",
    defaultDocumentCtaLabel: "Management Documents",
    publicProfileBasePath: "/about/university-management",
    groupLabels: {
        chairperson: "Vice Chancellor",
        member: "Management Board Members",
        secretary: "Secretary",
    },
    api: {
        dashboard: governanceAdminApi.managementBoardDashboard,
        listMembers: governanceAdminApi.listManagementBoardMembers,
        createMember: governanceAdminApi.createManagementBoardMember,
        updateMember: governanceAdminApi.updateManagementBoardMember,
        deleteMember: governanceAdminApi.deleteManagementBoardMember,
        getOrder: governanceAdminApi.getManagementBoardOrder,
        updateOrder: governanceAdminApi.updateManagementBoardOrder,
        getPageContent: governanceAdminApi.getManagementBoardPageContent,
        updatePageContent: governanceAdminApi.updateManagementBoardPageContent,
        preview: governanceAdminApi.previewManagementBoard,
        transitionMember: governanceAdminApi.transitionManagementBoardMember,
    },
};
