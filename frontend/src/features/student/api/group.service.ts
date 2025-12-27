import { v4 as uuidv4 } from "uuid";
import type {
  ProjectGroup,
  GroupInvitation,
} from "../../../types/project.types";
import type { User } from "../../../types/user.types";

// Mock groups database
const mockGroups: ProjectGroup[] = [];

// Mock group invitations database
const mockGroupInvitations: GroupInvitation[] = [];

export const groupService = {
  getByProjectId: async (projectId: string): Promise<ProjectGroup | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockGroups.find((g) => g.projectId === projectId) || null;
  },

  getByStudentId: async (studentId: string): Promise<ProjectGroup | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return (
      mockGroups.find((g) => g.members.some((m) => m.id === studentId)) || null
    );
  },

  create: async (
    projectId: string,
    leaderId: string,
    members: User[]
  ): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const group: ProjectGroup = {
      id: uuidv4(),
      projectId,
      leaderId,
      members,
      maxMembers: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGroups.push(group);
    return group;
  },

  addMember: async (groupId: string, member: User): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error("Group not found");
    if (group.members.length >= group.maxMembers) {
      throw new Error("Group is full");
    }
    if (group.members.some((m) => m.id === member.id)) {
      throw new Error("Member already in group");
    }
    group.members.push(member);
    group.updatedAt = new Date().toISOString();
    return group;
  },

  removeMember: async (
    groupId: string,
    memberId: string
  ): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error("المجموعة غير موجودة");

    // Check if removing would leave group empty
    if (group.members.length <= 1) {
      throw new Error("يجب أن يبقى عضو واحد على الأقل في المجموعة");
    }

    if (group.leaderId === memberId && group.members.length > 1) {
      throw new Error("لا يمكن إزالة قائد المجموعة");
    }

    group.members = group.members.filter((m) => m.id !== memberId);
    group.updatedAt = new Date().toISOString();
    return group;
  },

  updateLeader: async (
    groupId: string,
    newLeaderId: string
  ): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error("Group not found");
    if (!group.members.some((m) => m.id === newLeaderId)) {
      throw new Error("New leader must be a group member");
    }
    group.leaderId = newLeaderId;
    group.updatedAt = new Date().toISOString();
    return group;
  },

  // Group invitation methods
  inviteMember: async (
    groupId: string,
    inviterId: string,
    inviteeId: string,
    message?: string
  ): Promise<GroupInvitation> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error("المجموعة غير موجودة");

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      throw new Error("المجموعة مكتملة");
    }

    // Check if invitee is already in group
    if (group.members.some((m) => m.id === inviteeId)) {
      throw new Error("الطالب عضو بالفعل في هذه المجموعة");
    }

    // Check if there's already a pending invitation
    const existingInvitation = mockGroupInvitations.find(
      (inv) =>
        inv.groupId === groupId &&
        inv.inviteeId === inviteeId &&
        inv.status === "pending"
    );
    if (existingInvitation) {
      throw new Error("تم إرسال دعوة بالفعل لهذا الطالب");
    }

    const invitation: GroupInvitation = {
      id: uuidv4(),
      groupId,
      inviterId,
      inviteeId,
      status: "pending",
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockGroupInvitations.push(invitation);
    return invitation;
  },

  getInvitations: async (studentId: string): Promise<GroupInvitation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockGroupInvitations.filter(
      (inv) => inv.inviteeId === studentId && inv.status === "pending"
    );
  },

  acceptInvitation: async (
    invitationId: string,
    studentId: string
  ): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const invitation = mockGroupInvitations.find(
      (inv) => inv.id === invitationId
    );
    if (!invitation) throw new Error("الدعوة غير موجودة");
    if (invitation.inviteeId !== studentId)
      throw new Error("غير مصرح لك بقبول هذه الدعوة");
    if (invitation.status !== "pending") throw new Error("الدعوة لم تعد صالحة");

    const group = mockGroups.find((g) => g.id === invitation.groupId);
    if (!group) throw new Error("المجموعة غير موجودة");
    if (group.members.length >= group.maxMembers) {
      throw new Error("المجموعة مكتملة");
    }

    // Add student to group (in real app, fetch user data)
    const newMember: User = {
      id: studentId,
      name: "طالب",
      email: "student@example.com",
      role: "student",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (group.members.some((m) => m.id === studentId)) {
      throw new Error("أنت عضو بالفعل في هذه المجموعة");
    }

    group.members.push(newMember);
    group.updatedAt = new Date().toISOString();
    invitation.status = "accepted";
    invitation.updatedAt = new Date().toISOString();

    return group;
  },

  rejectInvitation: async (
    invitationId: string,
    studentId: string
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const invitation = mockGroupInvitations.find(
      (inv) => inv.id === invitationId
    );
    if (!invitation) throw new Error("الدعوة غير موجودة");
    if (invitation.inviteeId !== studentId)
      throw new Error("غير مصرح لك برفض هذه الدعوة");
    if (invitation.status !== "pending") throw new Error("الدعوة لم تعد صالحة");

    invitation.status = "rejected";
    invitation.updatedAt = new Date().toISOString();
  },

  joinGroup: async (
    groupId: string,
    studentId: string
  ): Promise<ProjectGroup> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error("المجموعة غير موجودة");

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      throw new Error("المجموعة مكتملة");
    }

    // Check if student is already in group
    if (group.members.some((m) => m.id === studentId)) {
      throw new Error("أنت عضو بالفعل في هذه المجموعة");
    }

    // Check if student is already in another group for the same project
    const existingGroup = mockGroups.find(
      (g) =>
        g.projectId === group.projectId &&
        g.members.some((m) => m.id === studentId)
    );
    if (existingGroup) {
      throw new Error("أنت عضو بالفعل في مجموعة أخرى لنفس المشروع");
    }

    const newMember: User = {
      id: studentId,
      name: "طالب",
      email: "student@example.com",
      role: "student",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    group.members.push(newMember);
    group.updatedAt = new Date().toISOString();
    return group;
  },
};
