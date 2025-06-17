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
          <button class="logout-button" (click)="logout()">
            <span class="button-text">Déconnexion</span>
          </button>
        </div>
      </div>
      <div class="messages">
        <div class="messages-inner" #messagesInner>
          <div
            *ngFor="let message of messages"
            [ngClass]="message.isUser ? 'user' : 'assistant'"
            class="message-wrapper"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
          <div *ngIf="isTyping" class="assistant message-wrapper">
            <div class="message-content">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
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
          <span class="button-text">{{
            isTyping ? 'Envoi en cours...' : 'Envoyer'
          }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="send-icon"
            [class.hidden]="isTyping"
          >
            <path
              d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
            />
          </svg>
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        background: radial-gradient(
            circle at 0% 0%,
            rgba(0, 97, 242, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 100% 0%,
            rgba(0, 68, 187, 0.15) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 100% 100%,
            rgba(0, 97, 242, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 0% 100%,
            rgba(0, 68, 187, 0.15) 0%,
            transparent 50%
          ),
          linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
        background-attachment: fixed;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #1a1a1a;
        font-size: 16px;
        line-height: 1.5;
      }

      .chat-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 2rem 4rem;
        position: relative;
      }

      .chat-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          120deg,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.1) 100%
        );
        pointer-events: none;
        z-index: -1;
      }

      .chat-header {
        background: linear-gradient(135deg, #0061f2 0%, #0044bb 100%);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
      }

      .header-content h1 {
        margin: 0;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 1.875rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        background: linear-gradient(to right, #ffffff, #e6e9f0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .logout-button {
        padding: 0.75rem 1.5rem;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        font-size: 0.9375rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: 'Inter', sans-serif;
      }

      .logout-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        scroll-behavior: smooth;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          inset 0 2px 4px rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        font-size: 0.9375rem;
        margin: 0 auto;
        width: 100%;
        max-width: 1400px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-sizing: border-box;
        position: relative;
      }

      .messages-inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 2rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .message-wrapper {
        display: flex;
        margin-bottom: 0.5rem;
        animation: fadeIn 0.3s ease-out;
        padding: 0 2rem;
      }

      .user {
        justify-content: flex-end;
      }

      .assistant {
        justify-content: flex-start;
      }

      .message-content {
        max-width: 60%;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        line-height: 1.6;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        letter-spacing: -0.011em;
      }

      .message-content:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .user .message-content {
        background: linear-gradient(135deg, #0061f2 0%, #0044bb 100%);
        color: white;
        border-bottom-right-radius: 4px;
        font-weight: 400;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .assistant .message-content {
        background: rgba(255, 255, 255, 0.9);
        color: #2d3748;
        border-bottom-left-radius: 4px;
        font-weight: 400;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .input-container {
        display: flex;
        gap: 1rem;
        padding: 1.5rem 2rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 20px;
        margin-top: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          inset 0 2px 4px rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        max-width: 1400px;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      textarea {
        flex: 1;
        padding: 1rem 1.25rem;
        border: 2px solid rgba(228, 231, 235, 0.8);
        border-radius: 12px;
        font-size: 0.9375rem;
        resize: none;
        min-height: 24px;
        max-height: 150px;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
        background: rgba(248, 250, 252, 0.8);
        color: #2d3748;
        line-height: 1.6;
        letter-spacing: -0.011em;
        backdrop-filter: blur(5px);
      }

      textarea::placeholder {
        color: #a0aec0;
        font-weight: 400;
      }

      textarea:focus {
        outline: none;
        border-color: #0061f2;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 0 3px rgba(0, 97, 242, 0.1);
      }

      button {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #0061f2 0%, #0044bb 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        letter-spacing: -0.011em;
        box-shadow: 0 2px 4px rgba(0, 97, 242, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 97, 242, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      button:disabled {
        background: #e4e7eb;
        cursor: not-allowed;
        transform: none;
        color: #a0aec0;
        box-shadow: none;
      }

      .send-icon {
        width: 1.25rem;
        height: 1.25rem;
        transition: transform 0.2s ease;
      }

      button:hover:not(:disabled) .send-icon {
        transform: translateX(2px);
      }

      .hidden {
        display: none;
      }

      .typing-dots {
        display: flex;
        gap: 0.4rem;
        padding: 0.25rem 0;
      }

      .typing-dots span {
        width: 8px;
        height: 8px;
        background: #0061f2;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }

      .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
      }

      .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .messages::-webkit-scrollbar {
        width: 8px;
      }

      .messages::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 20px;
      }

      .messages::-webkit-scrollbar-thumb {
        background: rgba(0, 97, 242, 0.3);
        border-radius: 20px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .messages::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 97, 242, 0.5);
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .messages::-webkit-scrollbar-corner {
        background: transparent;
      }

      @media (max-width: 1200px) {
        .chat-container {
          padding: 2rem;
        }

        .message-wrapper {
          padding: 0 1rem;
        }

        .message-content {
          max-width: 70%;
        }
      }

      @media (max-width: 768px) {
        :host {
          font-size: 15px;
        }

        .chat-container {
          padding: 1rem;
        }

        .chat-header {
          padding: 1rem 1.5rem;
        }

        .message-content {
          max-width: 85%;
          font-size: 0.9375rem;
        }

        .header-content h1 {
          font-size: 1.5rem;
        }

        .logout-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        textarea,
        button {
          font-size: 0.9375rem;
        }

        .input-container {
          padding: 1rem 1.5rem;
        }

        .message-wrapper {
          padding: 0;
        }
      }
    `,
  ],
})
export class ChatbotComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesInner') private messagesInner!: ElementRef;

  messages: ChatMessage[] = [];
  isTyping = false;
  chatForm: FormGroup;
  private shouldScroll = false;

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
    this.loadChatHistory();
  }

  private loadChatHistory() {
    this.http.get<Prompt[]>('http://localhost:3000/api/prompts').subscribe({
      next: (prompts) => {
        // Limpa as mensagens atuais
        this.messages = [];

        // Ordena os prompts por timestamp para garantir a ordem correta
        const sortedPrompts = prompts.sort((a, b) => {
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        // Adiciona a mensagem de boas-vindas
        this.authService.currentUser$.subscribe((user) => {
          const nome = user?.name || 'utilisateur';
          this.messages.push({
            content: `Bonjour, ${nome}! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?`,
            isUser: false,
          });
          this.shouldScroll = true;
        });

        // Adiciona as mensagens do histórico na ordem correta
        sortedPrompts.forEach((prompt) => {
          // Adiciona a mensagem do usuário
          this.messages.push({
            content: prompt.content,
            isUser: true,
          });

          // Adiciona a resposta do bot
          if (prompt.responses && prompt.responses.length > 0) {
            // Ordena as respostas por timestamp também
            const sortedResponses = prompt.responses.sort((a, b) => {
              return (
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
              );
            });

            this.messages.push({
              content: sortedResponses[0].content,
              isUser: false,
            });
          }
        });
        this.shouldScroll = true;
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'historique:", error);
      },
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      const element = this.messagesInner.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Erro ao tentar rolar para o final:', err);
    }
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

      // Adiciona mensagem do usuário ao final do array
      this.messages.push({
        content: userMessage,
        isUser: true,
      });

      // Marca para rolar para baixo
      this.shouldScroll = true;

      // Limpa o formulário antes de enviar a mensagem
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
    this.shouldScroll = true;

    this.http
      .post<any>('http://localhost:3000/api/prompts', { content: userMessage })
      .subscribe({
        next: (data) => {
          this.isTyping = false;
          if (data && data.response && data.response.content) {
            // Adiciona a resposta do bot ao final do array
            this.messages.push({
              content: data.response.content,
              isUser: false,
            });
          } else {
            // Adiciona mensagem de erro ao final do array
            this.messages.push({
              content: 'Format de réponse du serveur inattendu.',
              isUser: false,
            });
          }
          this.shouldScroll = true;
        },
        error: (err) => {
          this.isTyping = false;
          // Adiciona mensagem de erro ao final do array
          this.messages.push({
            content: "Erreur lors de l'obtention de la réponse du serveur.",
            isUser: false,
          });
          this.shouldScroll = true;
        },
      });
  }
}
