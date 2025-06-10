import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Question } from '../../models/question.model';
import { QuestionSummaryComponent } from '../../components/question-summary/question-summary.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, QuestionSummaryComponent],
  template: `
    <div class="questions-page">
      <div class="questions-header">
        <div class="questions-title">
          <h1>Top Questions</h1>
          <a routerLink="/ask" class="btn btn-primary">Ask Question</a>
        </div>
        
        <div class="questions-tabs">
          <button class="tab-btn active">Interesting</button>
          <button class="tab-btn">Bountied</button>
          <button class="tab-btn">Hot</button>
          <button class="tab-btn">Week</button>
          <button class="tab-btn">Month</button>
        </div>
      </div>
      
      <div class="questions-content">
        <div class="questions-count">
          {{ questions.length }} questions
        </div>
        
        <div class="questions-list">
          <app-question-summary 
            *ngFor="let question of questions" 
            [question]="question">
          </app-question-summary>
        </div>
        
        <div class="pagination">
          <button class="page-btn" disabled>Previous</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span class="page-dots">...</span>
          <button class="page-btn">15</button>
          <button class="page-btn">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .questions-page {
      padding: 24px;
    }
    
    .questions-header {
      margin-bottom: 24px;
    }
    
    .questions-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .questions-title h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 400;
    }
    
    .questions-tabs {
      display: flex;
      gap: 2px;
      border-bottom: 1px solid var(--so-gray-border);
    }
    
    .tab-btn {
      background: none;
      border: none;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      border-radius: 4px 4px 0 0;
      color: var(--so-gray-text);
      transition: all 0.2s ease;
    }
    
    .tab-btn:hover {
      background-color: var(--so-gray-bg-light);
    }
    
    .tab-btn.active {
      background-color: var(--so-orange);
      color: white;
    }
    
    .questions-content {
      background-color: var(--so-white);
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
    }
    
    .questions-count {
      padding: 16px 24px;
      border-bottom: 1px solid var(--so-gray-border);
      font-size: 14px;
      color: var(--so-gray-text);
    }
    
    .questions-list {
      padding: 0 24px;
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 24px;
      border-top: 1px solid var(--so-gray-border);
    }
    
    .page-btn {
      background: none;
      border: 1px solid var(--so-gray-border);
      padding: 6px 12px;
      font-size: 13px;
      cursor: pointer;
      border-radius: 3px;
      color: var(--so-gray-text);
      transition: all 0.2s ease;
    }
    
    .page-btn:hover:not(:disabled) {
      background-color: var(--so-gray-bg-light);
    }
    
    .page-btn.active {
      background-color: var(--so-orange);
      color: white;
      border-color: var(--so-orange);
    }
    
    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .page-dots {
      color: var(--so-gray-text);
      font-size: 13px;
    }
    
    @media (max-width: 768px) {
      .questions-page {
        padding: 16px;
      }
      
      .questions-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .questions-tabs {
        overflow-x: auto;
        white-space: nowrap;
      }
      
      .questions-list {
        padding: 0 16px;
      }
      
      .questions-count {
        padding: 16px;
      }
      
      .pagination {
        padding: 16px;
        flex-wrap: wrap;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  questions: Question[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.mockDataService.getQuestions().subscribe(questions => {
      this.questions = questions;
    });
  }
}
