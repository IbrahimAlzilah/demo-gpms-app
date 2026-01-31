import type { Proposal } from "@/types/project.types";
import type {
  Submission,
  StudentGroupSubmission,
  SupervisorSubmission,
  CommitteeSubmission,
} from "../types/GroupedSubmissions.types";

/**
 * Group proposals by their origin (student groups or supervisors)
 *
 * Groups proposals as follows:
 * - Student groups: All proposals with the same studentGroupId are grouped together
 * - Supervisors: All proposals submitted by the same supervisor (submitterId where role is 'supervisor') are grouped together
 * - Individual: Proposals without a studentGroupId and not from supervisors are treated as individual submissions
 *
 * Note: Grouping is based on studentGroupId/submitterId, not on loaded relationships,
 * to ensure all proposals are correctly grouped even if relationships aren't loaded.
 */
export function groupProposals(proposals: Proposal[]): Submission[] {
  const grouped: Map<string, Proposal[]> = new Map();
  const submissionMetadata: Map<
    string,
    { origin: "student_group" | "supervisor"; data: any }
  > = new Map();

  // Group proposals
  for (const proposal of proposals) {
    let groupKey: string;
    let origin: "student_group" | "supervisor";

    // Determine grouping key based on origin
    // Priority: 1) Student groups (by studentGroupId), 2) Supervisors (by submitterId), 3) Individual
    if (proposal.studentGroupId) {
      // Student group submission - group by studentGroupId
      groupKey = `group_${proposal.studentGroupId}`;
      origin = "student_group";

      if (!submissionMetadata.has(groupKey)) {
        submissionMetadata.set(groupKey, {
          origin: "student_group",
          data: {
            studentGroupId: proposal.studentGroupId,
            studentGroup: proposal.studentGroup || null, // May not be loaded
            submitter: proposal.submitter || null,
          },
        });
      }
    } else if (proposal.submitter?.role === "supervisor") {
      // Supervisor submission - group by submitterId
      groupKey = `supervisor_${proposal.submitterId}`;
      origin = "supervisor";

      if (!submissionMetadata.has(groupKey)) {
        submissionMetadata.set(groupKey, {
          origin: "supervisor",
          data: {
            supervisorId: proposal.submitterId,
            supervisor: proposal.submitter,
          },
        });
      }
    } else {
      // Individual student proposal (no group) - treat as separate submission
      groupKey = `individual_${proposal.id}`;
      origin = "student_group"; // Treat as student submission

      if (!submissionMetadata.has(groupKey)) {
        submissionMetadata.set(groupKey, {
          origin: "student_group",
          data: {
            studentGroupId: null,
            studentGroup: null,
            submitter: proposal.submitter || null,
          },
        });
      }
    }

    // Add proposal to group
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey)!.push(proposal);
  }

  // Convert to submission objects
  const submissions: Submission[] = [];

  for (const [groupKey, groupProposals] of grouped.entries()) {
    const metadata = submissionMetadata.get(groupKey)!;
    const { origin, data } = metadata;

    // Merge metadata from all proposals in the group
    // This ensures we get the best available data (e.g., if one proposal has studentGroup loaded)
    let mergedData = { ...data };

    if (origin === "student_group" && data.studentGroupId) {
      // Try to find a proposal with studentGroup loaded
      const proposalWithGroup = groupProposals.find((p) => p.studentGroup);
      if (proposalWithGroup?.studentGroup) {
        mergedData.studentGroup = proposalWithGroup.studentGroup;
      }

      // Try to find a proposal with submitter loaded
      const proposalWithSubmitter = groupProposals.find((p) => p.submitter);
      if (proposalWithSubmitter?.submitter) {
        mergedData.submitter = proposalWithSubmitter.submitter;
      }
    } else if (origin === "supervisor") {
      // Try to find a proposal with supervisor loaded
      const proposalWithSupervisor = groupProposals.find(
        (p) => p.submitter?.role === "supervisor",
      );
      if (proposalWithSupervisor?.submitter) {
        mergedData.supervisor = proposalWithSupervisor.submitter;
      }
    }

    // Calculate submission status
    const statuses = groupProposals.map((p) => p.status);
    const uniqueStatuses = new Set(statuses);
    let status: Submission["status"];

    if (uniqueStatuses.size === 1) {
      status = statuses[0] as Submission["status"];
    } else {
      status = "mixed";
    }

    // Find earliest submission date
    const sortedDates = groupProposals
      .map((p) => new Date(p.createdAt).getTime())
      .sort((a, b) => a - b);
    const submittedAt = new Date(sortedDates[0]).toISOString();

    if (origin === "student_group") {
      const submission: StudentGroupSubmission = {
        id: groupKey,
        origin: "student_group",
        studentGroupId: mergedData.studentGroupId || "",
        studentGroup: mergedData.studentGroup || null,
        submitter: mergedData.submitter || null,
        proposals: groupProposals.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
        submittedAt,
        status,
        totalProposals: groupProposals.length,
      };
      submissions.push(submission);
    } else if (origin === "supervisor") {
      const submission: SupervisorSubmission = {
        id: groupKey,
        origin: "supervisor",
        supervisorId: mergedData.supervisorId,
        supervisor: mergedData.supervisor || null,
        proposals: groupProposals.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
        submittedAt,
        status,
        totalProposals: groupProposals.length,
      };
      submissions.push(submission);
    }
  }

  // Sort submissions by submission date (newest first)
  return submissions.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

type TFunction = (key: string, options?: Record<string, unknown>) => string;

/**
 * Get display name for a submission (uses i18n when t is provided)
 */
export function getSubmissionDisplayName(
  submission: Submission,
  t?: TFunction,
): string {
  if (submission.origin === "student_group") {
    if (submission.studentGroup?.name) {
      return submission.studentGroup.name;
    }
    if (submission.studentGroup?.groupCode) {
      return submission.studentGroup.groupCode;
    }
    if (submission.submitter?.name && t) {
      return t("committee.proposal.studentSubmission", {
        name: submission.submitter.name,
      });
    }
    if (submission.submitter?.name) {
      return `${submission.submitter.name}'s Submission`;
    }
    return t
      ? t("committee.proposal.studentGroupSubmission")
      : "Student Group Submission";
  }
  if (submission.origin === "committee") {
    const committeeSubmission = submission as CommitteeSubmission;
    if (committeeSubmission.submitter?.name && t) {
      return t("committee.proposal.committeeProposals", {
        name: committeeSubmission.submitter.name,
        defaultValue: `Committee (${committeeSubmission.submitter.name})`,
      });
    }
    return t
      ? t("committee.proposal.committeeSubmission")
      : "Committee Submission";
  }
  if (submission.origin === "supervisor") {
    if (submission.supervisor?.name && t) {
      return t("committee.proposal.supervisorProposals", {
        name: submission.supervisor.name,
      });
    }
    if (submission.supervisor?.name) {
      return `${submission.supervisor.name}'s Proposals`;
    }
    return t
      ? t("committee.proposal.supervisorSubmission")
      : "Supervisor Submission";
  }
  return t ? t("committee.proposal.submission") : "Submission";
}

/**
 * Get submission description (uses i18n when t is provided)
 */
export function getSubmissionDescription(
  submission: Submission,
  t?: TFunction,
): string {
  const count = submission.totalProposals;
  const proposalPart = t
    ? count === 1
      ? t("common.oneProposal")
      : t("committee.proposal.submissionDescriptionProposals", { count })
    : `${count} proposal${count !== 1 ? "s" : ""}`;

  if (submission.origin === "committee") {
    return proposalPart;
  }
  if (submission.origin === "student_group") {
    if (submission.studentGroup && t) {
      const memberCount =
        submission.studentGroup.memberCount ||
        submission.studentGroup.members?.length ||
        0;
      const memberPart =
        memberCount === 1
          ? t("common.oneMember")
          : `${memberCount} ${t("common.members")}`;
      return `${memberPart} • ${count === 1 ? t("common.oneProposal") : `${count} ${t("common.proposals")}`}`;
    }
    if (submission.studentGroup) {
      const memberCount =
        submission.studentGroup.memberCount ||
        submission.studentGroup.members?.length ||
        0;
      return `${memberCount} member${memberCount !== 1 ? "s" : ""} • ${count} proposal${count !== 1 ? "s" : ""}`;
    }
    return proposalPart;
  }
  return proposalPart;
}
