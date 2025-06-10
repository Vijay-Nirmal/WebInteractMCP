import { User } from './user.model';
import { Comment } from './comment.model';

export interface Answer {
  id: number;
  body: string;
  author: User;
  creationDate: Date;
  score: number;
  isAccepted: boolean;
  comments: Comment[];
}
