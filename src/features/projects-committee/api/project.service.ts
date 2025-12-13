import {
  mockProjectService,
  mockProjects,
} from "../../../lib/mock/project.mock";
import type { Project } from "../../../types/project.types";

export const committeeProjectService = {
  getAll: async (): Promise<Project[]> => {
    return mockProjectService.getAll();
  },

  getApproved: async (): Promise<Project[]> => {
    const all = await mockProjectService.getAll();
    return all.filter((p) => p.status === "approved");
  },

  getById: async (id: string): Promise<Project | null> => {
    return mockProjectService.getById(id);
  },

  announce: async (projectIds: string[]): Promise<Project[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const announced: Project[] = [];
    projectIds.forEach((id) => {
      const project = mockProjects.find((p) => p.id === id);
      if (project && project.status === "approved") {
        project.status = "available_for_registration";
        project.updatedAt = new Date().toISOString();
        announced.push({ ...project });
      }
    });
    return announced;
  },
};
