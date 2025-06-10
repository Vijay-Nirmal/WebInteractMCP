import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-page">
      <div class="users-header">
        <h1>Users</h1>
        <p class="users-description">
          Search and browse the community's top contributors.
        </p>
      </div>
      
      <div class="users-filters">
        <div class="filter-input">
          <input 
            type="search" 
            placeholder="Search users"
            class="search-input">
        </div>
        <div class="filter-tabs">
          <button class="filter-tab active">Reputation</button>
          <button class="filter-tab">New users</button>
          <button class="filter-tab">Voters</button>
          <button class="filter-tab">Editors</button>
          <button class="filter-tab">Moderators</button>
        </div>
      </div>
      
      <div class="users-grid">
        <div class="user-card" *ngFor="let user of users">
          <div class="user-avatar-section">
            <img 
              [src]="user.avatarUrl" 
              [alt]="user.name"
              class="user-avatar">
          </div>
          
          <div class="user-info">
            <div class="user-name">
              <a href="#" class="user-link">{{ user.name }}</a>
            </div>
            
            <div class="user-location" *ngIf="user.location">
              <svg width="16" height="16" viewBox="0 0 16 16" class="location-icon">
                <path fill="currentColor" d="M8 0C5.24 0 3 2.24 3 5c0 3.55 4.13 9.35 4.41 9.75a.75.75 0 0 0 1.18 0C8.87 14.35 13 8.55 13 5c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
              </svg>
              {{ user.location }}
            </div>
            
            <div class="user-reputation">
              <span class="reputation-number">{{ formatReputation(user.reputation) }}</span>
              <span class="reputation-label">reputation</span>
            </div>
            
            <div class="user-tags">
              <span class="user-tag" *ngFor="let tag of user.tags.slice(0, 3)">
                {{ tag }}
              </span>
            </div>
            
            <div class="user-join-date" *ngIf="user.joinDate">
              Member since {{ formatJoinDate(user.joinDate) }}
            </div>
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
    .users-page {
      padding: 24px;
    }
    
    .users-header {
      margin-bottom: 24px;
    }
    
    .users-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    
    .users-description {
      font-size: 15px;
      color: var(--so-gray-text);
      line-height: 1.5;
    }
    
    .users-filters {
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
    
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .user-card {
      background-color: var(--so-white);
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      padding: 16px;
      transition: border-color 0.2s ease;
      display: flex;
      gap: 12px;
    }
    
    .user-card:hover {
      border-color: var(--so-gray-text);
    }
    
    .user-avatar-section {
      flex-shrink: 0;
    }
    
    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 3px;
    }
    
    .user-info {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      margin-bottom: 4px;
    }
    
    .user-link {
      color: var(--so-blue);
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
    }
    
    .user-link:hover {
      text-decoration: underline;
    }
    
    .user-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--so-gray-text);
      margin-bottom: 8px;
    }
    
    .location-icon {
      width: 12px;
      height: 12px;
    }
    
    .user-reputation {
      margin-bottom: 8px;
    }
    
    .reputation-number {
      font-weight: bold;
      color: var(--so-black);
      font-size: 14px;
    }
    
    .reputation-label {
      font-size: 12px;
      color: var(--so-gray-text);
      margin-left: 4px;
    }
    
    .user-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 8px;
    }
    
    .user-tag {
      background-color: #E1ECF4;
      color: #39739D;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .user-join-date {
      font-size: 11px;
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
      .users-page {
        padding: 16px;
      }
      
      .users-filters {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .filter-input {
        max-width: none;
        width: 100%;
      }
      
      .filter-tabs {
        overflow-x: auto;
        white-space: nowrap;
        width: 100%;
      }
      
      .users-grid {
        grid-template-columns: 1fr;
      }
      
      .pagination {
        flex-wrap: wrap;
        padding: 16px;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  formatReputation(reputation: number): string {
    if (reputation >= 1000000) {
      return (reputation / 1000000).toFixed(1) + 'm';
    }
    if (reputation >= 1000) {
      return (reputation / 1000).toFixed(1) + 'k';
    }
    return reputation.toLocaleString();
  }

  formatJoinDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
}
