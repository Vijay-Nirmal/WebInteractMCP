import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question } from '../models/question.model';
import { User } from '../models/user.model';
import { Tag } from '../models/tag.model';
import { Answer } from '../models/answer.model';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      reputation: 12847,
      avatarUrl: 'https://www.gravatar.com/avatar/placeholder1?s=64&d=identicon',
      tags: ['javascript', 'angular', 'typescript'],
      joinDate: new Date('2020-03-15'),
      location: 'San Francisco, CA'
    },
    {
      id: 2,
      name: 'Jane Smith',
      reputation: 25691,
      avatarUrl: 'https://www.gravatar.com/avatar/placeholder2?s=64&d=identicon',
      tags: ['python', 'django', 'machine-learning'],
      joinDate: new Date('2019-07-22'),
      location: 'New York, NY'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      reputation: 8439,
      avatarUrl: 'https://www.gravatar.com/avatar/placeholder3?s=64&d=identicon',
      tags: ['react', 'node.js', 'express'],
      joinDate: new Date('2021-01-10'),
      location: 'Austin, TX'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      reputation: 34576,
      avatarUrl: 'https://www.gravatar.com/avatar/placeholder4?s=64&d=identicon',
      tags: ['java', 'spring-boot', 'microservices'],
      joinDate: new Date('2018-11-05'),
      location: 'Seattle, WA'
    },
    {
      id: 5,
      name: 'Alex Chen',
      reputation: 19832,
      avatarUrl: 'https://www.gravatar.com/avatar/placeholder5?s=64&d=identicon',
      tags: ['c#', '.net', 'azure'],
      joinDate: new Date('2020-09-18'),
      location: 'Toronto, Canada'
    }
  ];

  private mockTags: Tag[] = [
    { name: 'javascript', description: 'For questions regarding programming in ECMAScript (JavaScript/JS) and its various dialects/implementations (excluding ActionScript).', questionCount: 2456789 },
    { name: 'python', description: 'Python is a multi-paradigm, dynamically typed, multi-purpose programming language.', questionCount: 1987654 },
    { name: 'java', description: 'Java is a high-level object-oriented programming language.', questionCount: 1876543 },
    { name: 'c#', description: 'C# (pronounced "see sharp") is a high-level, statically typed, multi-paradigm programming language developed by Microsoft.', questionCount: 1654321 },
    { name: 'php', description: 'PHP is a widely-used, open source, general-purpose, multi-paradigm, dynamically typed and interpreted scripting language.', questionCount: 1432198 },
    { name: 'android', description: 'Android is Google\'s mobile operating system, used for programming or developing digital devices.', questionCount: 1321987 },
    { name: 'html', description: 'HTML (HyperText Markup Language) is the markup language for creating web pages and other information to be displayed in a web browser.', questionCount: 1198765 },
    { name: 'jquery', description: 'jQuery is a JavaScript library. Consider also adding the JavaScript tag.', questionCount: 987654 },
    { name: 'css', description: 'CSS (Cascading Style Sheets) is a representation style sheet language used for describing the look and formatting of HTML.', questionCount: 876543 },
    { name: 'mysql', description: 'MySQL is a free, open source Relational Database Management System (RDBMS) that uses Structured Query Language (SQL).', questionCount: 765432 },
    { name: 'angular', description: 'Angular is a TypeScript-based open-source web application framework led by the Angular Team at Google.', questionCount: 654321 },
    { name: 'react.js', description: 'React is a JavaScript library for building user interfaces.', questionCount: 543210 },
    { name: 'node.js', description: 'Node.js is an event-based, non-blocking, asynchronous I/O runtime that uses Google\'s V8 JavaScript engine.', questionCount: 432109 },
    { name: 'typescript', description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.', questionCount: 321098 },
    { name: 'vue.js', description: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.', questionCount: 210987 }
  ];

  private mockComments: Comment[] = [
    {
      id: 1,
      text: 'This is a great answer! Thanks for the detailed explanation.',
      author: this.mockUsers[1],
      creationDate: new Date('2024-06-09T14:30:00Z'),
      score: 5
    },
    {
      id: 2,
      text: 'Could you provide an example of how this would work with TypeScript?',
      author: this.mockUsers[2],
      creationDate: new Date('2024-06-09T15:45:00Z'),
      score: 2
    },
    {
      id: 3,
      text: 'I tried this approach but got a compilation error. Any ideas?',
      author: this.mockUsers[3],
      creationDate: new Date('2024-06-09T16:20:00Z'),
      score: 1
    }
  ];

  private mockAnswers: Answer[] = [
    {
      id: 1,
      body: `You can achieve this by using the \`Array.prototype.findIndex()\` method. Here's how:

\`\`\`javascript
const array = ['apple', 'banana', 'cherry'];
const index = array.findIndex(element => element === 'banana');
console.log(index); // Output: 1
\`\`\`

This method returns the index of the first element that satisfies the provided testing function. If no element is found, it returns -1.

For more complex comparisons, you can use a custom function:

\`\`\`javascript
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
];

const index = users.findIndex(user => user.name === 'Jane');
console.log(index); // Output: 1
\`\`\``,
      author: this.mockUsers[0],
      creationDate: new Date('2024-06-09T13:15:00Z'),
      score: 15,
      isAccepted: true,
      comments: [this.mockComments[0], this.mockComments[1]]
    },
    {
      id: 2,
      body: `Another approach is to use the \`indexOf()\` method for primitive values:

\`\`\`javascript
const fruits = ['apple', 'banana', 'cherry'];
const index = fruits.indexOf('banana');
console.log(index); // Output: 1
\`\`\`

However, \`indexOf()\` only works with primitive values and uses strict equality (===) for comparison. For objects or more complex matching, use \`findIndex()\` as shown in the accepted answer.`,
      author: this.mockUsers[3],
      creationDate: new Date('2024-06-09T14:20:00Z'),
      score: 8,
      isAccepted: false,
      comments: [this.mockComments[2]]
    }
  ];

  private mockQuestions: Question[] = [
    {
      id: 1,
      title: 'How to find the index of an element in an array in JavaScript?',
      body: `I have an array of elements and I want to find the index of a specific element. What's the best way to do this in JavaScript?

Here's my array:
\`\`\`javascript
const myArray = ['apple', 'banana', 'cherry', 'date'];
\`\`\`

I want to find the index of 'banana'. What would be the most efficient approach?`,
      author: this.mockUsers[1],
      creationDate: new Date('2024-06-09T12:00:00Z'),
      modifiedDate: new Date('2024-06-09T12:30:00Z'),
      score: 23,
      viewCount: 1547,
      tags: ['javascript', 'arrays', 'indexof'],
      answers: this.mockAnswers,
      comments: []
    },
    {
      id: 2,
      title: 'What is the difference between React and Angular?',
      body: `I'm trying to decide between React and Angular for my next project. Can someone explain the main differences between these two frameworks?

Specifically, I'm interested in:
- Learning curve
- Performance
- Community support
- Best use cases

Any insights would be greatly appreciated!`,
      author: this.mockUsers[2],
      creationDate: new Date('2024-06-08T10:30:00Z'),
      score: 45,
      viewCount: 3291,
      tags: ['react.js', 'angular', 'javascript', 'frontend'],
      answers: [],
      comments: [],
      bounty: 50
    },
    {
      id: 3,
      title: 'How to center a div horizontally and vertically using CSS?',
      body: `I'm trying to center a div both horizontally and vertically within its parent container. I've tried several approaches but none seem to work consistently across different browsers.

Here's my current HTML:
\`\`\`html
<div class="parent">
  <div class="child">Content to center</div>
</div>
\`\`\`

What's the best modern approach to achieve this?`,
      author: this.mockUsers[0],
      creationDate: new Date('2024-06-07T15:45:00Z'),
      score: 67,
      viewCount: 5432,
      tags: ['css', 'html', 'flexbox', 'css-grid'],
      answers: [],
      comments: []
    },
    {
      id: 4,
      title: 'Python list comprehension vs for loop performance',
      body: `I've heard that list comprehensions are faster than traditional for loops in Python. Is this true, and if so, why?

Here's an example of what I'm comparing:

**For loop:**
\`\`\`python
result = []
for i in range(1000):
    if i % 2 == 0:
        result.append(i * 2)
\`\`\`

**List comprehension:**
\`\`\`python
result = [i * 2 for i in range(1000) if i % 2 == 0]
\`\`\`

Which one should I prefer and why?`,
      author: this.mockUsers[4],
      creationDate: new Date('2024-06-06T09:20:00Z'),
      score: 34,
      viewCount: 2876,
      tags: ['python', 'performance', 'list-comprehension'],
      answers: [],
      comments: []
    },
    {
      id: 5,
      title: 'How to handle async/await in JavaScript properly?',
      body: `I'm new to async/await in JavaScript and I'm getting confused about error handling and best practices.

Could someone explain:
1. How to properly handle errors with try/catch
2. When to use async/await vs Promises
3. Common pitfalls to avoid

Here's a basic example I'm working with:
\`\`\`javascript
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
\`\`\``,
      author: this.mockUsers[3],
      creationDate: new Date('2024-06-05T14:10:00Z'),
      score: 89,
      viewCount: 7654,
      tags: ['javascript', 'async-await', 'promises', 'error-handling'],
      answers: [],
      comments: []
    }
  ];

  getQuestions(): Observable<Question[]> {
    return of(this.mockQuestions);
  }

  getQuestionById(id: number): Observable<Question | undefined> {
    const question = this.mockQuestions.find(q => q.id === id);
    return of(question);
  }

  getTags(): Observable<Tag[]> {
    return of(this.mockTags);
  }

  getUsers(): Observable<User[]> {
    return of(this.mockUsers);
  }

  getUserById(id: number): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user);
  }
}
