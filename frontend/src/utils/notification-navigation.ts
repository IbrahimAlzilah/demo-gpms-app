import { ROUTES } from "@/lib/constants/constants";
import type { NotificationDto } from "@/types/notification.types";

export interface NotificationNavigationResult {
  path: string;
  label: string;
}

/**
 * Determine navigation target based on notification type and related entity
 */
export function getNotificationTarget(
  notification: NotificationDto,
  userRole: string,
): NotificationNavigationResult {
  const { type, relatedEntityId } = notification;

  // Handle deadline notifications
  if (type?.startsWith("deadline_")) {
    if (type.includes("proposal_submission")) {
      return {
        path: getProposalsRoute(userRole),
        label: "عرض المقترحات",
      };
    }
    if (type.includes("project_registration")) {
      return {
        path: getProjectsRoute(userRole),
        label: "عرض المشاريع",
      };
    }
    if (
      type.includes("document_submission") ||
      type.includes("chapter_submission") ||
      type.includes("final_project_document_submission")
    ) {
      if (userRole === "student")
        return { path: ROUTES.STUDENT.DOCUMENTS, label: "عرض الوثائق" };
      // Add other roles if they have document review pages, otherwise dashboard
      return { path: getDashboardRoute(userRole), label: "عرض التفاصيل" };
    }
    if (type.includes("final_defense")) {
      if (userRole === "student")
        return { path: ROUTES.STUDENT.PROJECTS, label: "عرض المشروع" };
      if (userRole === "discussion_committee")
        return {
          path: ROUTES.DISCUSSION_COMMITTEE.PROJECTS,
          label: "عرض المشاريع",
        };
      return { path: getDashboardRoute(userRole), label: "عرض التفاصيل" };
    }
  }

  // Handle proposal-related notifications
  if (
    type === "proposal_approved" ||
    type === "proposal_rejected" ||
    type === "proposal_modification_required" ||
    type === "proposal_submitted"
  ) {
    const baseRoute = getProposalsRoute(userRole);
    // Navigate to specific proposal if relatedEntityId is provided
    if (relatedEntityId) {
      // For students, navigate to the detailed view page
      if (userRole === "student") {
        return {
          path: `${ROUTES.STUDENT.PROPOSALS}/${relatedEntityId}`,
          label: "عرض المقترح",
        };
      }
      // For other roles, navigate to the proposals list (they use modals)
      return {
        path: baseRoute,
        label: "عرض المقترح",
      };
    }
    return {
      path: baseRoute,
      label: "عرض المقترحات",
    };
  }

  // Handle request-related notifications
  if (
    type === "request_approved" ||
    type === "request_rejected" ||
    type === "request_submitted"
  ) {
    const requestRoute = getRequestsRoute(userRole);
    return {
      path: requestRoute,
      label: relatedEntityId ? "عرض الطلب" : "عرض الطلبات",
    };
  }

  // Handle project/registration notifications
  if (
    type === "registration_approved" ||
    type === "registration_rejected" ||
    type === "registration_submitted"
  ) {
    if (userRole === "projects_committee") {
      return {
        path: ROUTES.PROJECTS_COMMITTEE.REGISTRATIONS,
        label: "إدارة التسجيلات",
      };
    }
    return {
      path: getProjectsRoute(userRole),
      label: "عرض المشروع",
    };
  }

  // Handle document-related notifications
  if (
    type === "document_uploaded" ||
    type === "document_resubmitted" ||
    type === "document_approved" ||
    type === "document_rejected"
  ) {
    if (userRole === "student") {
      return {
        path: ROUTES.STUDENT.DOCUMENTS,
        label: "عرض الوثائق",
      };
    }
    if (userRole === "supervisor") {
      return {
        path: ROUTES.SUPERVISOR.PROJECTS,
        label: "عرض المشاريع",
      };
    }
    // Other roles navigate to projects
    return {
      path: getProjectsRoute(userRole),
      label: "عرض المشاريع",
    };
  }

  if (
    type === "projects_announced" ||
    type === "projects_unannounced" ||
    type === "announcement_created"
  ) {
    return {
      path: getProjectsRoute(userRole),
      label: "عرض المشاريع",
    };
  }

  // Handle grade notifications
  if (type === "grade_approved" || type === "grade_published") {
    if (userRole === "student") {
      return {
        path: ROUTES.STUDENT.GRADES,
        label: "عرض الدرجات",
      };
    }
    if (userRole === "projects_committee") {
      return {
        path: ROUTES.PROJECTS_COMMITTEE.GRADES,
        label: "عرض الدرجات",
      };
    }
  }

  // Handle supervisor assignment notifications
  if (
    type === "supervisor_assignment_request" ||
    type === "supervisor_assigned" ||
    type === "supervisor_assignment_cancelled"
  ) {
    if (userRole === "supervisor") {
      return {
        path: ROUTES.SUPERVISOR.SUPERVISION_REQUESTS,
        label: "عرض طلبات الإشراف",
      };
    }
    if (userRole === "projects_committee") {
      return {
        path: ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS,
        label: "إدارة المشرفين",
      };
    }
    return {
      path: getProjectsRoute(userRole),
      label: "عرض المشروع",
    };
  }

  // Handle group invitation notifications
  if (
    type === "group_invitation" ||
    type === "group_invitation_accepted" ||
    type === "group_invitation_rejected"
  ) {
    if (userRole === "student") {
      return {
        path: ROUTES.STUDENT.GROUPS,
        label: "عرض مجموعتي",
      };
    }
  }

  // Handle group join request notifications
  if (
    type === "group_join_request" ||
    type === "group_join_request_approved" ||
    type === "group_join_request_rejected"
  ) {
    if (userRole === "student") {
      return {
        path: ROUTES.STUDENT.GROUPS,
        label: "عرض مجموعتي",
      };
    }
  }

  // Handle period announcements
  if (type === "period_announcement") {
    return {
      path: getDashboardRoute(userRole),
      label: "عرض التفاصيل",
    };
  }

  // Default: navigate to dashboard
  const dashboardRoute = getDashboardRoute(userRole);
  return {
    path: dashboardRoute,
    label: "عرض التفاصيل",
  };
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case "student":
      return ROUTES.STUDENT.DASHBOARD;
    case "supervisor":
      return ROUTES.SUPERVISOR.DASHBOARD;
    case "projects_committee":
      return ROUTES.PROJECTS_COMMITTEE.DASHBOARD;
    case "discussion_committee":
      return ROUTES.DISCUSSION_COMMITTEE.DASHBOARD;
    case "admin":
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
}

function getRequestsRoute(role: string): string {
  switch (role) {
    case "student":
      return ROUTES.STUDENT.REQUESTS;
    case "supervisor":
      return ROUTES.SUPERVISOR.SUPERVISION_REQUESTS;
    case "projects_committee":
      return ROUTES.PROJECTS_COMMITTEE.REQUESTS;
    default:
      return getDashboardRoute(role);
  }
}

function getProposalsRoute(role: string): string {
  switch (role) {
    case "student":
      return ROUTES.STUDENT.MY_PROPOSALS;
    case "supervisor":
      return ROUTES.SUPERVISOR.PROPOSALS;
    case "projects_committee":
      return ROUTES.PROJECTS_COMMITTEE.PROPOSALS;
    default:
      return getDashboardRoute(role);
  }
}

function getProjectsRoute(role: string): string {
  switch (role) {
    case "student":
      return ROUTES.STUDENT.PROJECTS;
    case "supervisor":
      return ROUTES.SUPERVISOR.PROJECTS;
    case "discussion_committee":
      return ROUTES.DISCUSSION_COMMITTEE.PROJECTS;
    case "projects_committee":
      // Projects Committee can view all projects
      return ROUTES.PROJECTS_COMMITTEE.PROJECTS;
    default:
      return getDashboardRoute(role);
  }
}

/**
 * Get notification icon type based on notification type
 */
export function getNotificationIconType(
  notification: NotificationDto,
): "success" | "info" | "warning" | "error" {
  const { type } = notification;

  if (!type) return "info";

  // Success types
  if (
    type.includes("approved") ||
    type.includes("accepted") ||
    type === "proposal_approved" ||
    type === "request_approved" ||
    type === "registration_approved" ||
    type === "grade_approved" ||
    type === "grade_published" ||
    type === "supervisor_assigned" ||
    type === "document_approved"
  ) {
    return "success";
  }

  // Error/rejection types
  if (
    type.includes("rejected") ||
    type === "proposal_rejected" ||
    type === "request_rejected" ||
    type === "registration_rejected" ||
    type === "document_rejected"
  ) {
    return "error";
  }

  // Warning types (deadlines, modifications, cancellations)
  if (
    type.includes("deadline") ||
    type.includes("modification") ||
    type.includes("requires") ||
    type.includes("cancelled")
  ) {
    return "warning";
  }

  // Default: info
  return "info";
}

/**
 * Format relative time in Arabic
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

  if (diffInSeconds < 60) {
    return "منذ لحظات";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour");
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, "day");
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return rtf.format(-diffInMonths, "month");
}
