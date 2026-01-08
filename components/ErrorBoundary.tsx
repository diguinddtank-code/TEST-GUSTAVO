import React, { Component, ErrorInfo, ReactNode } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Logout failed", e);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-red-50 p-6 rounded-full mb-6 shadow-sm border border-red-100">
             <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">App Update Required</h1>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium leading-relaxed">
            We detected an old data format in your account. Please reset to apply the latest updates.
          </p>
          
          <button 
            onClick={this.handleReset}
            className="bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-transform flex items-center space-x-2 w-full max-w-[200px] justify-center"
          >
            <LogOut size={20} />
            <span>Reset & Update</span>
          </button>
          
          <div className="mt-12 p-4 bg-slate-100 rounded-xl w-full max-w-xs mx-auto">
            <p className="text-[10px] text-slate-400 font-mono break-all text-left">
              Error Code: {this.state.error?.message || "Unknown State"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}