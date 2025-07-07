import { User } from './user.model';
import { Answer } from './answer.model';
import { Comment } from './comment.model';

export interface Question {
  id: number;
  title: string;
  body: string;
  author: User;
  creationDate: Date;
  modifiedDate?: Date;
  score: number;
  viewCount: number;
  tags: string[];
  answers: Answer[];
  comments: Comment[];
  bounty?: number;
}
