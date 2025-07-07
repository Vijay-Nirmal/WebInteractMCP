import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-columns">
          <div class="footer-column">
            <h5>STACK OVERFLOW</h5>
            <ul>
              <li><a href="#">Questions</a></li>
              <li><a href="#">Jobs</a></li>
              <li><a href="#">Developer Jobs Directory</a></li>
              <li><a href="#">Salary Calculator</a></li>
              <li><a href="#">Help</a></li>
              <li><a href="#">Mobile</a></li>
              <li><a href="#">Disable Responsiveness</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h5>PRODUCTS</h5>
            <ul>
              <li><a href="#">Teams</a></li>
              <li><a href="#">Advertising</a></li>
              <li><a href="#">Collectives</a></li>
              <li><a href="#">Talent</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h5>COMPANY</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Work Here</a></li>
              <li><a href="#">Legal</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Cookie Settings</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h5>STACK EXCHANGE NETWORK</h5>
            <ul>
              <li><a href="#">Technology</a></li>
              <li><a href="#">Culture & recreation</a></li>
              <li><a href="#">Life & arts</a></li>
              <li><a href="#">Science</a></li>
              <li><a href="#">Professional</a></li>
              <li><a href="#">Business</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Data</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p>Site design / logo © 2024 Stack Exchange Inc; user contributions licensed under CC BY-SA. rev 2024.6.10.1234</p>
          </div>
          <div class="footer-bottom-right">
            <div class="social-links">
              <a href="#" aria-label="Blog">Blog</a>
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
              <a href="#" aria-label="Instagram">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background-color: #242629;
      color: #9199A1;
      margin-top: auto;
    }
    
    .footer-container {
      max-width: 1264px;
      margin: 0 auto;
      padding: 32px 16px 16px;
    }
    
    .footer-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .footer-column h5 {
      color: #BABFC4;
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    
    .footer-column ul {
      list-style: none;
    }
    
    .footer-column li {
      margin-bottom: 8px;
    }
    
    .footer-column a {
      color: #9199A1;
      text-decoration: none;
      font-size: 13px;
      line-height: 1.4;
    }
    
    .footer-column a:hover {
      color: #BABFC4;
      text-decoration: underline;
    }
    
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #3C4146;
      font-size: 11px;
    }
    
    .footer-bottom-left p {
      margin: 0;
      line-height: 1.4;
    }
    
    .social-links {
      display: flex;
      gap: 16px;
    }
    
    .social-links a {
      color: #9199A1;
      text-decoration: none;
      font-size: 11px;
    }
    
    .social-links a:hover {
      color: #BABFC4;
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .footer-columns {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
      
      .footer-bottom {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
