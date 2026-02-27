import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '2rem auto',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
        }}>
          <h1 style={{ color: '#b91c1c', marginTop: 0 }}>Erro ao carregar o app</h1>
          <pre style={{ overflow: 'auto', fontSize: '14px' }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Abra o Console do navegador (F12 → Console) para mais detalhes.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
