import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LeftSidebarComponent } from './components/left-sidebar/left-sidebar.component';
import { MCPControlsComponent } from './components/mcp-controls/mcp-controls.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LeftSidebarComponent, MCPControlsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected title = 'Stack Overflow Clone';
}
