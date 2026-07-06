import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-chamber-50 to-white items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">
              An error occurred while loading the chat. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg text-left">
                <p className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={this.resetError}
              className="w-full px-4 py-2.5 bg-chamber-500 hover:bg-chamber-600 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
