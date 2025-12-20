// APP_NAME is now in translations (app.name)
export const APP_NAME_KEY = "app.name";
export const APP_SHORT_NAME_KEY = "app.shortName";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    RECOVER_PASSWORD: "/recover-password",
    RESET_PASSWORD: "/reset-password",
  },
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  UNAUTHORIZED: "/unauthorized",
  // Student routes
  STUDENT: {
    DASHBOARD: "/dashboard",
    PROPOSALS: "/proposals",
    PROJECTS: "/projects",
    REGISTER_PROJECT: "/projects/register",
    GROUPS: "/groups",
    REQUESTS: "/requests",
    DOCUMENTS: "/documents",
    FOLLOW_UP: "/follow-up",
    GRADES: "/grades",
  },
  // Supervisor routes
  SUPERVISOR: {
    DASHBOARD: "/dashboard",
    SUPERVISION_REQUESTS: "/supervision-requests",
    PROJECTS: "/projects",
    PROGRESS: "/progress",
    EVALUATION: "/evaluation",
  },
  // Discussion Committee routes
  DISCUSSION_COMMITTEE: {
    DASHBOARD: "/committee/discussion/dashboard",
    PROJECTS: "/committee/discussion/projects",
    EVALUATION: "/committee/discussion/evaluation",
  },
  // Projects Committee routes
  PROJECTS_COMMITTEE: {
    DASHBOARD: "/committee/projects/dashboard",
    PERIODS: "/committee/projects/periods",
    PROPOSALS: "/committee/projects/proposals",
    ANNOUNCE_PROJECTS: "/committee/projects/announce",
    ASSIGN_SUPERVISORS: "/committee/projects/supervisors",
    REQUESTS: "/committee/projects/requests",
    DISTRIBUTE_COMMITTEES: "/committee/projects/distribute",
    REPORTS: "/committee/projects/reports",
  },
  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    REPORTS: "/admin/reports",
  },
} as const;

export interface NavMenuItem {
  labelKey: string; // Translation key instead of hardcoded label
  path: string;
  icon: string; // Lucide icon name
  badge?: number;
}

export const NAV_MENU: Record<string, NavMenuItem[]> = {
  student: [
    {
      labelKey: "nav.dashboard",
      path: ROUTES.STUDENT.DASHBOARD,
      icon: "LayoutDashboard",
    },
    {
      labelKey: "nav.proposals",
      path: ROUTES.STUDENT.PROPOSALS,
      icon: "FileText",
    },
    {
      labelKey: "nav.projects",
      path: ROUTES.STUDENT.PROJECTS,
      icon: "Briefcase",
    },
    { labelKey: "nav.groups", path: ROUTES.STUDENT.GROUPS, icon: "Users" },
    {
      labelKey: "nav.requests",
      path: ROUTES.STUDENT.REQUESTS,
      icon: "FileCheck",
    },
    {
      labelKey: "nav.documents",
      path: ROUTES.STUDENT.DOCUMENTS,
      icon: "FolderOpen",
    },
    {
      labelKey: "nav.followUp",
      path: ROUTES.STUDENT.FOLLOW_UP,
      icon: "TrendingUp",
    },
    { labelKey: "nav.grades", path: ROUTES.STUDENT.GRADES, icon: "Award" },
  ],
  supervisor: [
    {
      labelKey: "nav.dashboard",
      path: ROUTES.SUPERVISOR.DASHBOARD,
      icon: "LayoutDashboard",
    },
    {
      labelKey: "nav.supervisionRequests",
      path: ROUTES.SUPERVISOR.SUPERVISION_REQUESTS,
      icon: "UserCheck",
    },
    {
      labelKey: "nav.projects",
      path: ROUTES.SUPERVISOR.PROJECTS,
      icon: "Briefcase",
    },
    {
      labelKey: "nav.progress",
      path: ROUTES.SUPERVISOR.PROGRESS,
      icon: "TrendingUp",
    },
    {
      labelKey: "nav.evaluation",
      path: ROUTES.SUPERVISOR.EVALUATION,
      icon: "ClipboardCheck",
    },
  ],
  discussion_committee: [
    {
      labelKey: "nav.dashboard",
      path: ROUTES.DISCUSSION_COMMITTEE.DASHBOARD,
      icon: "LayoutDashboard",
    },
    {
      labelKey: "nav.projects",
      path: ROUTES.DISCUSSION_COMMITTEE.PROJECTS,
      icon: "Briefcase",
    },
    {
      labelKey: "nav.finalEvaluation",
      path: ROUTES.DISCUSSION_COMMITTEE.EVALUATION,
      icon: "Award",
    },
  ],
  projects_committee: [
    {
      labelKey: "nav.dashboard",
      path: ROUTES.PROJECTS_COMMITTEE.DASHBOARD,
      icon: "LayoutDashboard",
    },
    {
      labelKey: "nav.periods",
      path: ROUTES.PROJECTS_COMMITTEE.PERIODS,
      icon: "Calendar",
    },
    {
      labelKey: "nav.proposals",
      path: ROUTES.PROJECTS_COMMITTEE.PROPOSALS,
      icon: "FileText",
    },
    {
      labelKey: "nav.announceProjects",
      path: ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS,
      icon: "Megaphone",
    },
    {
      labelKey: "nav.assignSupervisors",
      path: ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS,
      icon: "UserPlus",
    },
    {
      labelKey: "nav.processRequests",
      path: ROUTES.PROJECTS_COMMITTEE.REQUESTS,
      icon: "FileCheck",
    },
    {
      labelKey: "nav.distributeCommittees",
      path: ROUTES.PROJECTS_COMMITTEE.DISTRIBUTE_COMMITTEES,
      icon: "Users",
    },
    {
      labelKey: "nav.reports",
      path: ROUTES.PROJECTS_COMMITTEE.REPORTS,
      icon: "FileBarChart",
    },
  ],
  admin: [
    {
      labelKey: "nav.dashboard",
      path: ROUTES.ADMIN.DASHBOARD,
      icon: "LayoutDashboard",
    },
    { labelKey: "nav.users", path: ROUTES.ADMIN.USERS, icon: "Users" },
    {
      labelKey: "nav.reports",
      path: ROUTES.ADMIN.REPORTS,
      icon: "FileBarChart",
    },
  ],
};
