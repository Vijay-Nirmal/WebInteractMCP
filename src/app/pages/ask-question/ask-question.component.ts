import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ask-question-page">
      <div class="ask-header">
        <h1>Ask a public question</h1>
      </div>
      
      <div class="ask-content">
        <div class="ask-main">
          <div class="ask-form">
            <div class="form-section">
              <label class="form-label">Title</label>
              <p class="form-description">
                Be specific and imagine you're asking a question to another person.
              </p>
              <input 
                type="text" 
                class="form-input title-input"
                placeholder="e.g., Is there an R function for finding the index of an element in a vector?"
                maxlength="150">
              <div class="char-counter">150 characters left</div>
            </div>
            
            <div class="form-section">
              <label class="form-label">What are the details of your problem?</label>
              <p class="form-description">
                Introduce the problem and expand on what you put in the title. Minimum 20 characters.
              </p>
              <div class="editor-toolbar">
                <button class="toolbar-btn" title="Bold">
                  <strong>B</strong>
                </button>
                <button class="toolbar-btn" title="Italic">
                  <em>I</em>
                </button>
                <button class="toolbar-btn" title="Code">
                  <code>{{ '{' }}{{ '}' }}</code>
                </button>
                <button class="toolbar-btn" title="Link">
                  🔗
                </button>
                <button class="toolbar-btn" title="Bulleted list">
                  • List
                </button>
                <button class="toolbar-btn" title="Numbered list">
                  1. List
                </button>
              </div>
              <textarea 
                class="form-textarea body-textarea"
                placeholder="Introduce the problem and expand on what you put in the title..."
                rows="15">
              </textarea>
            </div>
            
            <div class="form-section">
              <label class="form-label">Tags</label>
              <p class="form-description">
                Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
              </p>
              <input 
                type="text" 
                class="form-input tags-input"
                placeholder="e.g. (javascript angular typescript)">
              <div class="tags-suggestions">
                <span class="tag-suggestion">javascript</span>
                <span class="tag-suggestion">angular</span>
                <span class="tag-suggestion">typescript</span>
                <span class="tag-suggestion">html</span>
                <span class="tag-suggestion">css</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button class="btn btn-primary post-question-btn">
                Post your question
              </button>
              <button class="btn btn-outline">
                Discard draft
              </button>
            </div>
          </div>
        </div>
        
        <div class="ask-sidebar">
          <div class="sidebar-card">
            <h3>Writing a good question</h3>
            <p>You're ready to ask a programming-related question and this form will help guide you through the process.</p>
            <h4>Steps</h4>
            <ul>
              <li>Summarize your problem in a one-line title.</li>
              <li>Describe your problem in more detail.</li>
              <li>Describe what you tried and what you expected to happen.</li>
              <li>Add "tags" which help surface your question to members of the community.</li>
              <li>Review your question and post it to the site.</li>
            </ul>
          </div>
          
          <div class="sidebar-card">
            <h3>Writing a good title</h3>
            <p>Your title should summarize the problem.</p>
            <p>If you're having trouble summarizing the problem, write the title last - sometimes writing the rest of the question first can make it easier to describe the problem.</p>
            <h4>Examples:</h4>
            <ul>
              <li><strong>Bad:</strong> C# Math Confusion</li>
              <li><strong>Good:</strong> Why does using float instead of int give me different results when all of my inputs are integers?</li>
              <li><strong>Bad:</strong> [php] session doubt</li>
              <li><strong>Good:</strong> How can I redirect users to different pages based on session data in PHP?</li>
            </ul>
          </div>
          
          <div class="sidebar-card">
            <h3>How to format</h3>
            <h4>Code</h4>
            <p>Indent code by 4 spaces:</p>            <pre><code>    if (x < 0) {{ '{' }}
        return false;
    {{ '}' }}</code></pre>
            <p>Or select code and click the {{ '{' }}{{ '}' }} button.</p>
            <h4>Links</h4>
            <p>Provide context for links:</p>
            <p><a href="#">This question</a> shows how to add syntax highlighting.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ask-question-page {
      padding: 24px;
      max-width: 1100px;
    }
    
    .ask-header {
      margin-bottom: 24px;
    }
    
    .ask-header h1 {
      font-size: 28px;
      font-weight: 400;
      margin: 0;
    }
    
    .ask-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    
    .ask-form {
      background-color: var(--so-white);
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      padding: 24px;
    }
    
    .form-section {
      margin-bottom: 24px;
    }
    
    .form-label {
      display: block;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
      color: var(--so-black);
    }
    
    .form-description {
      font-size: 12px;
      color: var(--so-gray-text);
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--so-gray-border);
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s ease;
    }
    
    .form-input:focus {
      border-color: var(--so-blue);
      box-shadow: 0 0 0 3px rgba(10, 149, 255, 0.1);
    }
    
    .title-input {
      font-size: 16px;
      padding: 12px;
    }
    
    .char-counter {
      font-size: 12px;
      color: var(--so-gray-text);
      text-align: right;
      margin-top: 4px;
    }
    
    .editor-toolbar {
      display: flex;
      gap: 2px;
      margin-bottom: 8px;
      padding: 8px;
      background-color: var(--so-gray-bg-lighter);
      border: 1px solid var(--so-gray-border);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
    }
    
    .toolbar-btn {
      background: none;
      border: none;
      padding: 6px 8px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 3px;
      color: var(--so-gray-text);
      transition: background-color 0.2s ease;
    }
    
    .toolbar-btn:hover {
      background-color: var(--so-gray-bg-light);
    }
    
    .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--so-gray-border);
      border-top: none;
      border-radius: 0 0 4px 4px;
      font-size: 14px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      outline: none;
      resize: vertical;
      transition: border-color 0.2s ease;
    }
    
    .form-textarea:focus {
      border-color: var(--so-blue);
      box-shadow: 0 0 0 3px rgba(10, 149, 255, 0.1);
    }
    
    .tags-input {
      margin-bottom: 8px;
    }
    
    .tags-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .tag-suggestion {
      background-color: #E1ECF4;
      color: #39739D;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .tag-suggestion:hover {
      background-color: #D0E3F1;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
    }
    
    .post-question-btn {
      font-size: 14px;
      padding: 10px 16px;
    }
    
    .ask-sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .sidebar-card {
      background-color: #FDF7E2;
      border: 1px solid #F1E05A;
      border-radius: 4px;
      padding: 16px;
    }
    
    .sidebar-card h3 {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--so-black);
    }
    
    .sidebar-card h4 {
      font-size: 13px;
      font-weight: 600;
      margin: 12px 0 8px;
      color: var(--so-black);
    }
    
    .sidebar-card p {
      font-size: 12px;
      color: var(--so-black);
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .sidebar-card ul {
      font-size: 12px;
      color: var(--so-black);
      margin-left: 16px;
      line-height: 1.4;
    }
    
    .sidebar-card li {
      margin-bottom: 4px;
    }
    
    .sidebar-card pre {
      background-color: #F6F6F6;
      border: 1px solid #E3E6E8;
      padding: 8px;
      border-radius: 3px;
      font-size: 11px;
      margin: 8px 0;
    }
    
    .sidebar-card code {
      background-color: #F6F6F6;
      padding: 1px 3px;
      border-radius: 2px;
      font-size: 11px;
    }
    
    .sidebar-card a {
      color: var(--so-blue);
    }
    
    @media (max-width: 768px) {
      .ask-question-page {
        padding: 16px;
      }
      
      .ask-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .ask-form {
        padding: 16px;
      }
      
      .form-actions {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .editor-toolbar {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AskQuestionComponent {}
