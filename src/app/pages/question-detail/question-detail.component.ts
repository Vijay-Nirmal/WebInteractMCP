import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { Question } from '../../models/question.model';
import { Answer } from '../../models/answer.model';
import { TagBadgeComponent } from '../../components/tag-badge/tag-badge.component';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, TagBadgeComponent],
  template: `
    <div class="question-detail" *ngIf="question">
      <div class="question-header">
        <h1 class="question-title">{{ question.title }}</h1>
        <div class="question-meta">
          <div class="meta-item">
            <span class="meta-label">Asked</span>
            <span class="meta-value">{{ formatDate(question.creationDate) }}</span>
          </div>
          <div class="meta-item" *ngIf="question.modifiedDate">
            <span class="meta-label">Modified</span>
            <span class="meta-value">{{ formatDate(question.modifiedDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Viewed</span>
            <span class="meta-value">{{ formatViewCount(question.viewCount) }} times</span>
          </div>
        </div>
      </div>
      
      <div class="question-content">
        <div class="question-post">
          <div class="vote-controls">
            <button class="vote-btn vote-up" aria-label="Vote up">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="currentColor" d="m2 26 14-14 14 14"/>
              </svg>
            </button>
            <div class="vote-score">{{ question.score }}</div>
            <button class="vote-btn vote-down" aria-label="Vote down">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="currentColor" d="m2 10 14 14 14-14"/>
              </svg>
            </button>
            <button class="bookmark-btn" aria-label="Bookmark">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v11.5l4-2.7 4 2.7V4a2 2 0 0 0-2-2H6z"/>
              </svg>
            </button>
          </div>
          
          <div class="post-content">
            <div class="post-body" [innerHTML]="formatPostBody(question.body)"></div>
            
            <div class="post-tags">
              <app-tag-badge 
                *ngFor="let tag of question.tags" 
                [tagName]="tag">
              </app-tag-badge>
            </div>
            
            <div class="post-footer">
              <div class="post-actions">
                <button class="action-btn">Share</button>
                <button class="action-btn">Edit</button>
                <button class="action-btn">Follow</button>
              </div>
              
              <div class="post-user-card">
                <div class="user-action">asked {{ getTimeAgo(question.creationDate) }}</div>
                <div class="user-info">
                  <img 
                    [src]="question.author.avatarUrl" 
                    [alt]="question.author.name"
                    class="user-avatar">
                  <div class="user-details">
                    <div class="user-name">{{ question.author.name }}</div>
                    <div class="user-reputation">{{ formatReputation(question.author.reputation) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="comments-section" *ngIf="question.comments.length > 0">
              <div class="comment" *ngFor="let comment of question.comments">
                <div class="comment-content">
                  {{ comment.text }} – 
                  <a href="#" class="comment-author">{{ comment.author.name }}</a>
                  <span class="comment-date">{{ getTimeAgo(comment.creationDate) }}</span>
                </div>
              </div>
              <button class="add-comment-btn">Add a comment</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="answers-section" *ngIf="question.answers.length > 0">
        <h2 class="answers-header">{{ question.answers.length }} Answer<span *ngIf="question.answers.length !== 1">s</span></h2>
        
        <div class="answer" *ngFor="let answer of question.answers">
          <div class="vote-controls">
            <button class="vote-btn vote-up" aria-label="Vote up">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="currentColor" d="m2 26 14-14 14 14"/>
              </svg>
            </button>
            <div class="vote-score">{{ answer.score }}</div>
            <button class="vote-btn vote-down" aria-label="Vote down">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="currentColor" d="m2 10 14 14 14-14"/>
              </svg>
            </button>
            <div class="accepted-indicator" *ngIf="answer.isAccepted">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="#48A868" d="m6 14 8 8 16-16-2.5-2.5L14 17 8.5 11.5 6 14z"/>
              </svg>
            </div>
          </div>
          
          <div class="post-content">
            <div class="post-body" [innerHTML]="formatPostBody(answer.body)"></div>
            
            <div class="post-footer">
              <div class="post-actions">
                <button class="action-btn">Share</button>
                <button class="action-btn">Edit</button>
                <button class="action-btn">Follow</button>
              </div>
              
              <div class="post-user-card">
                <div class="user-action">answered {{ getTimeAgo(answer.creationDate) }}</div>
                <div class="user-info">
                  <img 
                    [src]="answer.author.avatarUrl" 
                    [alt]="answer.author.name"
                    class="user-avatar">
                  <div class="user-details">
                    <div class="user-name">{{ answer.author.name }}</div>
                    <div class="user-reputation">{{ formatReputation(answer.author.reputation) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="comments-section" *ngIf="answer.comments.length > 0">
              <div class="comment" *ngFor="let comment of answer.comments">
                <div class="comment-content">
                  {{ comment.text }} – 
                  <a href="#" class="comment-author">{{ comment.author.name }}</a>
                  <span class="comment-date">{{ getTimeAgo(comment.creationDate) }}</span>
                </div>
              </div>
              <button class="add-comment-btn">Add a comment</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="your-answer-section">
        <h2>Your Answer</h2>
        <textarea 
          class="answer-textarea" 
          placeholder="Enter your answer here..."
          rows="10">
        </textarea>
        <button class="btn btn-primary post-answer-btn">Post Your Answer</button>
      </div>
    </div>
    
    <div *ngIf="!question" class="not-found">
      <h1>Question not found</h1>
      <p>The question you're looking for doesn't exist.</p>
    </div>
  `,
  styles: [`
    .question-detail {
      padding: 24px;
      max-width: 1100px;
    }
    
    .question-header {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--so-gray-border);
    }
    
    .question-title {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .question-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--so-gray-text);
    }
    
    .meta-item {
      display: flex;
      gap: 4px;
    }
    
    .meta-label {
      font-weight: 500;
    }
    
    .question-content,
    .answers-section {
      margin-bottom: 32px;
    }
    
    .question-post,
    .answer {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--so-gray-border);
    }
    
    .vote-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 48px;
      flex-shrink: 0;
    }
    
    .vote-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      color: var(--so-gray-text);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .vote-btn:hover {
      background-color: var(--so-gray-bg-light);
      color: var(--so-orange);
    }
    
    .vote-score {
      font-size: 21px;
      font-weight: 500;
      color: var(--so-gray-text);
      text-align: center;
      min-width: 36px;
    }
    
    .bookmark-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      color: var(--so-gray-text);
      margin-top: 8px;
    }
    
    .bookmark-btn:hover {
      background-color: var(--so-gray-bg-light);
    }
    
    .accepted-indicator {
      color: var(--so-green);
    }
    
    .post-content {
      flex: 1;
      min-width: 0;
    }
    
    .post-body {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    
    .post-tags {
      margin-bottom: 16px;
    }
    
    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 16px;
    }
    
    .post-actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      background: none;
      border: none;
      color: var(--so-gray-text);
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
    }
    
    .action-btn:hover {
      color: var(--so-blue);
    }
    
    .post-user-card {
      background-color: #D9EAF7;
      padding: 8px;
      border-radius: 4px;
      min-width: 200px;
    }
    
    .user-action {
      font-size: 12px;
      color: var(--so-gray-text);
      margin-bottom: 4px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 3px;
    }
    
    .user-details {
      flex: 1;
    }
    
    .user-name {
      color: var(--so-blue);
      font-size: 13px;
      font-weight: 500;
    }
    
    .user-reputation {
      font-size: 12px;
      color: var(--so-gray-text);
    }
    
    .comments-section {
      border-top: 1px solid var(--so-gray-border);
      padding-top: 8px;
    }
    
    .comment {
      padding: 4px 0;
      font-size: 13px;
      color: var(--so-gray-text);
      line-height: 1.4;
    }
    
    .comment-author {
      color: var(--so-blue);
      text-decoration: none;
    }
    
    .comment-author:hover {
      text-decoration: underline;
    }
    
    .comment-date {
      color: var(--so-gray-text);
    }
    
    .add-comment-btn {
      background: none;
      border: none;
      color: var(--so-gray-text);
      font-size: 13px;
      cursor: pointer;
      padding: 4px 0;
      margin-top: 4px;
    }
    
    .add-comment-btn:hover {
      color: var(--so-blue);
    }
    
    .answers-header {
      font-size: 20px;
      font-weight: 400;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--so-gray-border);
    }
    
    .your-answer-section {
      margin-top: 32px;
    }
    
    .your-answer-section h2 {
      font-size: 20px;
      font-weight: 400;
      margin-bottom: 16px;
    }
    
    .answer-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 16px;
      resize: vertical;
    }
    
    .answer-textarea:focus {
      border-color: var(--so-blue);
      outline: none;
      box-shadow: 0 0 0 3px rgba(10, 149, 255, 0.1);
    }
    
    .post-answer-btn {
      font-size: 14px;
      padding: 10px 16px;
    }
    
    .not-found {
      padding: 48px 24px;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .question-detail {
        padding: 16px;
      }
      
      .question-meta {
        flex-direction: column;
        gap: 8px;
      }
      
      .question-post,
      .answer {
        flex-direction: column;
        gap: 16px;
      }
      
      .vote-controls {
        flex-direction: row;
        width: auto;
        justify-content: center;
      }
      
      .post-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .post-user-card {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class QuestionDetailComponent implements OnInit {
  question: Question | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockDataService: MockDataService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mockDataService.getQuestionById(+id).subscribe(question => {
        this.question = question;
      });
    }
  }

  formatPostBody(body: string): string {
    return body.replace(/\n/g, '<br>').replace(/\`\`\`([^`]+)\`\`\`/g, '<pre><code>$1</code></pre>').replace(/\`([^`]+)\`/g, '<code>$1</code>');
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatViewCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'm';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  formatReputation(reputation: number): string {
    if (reputation >= 1000000) {
      return (reputation / 1000000).toFixed(1) + 'm';
    }
    if (reputation >= 1000) {
      return (reputation / 1000).toFixed(1) + 'k';
    }
    return reputation.toString();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'just now';
    }
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    if (diffDays === 1) {
      return 'yesterday';
    }
    return `${diffDays} days ago`;
  }
}
