export type UserRole = "student" | "mentor";

export interface Profile {
  id: string;
  name: string | null;
  country: string | null;
  bio: string | null;
  profile_image_url: string | null;
  role: UserRole;
  is_admin: boolean;
  is_active: boolean;
  deactivated_reason: string | null;
  created_at: string;
}


