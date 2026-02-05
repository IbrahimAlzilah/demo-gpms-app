import { apiClient } from "@/lib/axios";
import type { StudentGroup } from "@/types/project.types";
import type { User } from "@/types/user.types";

export const committeeGroupService = {
  getById: async (groupId: string): Promise<StudentGroup> => {
    const response = await apiClient.get<StudentGroup>(
      `/projects-committee/groups/${groupId}`,
    );
    return (response as any).data ?? response;
  },

  update: async (
    groupId: string,
    payload: { name?: string },
  ): Promise<StudentGroup> => {
    const response = await apiClient.put<StudentGroup>(
      `/projects-committee/groups/${groupId}`,
      payload,
    );
    return (response as any).data ?? response;
  },

  addMember: async (
    groupId: string,
    studentId: string,
  ): Promise<StudentGroup> => {
    const response = await apiClient.post<StudentGroup>(
      `/projects-committee/groups/${groupId}/members`,
      { student_id: studentId },
    );
    return (response as any).data ?? response;
  },

  removeMember: async (
    groupId: string,
    memberId: string,
  ): Promise<StudentGroup> => {
    const response = await apiClient.delete<StudentGroup>(
      `/projects-committee/groups/${groupId}/members/${memberId}`,
    );
    return (response as any).data ?? response;
  },

  getEligibleStudents: async (search?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const response = await apiClient.get<User[] | { data: User[] }>(
      `/projects-committee/groups/eligible-students?${params.toString()}`,
    );
    const data = (response as any).data ?? response;
    return Array.isArray(data) ? data : [];
  },
};
