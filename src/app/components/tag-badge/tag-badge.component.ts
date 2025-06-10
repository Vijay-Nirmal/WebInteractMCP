import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/tags']" class="tag">{{ tagName }}</a>
  `,
  styles: [`
    .tag {
      display: inline-block;
      background-color: #E1ECF4;
      color: #39739D;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
      margin: 2px 4px 2px 0;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    
    .tag:hover {
      background-color: #D0E3F1;
      color: #2C5877;
      text-decoration: none;
    }
  `]
})
export class TagBadgeComponent {
  @Input() tagName: string = '';
}
