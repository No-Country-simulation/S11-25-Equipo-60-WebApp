import { IPermission, IRole, IUser, ICategory, IStatus, ITab } from "@/interfaces/AppInterfaces";

export const MOCK_PERMISSIONS: IPermission[] = [
  {
    id: "1",
    name: "Create",
    description: "Permission to create content",
    icon: "➕",
    color: "#10b981",
  },
  {
    id: "2",
    name: "Read",
    description: "Permission to read content",
    icon: "📖",
    color: "#3b82f6",
  },
  {
    id: "3",
    name: "Update",
    description: "Permission to update content",
    icon: "🔄",
    color: "#f59e0b",
  },
  {
    id: "4",
    name: "Delete",
    description: "Permission to delete content",
    icon: "🗑️",
    color: "#ef4444",
  },
  {
    id: "5",
    name: "Publish",
    description: "Permission to publish content",
    icon: "📤",
    color: "#8b5cf6",
  },
  {
    id: "6",
    name: "Unpublish",
    description: "Permission to unpublish content",
    icon: "📥",
    color: "#6b7280",
  },
  {
    id: "7",
    name: "Manage Users",
    description: "Permission to manage users",
    icon: "👥",
    color: "#06b6d4",
  },
  {    id: "8",
    name: "Manage Settings",
    description: "Permission to manage application settings",
    icon: "⚙️",
    color: "#64748b",
  },
  {
    id: "9",
    name: "Manage Permissions",
    description: "Permission to manage application permissions",
    icon: "🔐",
    color: "#dc2626",
  },
  {
    id: "10",
    name: "Manage Roles",
    description: "Permission to manage application roles",
    icon: "🎭",
    color: "#ec4899",
  }
];

export const MOCK_ROLES: IRole[] = [
  {
    id: "1",
    name: "Admin",  
    description: "Administrator with full access",
    icon: "👑",
    color: "#7c3aed",
    permissions: [MOCK_PERMISSIONS[0], MOCK_PERMISSIONS[1], MOCK_PERMISSIONS[2], MOCK_PERMISSIONS[3], MOCK_PERMISSIONS[4], MOCK_PERMISSIONS[5], MOCK_PERMISSIONS[6], MOCK_PERMISSIONS[7], MOCK_PERMISSIONS[8], MOCK_PERMISSIONS[9], MOCK_PERMISSIONS[10]]
  },
  {
    id: "2",
    name: "Moderator",
    description: "Moderator with content management access",
    icon: "🛡️",
    color: "#0891b2",
    permissions: [MOCK_PERMISSIONS[1], MOCK_PERMISSIONS[2], MOCK_PERMISSIONS[3], MOCK_PERMISSIONS[4], MOCK_PERMISSIONS[5]]
  },
  {
    id: "3",
    name: "Editor",
    description: "Editor with limited access",
    icon: "✏️",
    color: "#059669",
    permissions: [MOCK_PERMISSIONS[0], MOCK_PERMISSIONS[1], MOCK_PERMISSIONS[2], MOCK_PERMISSIONS[3], MOCK_PERMISSIONS[4], MOCK_PERMISSIONS[5]]
  },          
  {
    id: "4",
    name: "Viewer",
    description: "Viewer with read-only access",
    icon: "👁️",
    color: "#6366f1",
    permissions: [MOCK_PERMISSIONS[1]]
  },
  {
    id: "5",
    name: "Guest",
    description: "Guest with minimal access",
    icon: "🚶",
    color: "#9ca3af",
    permissions: []
  }
];


export const MOCK_USER:IUser[] = [
  {
    id: "1",
    email: "admin@testimonialcms.com",
    password: "admin123",
    name: "Admin User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: [MOCK_ROLES[0]]
  },
  {
    id: "2",
    email: "moderator@testimonialcms.com",
    password: "moderator123",
    name: "Moderator User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator",
    role: [MOCK_ROLES[1]]
  },
  {
    id: "3",
    email: "editor@testimonialcms.com",
    password: "editor123",
    name: "Editor User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor",
    role: [MOCK_ROLES[2]]
  },

  {
    id: "4",
    email: "viewer@testimonialcms.com",
    password: "viewer123",
    name: "Viewer User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viewer",
    role: [MOCK_ROLES[3]]

  },
{
    id: "5",
    email: "guest@testimonialcms.com",
    password: "guest123",
    name: "Guest User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    role: [MOCK_ROLES[4]]
  }
];

export const MOCK_CATEGORIES: ICategory[] = [
  {
    id: "1",
    name: "Product Review",
    description: "Reviews about products and services",
    icon: "🛍️",
    color: "#8b5cf6",
  },
  {
    id: "2",
    name: "Customer Service",
    description: "Feedback about customer service experience",
    icon: "💬",
    color: "#3b82f6",
  },
  {
    id: "3",
    name: "Delivery",
    description: "Comments about delivery and shipping",
    icon: "📦",
    color: "#f59e0b",
  },
  {
    id: "4",
    name: "Quality",
    description: "Feedback about product quality",
    icon: "⭐",
    color: "#eab308",
  },
  {
    id: "5",
    name: "Price",
    description: "Comments about pricing and value",
    icon: "💰",
    color: "#10b981",
  },
  {
    id: "6",
    name: "User Experience",
    description: "Feedback about website or app experience",
    icon: "🖥️",
    color: "#06b6d4",
  },
  {
    id: "7",
    name: "General Feedback",
    description: "General comments and suggestions",
    icon: "📝",
    color: "#6b7280",
  },
];

export const MOCK_STATUS: IStatus[] = [
  {
    id: "1",
    name: "Pending",
    description: "Testimonial waiting for review",
    icon: "⏳",
    color: "#f59e0b",
  },
  {
    id: "2",
    name: "Approved",
    description: "Testimonial has been approved",
    icon: "✅",
    color: "#10b981",
  },
  {
    id: "3",
    name: "Rejected",
    description: "Testimonial has been rejected",
    icon: "❌",
    color: "#ef4444",
  },
  {
    id: "4",
    name: "Published",
    description: "Testimonial is live on the website",
    icon: "🌐",
    color: "#3b82f6",
  },
  {
    id: "5",
    name: "Draft",
    description: "Testimonial is being edited",
    icon: "📄",
    color: "#6b7280",
  },
  {
    id: "6",
    name: "Archived",
    description: "Testimonial has been archived",
    icon: "🗄️",
    color: "#9ca3af",
  },
];

export const MOCK_TABS: ITab[] = [
  {
    id: "1",
    name: "All Testimonials",
    description: "View all testimonials",
    icon: "📋",
    color: "#6366f1",
  },
  {
    id: "2",
    name: "Pending Review",
    description: "Testimonials awaiting approval",
    icon: "🔍",
    color: "#f59e0b",
  },
  {
    id: "3",
    name: "Published",
    description: "Currently published testimonials",
    icon: "✨",
    color: "#10b981",
  },
  {
    id: "4",
    name: "Featured",
    description: "Featured testimonials on homepage",
    icon: "⭐",
    color: "#eab308",
  },
  {
    id: "5",
    name: "Recent",
    description: "Most recently added testimonials",
    icon: "🕐",
    color: "#3b82f6",
  },
  {
    id: "6",
    name: "Analytics",
    description: "Testimonial statistics and insights",
    icon: "📊",
    color: "#8b5cf6",
  },
];