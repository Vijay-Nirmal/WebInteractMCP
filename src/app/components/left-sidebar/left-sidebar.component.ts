import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="left-sidebar">
      <ul class="nav-list">
        <li>
          <a routerLink="/questions" routerLinkActive="active" class="nav-item">
            <span class="nav-text">Home</span>
          </a>
        </li>
        
        <li class="nav-section">
          <div class="nav-section-header">PUBLIC</div>
          <ul class="nav-sublist">
            <li>
              <a routerLink="/questions" routerLinkActive="active" class="nav-item">
                <svg width="16" height="16" viewBox="0 0 16 16" class="nav-icon">
                  <path fill="currentColor" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z"/>
                  <path fill="currentColor" d="M8 5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1ZM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
                </svg>
                <span class="nav-text">Questions</span>
              </a>
            </li>
            <li>
              <a routerLink="/tags" routerLinkActive="active" class="nav-item">
                <span class="nav-text">Tags</span>
              </a>
            </li>
            <li>
              <a routerLink="/users" routerLinkActive="active" class="nav-item">
                <span class="nav-text">Users</span>
              </a>
            </li>
          </ul>
        </li>
        
        <li class="nav-section">
          <div class="nav-section-header">COLLECTIVES</div>
          <ul class="nav-sublist">
            <li>
              <a href="#" class="nav-item">
                <span class="nav-text">Explore Collectives</span>
              </a>
            </li>
          </ul>
        </li>
        
        <li class="nav-section">
          <div class="nav-section-header">TEAMS</div>
          <ul class="nav-sublist">
            <li>
              <a href="#" class="nav-item">
                <span class="nav-text">Stack Overflow for Teams</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .left-sidebar {
      width: 164px;
      background-color: var(--so-white);
      border-right: 1px solid var(--so-gray-border);
      padding: 24px 0;
      position: sticky;
      top: 50px;
      height: calc(100vh - 50px);
      overflow-y: auto;
    }
    
    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-list > li {
      margin-bottom: 16px;
    }
    
    .nav-section-header {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: bold;
      color: var(--so-gray-text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .nav-sublist {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      color: var(--so-gray-text);
      text-decoration: none;
      font-size: 13px;
      transition: all 0.2s ease;
      border-right: 3px solid transparent;
    }
    
    .nav-item:hover {
      background-color: var(--so-gray-bg-light);
      color: var(--so-black);
      text-decoration: none;
    }
    
    .nav-item.active {
      background-color: var(--so-gray-bg-light);
      color: var(--so-black);
      border-right-color: var(--so-orange);
      font-weight: bold;
    }
    
    .nav-icon {
      margin-right: 8px;
      flex-shrink: 0;
    }
    
    .nav-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    @media (max-width: 768px) {
      .left-sidebar {
        display: none;
      }
    }
  `]
})
export class LeftSidebarComponent {}
