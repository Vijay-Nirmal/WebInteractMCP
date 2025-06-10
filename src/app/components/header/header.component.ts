import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="site-header">
      <div class="header-container">
        <div class="header-left">
          <a routerLink="/" class="logo">
            <svg width="150" height="30" viewBox="0 0 150 30">
              <text x="0" y="20" fill="#F48024" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
                stack<tspan fill="#666">overflow</tspan>
              </text>
            </svg>
          </a>
          <nav class="main-nav">
            <a href="#" class="nav-link">About</a>
            <a href="#" class="nav-link">Products</a>
            <a href="#" class="nav-link">For Teams</a>
          </nav>
        </div>
        
        <div class="header-center">
          <div class="search-container">
            <input type="search" placeholder="Search..." class="search-input">
            <button class="search-btn">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M15.8 15.1l-3.6-3.6c.8-1 1.3-2.2 1.3-3.5 0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6c1.3 0 2.5-.5 3.5-1.3l3.6 3.6c.2.2.5.2.7 0s.2-.5 0-.7zM2 8c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="header-right">
          <button class="btn btn-secondary">Log in</button>
          <button class="btn btn-primary">Sign up</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .site-header {
      background-color: var(--so-white);
      border-top: 3px solid var(--so-orange);
      border-bottom: 1px solid var(--so-gray-border);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      max-width: 1264px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      align-items: center;
      height: 50px;
      gap: 16px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .logo {
      display: block;
      text-decoration: none;
    }
    
    .main-nav {
      display: flex;
      gap: 16px;
    }
    
    .nav-link {
      color: var(--so-gray-text);
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    
    .nav-link:hover {
      background-color: var(--so-gray-bg-light);
      text-decoration: none;
    }
    
    .header-center {
      flex: 1;
      max-width: 500px;
    }
    
    .search-container {
      position: relative;
      width: 100%;
    }
    
    .search-input {
      width: 100%;
      padding: 8px 40px 8px 12px;
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }
    
    .search-input:focus {
      border-color: var(--so-blue);
      box-shadow: 0 0 0 3px rgba(10, 149, 255, 0.1);
    }
    
    .search-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--so-gray-text);
      padding: 4px;
    }
    
    .header-right {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .header-container {
        gap: 8px;
      }
      
      .main-nav {
        display: none;
      }
      
      .header-center {
        max-width: none;
      }
    }
  `]
})
export class HeaderComponent {}
