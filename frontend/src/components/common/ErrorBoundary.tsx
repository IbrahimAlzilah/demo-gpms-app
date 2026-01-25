import React from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import i18n from '@/lib/i18n/i18n'
import { MainLayout } from '@/layouts/MainLayout'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
          <MainLayout>
            <div className="flex flex-col items-center justify-center p-8">
              <h2 className="text-xl font-bold text-destructive">
                {i18n.t('error.errorBoundary.title')}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {this.state.error?.message || i18n.t('error.errorBoundary.message')}
              </p>
            </div>
          </MainLayout>
        )
      )
    }

    return this.props.children
  }
}

