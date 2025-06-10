import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/questions', pathMatch: 'full' },
  { 
    path: 'questions', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'questions/:id', 
    loadComponent: () => import('./pages/question-detail/question-detail.component').then(m => m.QuestionDetailComponent)
  },
  { 
    path: 'ask', 
    loadComponent: () => import('./pages/ask-question/ask-question.component').then(m => m.AskQuestionComponent)
  },
  { 
    path: 'tags', 
    loadComponent: () => import('./pages/tags/tags.component').then(m => m.TagsComponent)
  },
  { 
    path: 'users', 
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
  },
  { path: '**', redirectTo: '/questions' }
];
