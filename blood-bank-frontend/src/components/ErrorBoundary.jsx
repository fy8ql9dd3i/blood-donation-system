import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 formal-border shadow-2xl text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Application Error</h1>
            <p className="text-slate-500 font-medium">
              Something went wrong while rendering this page. Our technical team has been notified.
            </p>
            <div className="p-4 bg-red-50 rounded-2xl text-left overflow-auto max-h-40">
              <code className="text-xs text-red-600 font-mono">
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-brand-200 transition-all active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
