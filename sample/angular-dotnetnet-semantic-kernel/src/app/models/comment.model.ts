import { User } from './user.model';

export interface Comment {
  id: number;
  text: string;
  author: User;
  creationDate: Date;
  score?: number;
}
