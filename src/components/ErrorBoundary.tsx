import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-8 text-center bg-red-50 text-red-800 rounded-xl border border-red-200 m-4">
                    <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
                    <p className="mb-4">Ha ocurrido un error al cargar esta sección.</p>
                    <p className="text-sm font-mono bg-white p-2 rounded border border-red-100 overflow-auto max-w-full">
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
