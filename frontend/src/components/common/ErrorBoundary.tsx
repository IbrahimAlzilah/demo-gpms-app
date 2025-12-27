import { Component, ReactNode, ErrorInfo } from 'react'
import i18n from '@/lib/i18n/i18n'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-bold text-destructive">
              {i18n.t('error.errorBoundary.title')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {this.state.error?.message || i18n.t('error.errorBoundary.message')}
            </p>
          </div>
        )
      )
    }

    return this.props.children
  }
}

