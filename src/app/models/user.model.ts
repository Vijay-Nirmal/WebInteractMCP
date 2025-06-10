export interface User {
  id: number;
  name: string;
  reputation: number;
  avatarUrl: string;
  tags: string[];
  joinDate?: Date;
  location?: string;
  aboutMe?: string;
}
