import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface ChatMessage {
  content: string;
  isUser: boolean;
}

interface Prompt {
  id: number;
  content: string;
  timestamp: string;
  responses: Response[];
}

interface Response {
  id: number;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-content">
          <h1>ChatBot GBN</h1>
          <button class="logout-button" (click)="logout()">Déconnexion</button>
        </div>
      </div>
      <div class="messages" #chatMessages>
        <div
          *ngFor="let message of messages"
          [ngClass]="message.isUser ? 'user' : 'assistant'"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
        <div *ngIf="isTyping" class="assistant">
          <div class="message-content">
            <span class="typing-indicator">...</span>
          </div>
        </div>
      </div>
      <form
        [formGroup]="chatForm"
        (ngSubmit)="onSubmit()"
        class="input-container"
      >
        <textarea
          formControlName="message"
          placeholder="Écrivez votre message ici..."
          (keydown)="handleKeyPress($event)"
          (input)="autoResize($event)"
          rows="1"
        ></textarea>
        <button type="submit" [disabled]="chatForm.invalid || isTyping">
          {{ isTyping ? 'Envoi en cours...' : 'Envoyer' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .chat-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 4rem);
      }

      .chat-header {
        background-color: #007bff;
        color: white;
        padding: 1rem;
        border-radius: 8px 8px 0 0;
        margin-bottom: 1rem;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-content h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      .logout-button {
        padding: 0.5rem 1rem;
        background-color: transparent;
        border: 1px solid white;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .logout-button:hover {
        background-color: white;
        color: #007bff;
      }

      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .user,
      .assistant {
        max-width: 70%;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
      }

      .user {
        align-self: flex-end;
        background-color: #007bff;
        color: white;
      }

      .assistant {
        align-self: flex-start;
        background-color: #f8f9fa;
        color: #333;
      }

      .input-container {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: white;
        border-top: 1px solid #ddd;
      }

      textarea {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        resize: none;
        min-height: 40px;
        max-height: 150px;
        overflow-y: auto;
      }

      textarea:focus {
        outline: none;
        border-color: #007bff;
      }

      button {
        padding: 0.75rem 1.5rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      button:hover {
        background-color: #0056b3;
      }

      button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .typing-indicator {
        display: inline-block;
        animation: typing 1s infinite;
      }

      @keyframes typing {
        0% {
          content: '.';
        }
        33% {
          content: '..';
        }
        66% {
          content: '...';
        }
      }
    `,
  ],
})
export class ChatbotComponent implements AfterViewChecked, OnInit {
  @ViewChild('chatMessages') private chatMessages!: ElementRef;

  messages: ChatMessage[] = [];
  isTyping = false;
  chatForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    // Carrega o histórico de conversas
    this.loadChatHistory();
  }

  private loadChatHistory() {
    this.http.get<Prompt[]>('http://localhost:3000/api/prompts').subscribe({
      next: (prompts) => {
        // Limpa as mensagens atuais
        this.messages = [];

        // Adiciona a mensagem de boas-vindas
        this.authService.currentUser$.subscribe((user) => {
          const nome = user?.name || 'utilisateur';
          this.messages.push({
            content: `Bonjour, ${nome}! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?`,
            isUser: false,
          });
        });

        // Adiciona as mensagens do histórico
        prompts.forEach((prompt) => {
          // Adiciona a mensagem do usuário
          this.messages.push({
            content: prompt.content,
            isUser: true,
          });

          // Adiciona a resposta do bot
          if (prompt.responses && prompt.responses.length > 0) {
            this.messages.push({
              content: prompt.responses[0].content,
              isUser: false,
            });
          }
        });
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'historique:", error);
      },
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatMessages.nativeElement.scrollTop =
        this.chatMessages.nativeElement.scrollHeight;
    } catch (err) {}
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.chatForm.valid) {
        this.onSubmit();
      }
    }
  }

  onSubmit(): void {
    if (this.chatForm.valid) {
      const userMessage = this.chatForm.get('message')?.value;

      // Adiciona mensagem do usuário
      this.messages.push({
        content: userMessage,
        isUser: true,
      });

      // Limpa o formulário
      this.chatForm.reset();

      // Chama o backend para obter a resposta
      this.getBotResponse(userMessage);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  private getBotResponse(userMessage: string): void {
    this.isTyping = true;
    this.http
      .post<any>('http://localhost:3000/api/prompts', { content: userMessage })
      .subscribe({
        next: (data) => {
          this.isTyping = false;
          if (data && data.response && data.response.content) {
            this.messages.push({
              content: data.response.content,
              isUser: false,
            });
          } else {
            this.messages.push({
              content: 'Format de réponse du serveur inattendu.',
              isUser: false,
            });
          }
        },
        error: (err) => {
          this.isTyping = false;
          this.messages.push({
            content: "Erreur lors de l'obtention de la réponse du serveur.",
            isUser: false,
          });
        },
      });
  }
}
