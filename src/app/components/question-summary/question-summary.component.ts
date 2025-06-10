import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';
import { TagBadgeComponent } from '../tag-badge/tag-badge.component';

@Component({
  selector: 'app-question-summary',
  standalone: true,
  imports: [CommonModule, RouterLink, TagBadgeComponent],
  template: `
    <div class="question-summary">
      <div class="question-stats">
        <div class="stat-item">
          <span class="stat-number">{{ question.score }}</span>
          <span class="stat-label">votes</span>
        </div>
        <div class="stat-item" [class.answered]="question.answers.length > 0">
          <span class="stat-number">{{ question.answers.length }}</span>
          <span class="stat-label">{{ question.answers.length === 1 ? 'answer' : 'answers' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ formatViewCount(question.viewCount) }}</span>
          <span class="stat-label">views</span>
        </div>
        <div *ngIf="question.bounty" class="bounty-amount">
          +{{ question.bounty }}
        </div>
      </div>
      
      <div class="question-content">
        <h3 class="question-title">
          <a [routerLink]="['/questions', question.id]">{{ question.title }}</a>
        </h3>
        
        <div class="question-excerpt">
          {{ getExcerpt(question.body) }}
        </div>
        
        <div class="question-footer">
          <div class="question-tags">
            <app-tag-badge 
              *ngFor="let tag of question.tags" 
              [tagName]="tag">
            </app-tag-badge>
          </div>
          
          <div class="question-user-info">
            <img 
              [src]="question.author.avatarUrl" 
              [alt]="question.author.name"
              class="user-avatar">
            <span class="user-name">{{ question.author.name }}</span>
            <span class="user-reputation">{{ formatReputation(question.author.reputation) }}</span>
            <span class="question-time">{{ getTimeAgo(question.creationDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .question-summary {
      display: flex;
      border-bottom: 1px solid var(--so-gray-border);
      padding: 16px 0;
    }
    
    .question-summary:last-child {
      border-bottom: none;
    }
    
    .question-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100px;
      text-align: right;
      font-size: 13px;
      color: var(--so-gray-text);
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .stat-item.answered {
      color: var(--so-green);
    }
    
    .stat-number {
      font-weight: bold;
      font-size: 14px;
    }
    
    .stat-label {
      font-size: 11px;
      text-transform: lowercase;
    }
    
    .bounty-amount {
      background-color: var(--so-blue);
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      margin-top: 4px;
    }
    
    .question-content {
      flex: 1;
      min-width: 0;
    }
    
    .question-title {
      font-size: 17px;
      line-height: 1.3;
      margin-bottom: 8px;
      font-weight: 400;
    }
    
    .question-title a {
      color: var(--so-blue);
      text-decoration: none;
    }
    
    .question-title a:hover {
      color: var(--so-blue);
      text-decoration: underline;
    }
    
    .question-excerpt {
      font-size: 14px;
      color: var(--so-black);
      margin-bottom: 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .question-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    
    .question-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      flex: 1;
    }
    
    .question-user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--so-gray-text);
      flex-shrink: 0;
      margin-left: 8px;
    }
    
    .user-avatar {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }
    
    .user-name {
      color: var(--so-blue);
      text-decoration: none;
    }
    
    .user-reputation {
      font-weight: bold;
      color: var(--so-black);
    }
    
    .question-time {
      color: var(--so-gray-text);
    }
    
    @media (max-width: 768px) {
      .question-summary {
        flex-direction: column;
      }
      
      .question-stats {
        flex-direction: row;
        width: auto;
        text-align: left;
        justify-content: space-between;
        margin-bottom: 12px;
        margin-right: 0;
      }
      
      .stat-item {
        align-items: center;
      }
      
      .question-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .question-user-info {
        margin-left: 0;
      }
    }
  `]
})
export class QuestionSummaryComponent {
  @Input() question!: Question;

  getExcerpt(body: string): string {
    const maxLength = 200;
    const stripped = body.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
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
