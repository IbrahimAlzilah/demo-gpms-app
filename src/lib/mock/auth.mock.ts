import { v4 as uuidv4 } from "uuid";
import type {
  User,
  UserRole,
  AuthResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
} from "../../types/user.types";
import type { LoginCredentials } from "../../features/auth/types/auth.types";

// Mock users database
export const mockUsers: User[] = [
  {
    id: "1",
    email: "student@university.edu",
    name: "أحمد محمد",
    role: "student",
    status: "active",
    studentId: "2021001",
    department: "Computer Science",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "supervisor@university.edu",
    name: "د. خالد أحمد",
    role: "supervisor",
    status: "active",
    department: "Computer Science",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "committee@university.edu",
    name: "د. فاطمة علي",
    role: "projects_committee",
    status: "active",
    department: "Computer Science",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    email: "discussion@university.edu",
    name: "د. محمد حسن",
    role: "discussion_committee",
    status: "active",
    department: "Computer Science",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    email: "admin@university.edu",
    name: "مدير النظام",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  "student@university.edu": "student123",
  "supervisor@university.edu": "supervisor123",
  "committee@university.edu": "committee123",
  "discussion@university.edu": "discussion123",
  "admin@university.edu": "admin123",
};

// Mock tokens storage
const mockTokens: Record<string, string> = {};

// Get permissions based on role
function getPermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    student: [
      "view:own_projects",
      "submit:proposals",
      "submit:requests",
      "upload:documents",
    ],
    supervisor: [
      "view:assigned_projects",
      "evaluate:projects",
      "approve:supervision_requests",
      "manage:project_progress",
    ],
    discussion_committee: [
      "view:assigned_projects",
      "evaluate:final_discussion",
    ],
    projects_committee: [
      "manage:proposals",
      "manage:projects",
      "assign:supervisors",
      "process:requests",
      "distribute:committees",
      "generate:reports",
      "announce:periods",
    ],
    admin: ["*"], // All permissions
  };
  return permissions[role] || [];
}

export const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.email === credentials.email);
    const password = mockPasswords[credentials.email];

    if (!user || password !== credentials.password) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("Account is not active");
    }

    const token = `mock_token_${uuidv4()}`;
    mockTokens[token] = user.id;

    return {
      token,
      user,
      permissions: getPermissions(user.role),
    };
  },

  recoverPassword: async (
    data: PasswordRecoveryRequest
  ): Promise<PasswordRecoveryResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.email === data.email);

    if (!user) {
      // Don't reveal if user exists for security
      return {
        message: "If the email exists, a password reset link has been sent.",
      };
    }

    const resetToken = `reset_token_${uuidv4()}`;
    mockTokens[resetToken] = user.id;

    // In real app, send email with reset link
    console.log(`Password reset token for ${data.email}: ${resetToken}`);

    return {
      message: "Password reset link has been sent to your email.",
      resetToken,
    };
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userId = mockTokens[token.replace("reset_token_", "")];

    if (!userId) {
      throw new Error("Invalid or expired reset token");
    }

    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      mockPasswords[user.email] = newPassword;
      delete mockTokens[token];
    }
  },

  getCurrentUser: (token: string): User | null => {
    const userId = mockTokens[token.replace("mock_token_", "")];
    if (!userId) return null;
    return mockUsers.find((u) => u.id === userId) || null;
  },
};
