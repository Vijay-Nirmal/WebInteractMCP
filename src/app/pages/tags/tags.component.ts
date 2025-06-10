import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Tag } from '../../models/tag.model';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="tags-page">
      <div class="tags-header">
        <h1>Tags</h1>
        <p class="tags-description">
          A tag is a keyword or label that categorizes your question with other, similar questions. 
          Using the right tags makes it easier for others to find and answer your question.
        </p>
      </div>
      
      <div class="tags-filters">
        <div class="filter-input">
          <input 
            type="search" 
            placeholder="Filter by tag name"
            class="search-input">
        </div>
        <div class="filter-tabs">
          <button class="filter-tab active">Popular</button>
          <button class="filter-tab">Name</button>
          <button class="filter-tab">New</button>
        </div>
      </div>
      
      <div class="tags-grid">
        <div class="tag-card" *ngFor="let tag of tags">
          <div class="tag-info">
            <a [routerLink]="['/questions']" class="tag-name">{{ tag.name }}</a>
            <p class="tag-description">{{ tag.description }}</p>
          </div>
          <div class="tag-stats">
            <div class="tag-count">{{ formatQuestionCount(tag.questionCount) }}</div>
            <div class="tag-count-label">questions</div>
          </div>
        </div>
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
  `,
  styles: [`
    .tags-page {
      padding: 24px;
    }
    
    .tags-header {
      margin-bottom: 24px;
    }
    
    .tags-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    
    .tags-description {
      font-size: 15px;
      color: var(--so-gray-text);
      line-height: 1.5;
      max-width: 600px;
    }
    
    .tags-filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--so-gray-border);
    }
    
    .filter-input {
      flex: 1;
      max-width: 300px;
    }
    
    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }
    
    .search-input:focus {
      border-color: var(--so-blue);
      box-shadow: 0 0 0 3px rgba(10, 149, 255, 0.1);
    }
    
    .filter-tabs {
      display: flex;
      gap: 2px;
    }
    
    .filter-tab {
      background: none;
      border: 1px solid var(--so-gray-border);
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      color: var(--so-gray-text);
      transition: all 0.2s ease;
    }
    
    .filter-tab:first-child {
      border-radius: 4px 0 0 4px;
    }
    
    .filter-tab:last-child {
      border-radius: 0 4px 4px 0;
    }
    
    .filter-tab:hover {
      background-color: var(--so-gray-bg-light);
    }
    
    .filter-tab.active {
      background-color: var(--so-orange);
      color: white;
      border-color: var(--so-orange);
    }
    
    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .tag-card {
      background-color: var(--so-white);
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      padding: 12px;
      transition: border-color 0.2s ease;
    }
    
    .tag-card:hover {
      border-color: var(--so-gray-text);
    }
    
    .tag-info {
      margin-bottom: 8px;
    }
    
    .tag-name {
      display: inline-block;
      background-color: #E1ECF4;
      color: #39739D;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }
    
    .tag-name:hover {
      background-color: #D0E3F1;
      color: #2C5877;
      text-decoration: none;
    }
    
    .tag-description {
      font-size: 12px;
      color: var(--so-gray-text);
      line-height: 1.4;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .tag-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 12px;
    }
    
    .tag-count {
      font-weight: bold;
      color: var(--so-black);
    }
    
    .tag-count-label {
      color: var(--so-gray-text);
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 24px;
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
      .tags-page {
        padding: 16px;
      }
      
      .tags-filters {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .filter-input {
        max-width: none;
        width: 100%;
      }
      
      .tags-grid {
        grid-template-columns: 1fr;
      }
      
      .pagination {
        flex-wrap: wrap;
        padding: 16px;
      }
    }
  `]
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.mockDataService.getTags().subscribe(tags => {
      this.tags = tags;
    });
  }

  formatQuestionCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'm';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'k';
    }
    return count.toString();
  }
}
