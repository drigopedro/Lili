interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof window === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    document.body.appendChild(this.container);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private notify(listeners: ((toasts: Toast[]) => void)[]) {
    listeners.forEach(listener => listener([...this.toasts]));
    this.renderToasts();
  }

  private renderToasts() {
    if (!this.container) return;

    this.container.innerHTML = '';

    this.toasts.forEach(toast => {
      const toastElement = document.createElement('div');
      toastElement.className = `
        pointer-events-auto max-w-sm w-full bg-white shadow-lg rounded-lg overflow-hidden
        transform transition-all duration-300 ease-in-out animate-slide-down
        ${this.getToastStyles(toast.type)}
      `;

      toastElement.innerHTML = `
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              ${this.getToastIcon(toast.type)}
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">
                ${toast.message}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onclick="this.parentElement.parentElement.parentElement.parentElement.remove()"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(toastElement);

      // Auto remove after duration
      setTimeout(() => {
        toastElement.remove();
        this.remove(toast.id);
      }, toast.duration);
    });
  }

  private getToastStyles(type: string): string {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-400';
      case 'error':
        return 'border-l-4 border-red-400';
      case 'warning':
        return 'border-l-4 border-yellow-400';
      case 'info':
        return 'border-l-4 border-blue-400';
      default:
        return 'border-l-4 border-gray-400';
    }
  }

  private getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return `<svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      case 'error':
        return `<svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      case 'warning':
        return `<svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>`;
      case 'info':
        return `<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      default:
        return '';
    }
  }

  show(message: string, options: ToastOptions = {}): string {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
    };

    this.toasts.push(toast);
    this.notify(this.listeners);

    return toast.id;
  }

  success(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'error' });
  }

  warning(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'info' });
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify(this.listeners);
  }

  clear(): void {
    this.toasts = [];
    this.notify(this.listeners);
  }

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const toast = new ToastManager();