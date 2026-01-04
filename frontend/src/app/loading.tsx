import { Loader2 } from 'lucide-react';
import Head from 'next/head';

export default function FullPageSpinner() {
    return (<>
        <Head>
            <style>{`
        @keyframes blob {
            0%, 100% {
            transform: translate(0, 0) scale(1);
            }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          }

        @keyframes progress {
          0% {
            background-position: 200% center;
          }
          50% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
          }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        </Head>
        <main className="flex items-center justify-center min-h-screen w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                {/* Main Spinner */}
                <div className="relative w-24 h-24">
                    <Loader2 className="w-24 h-24 text-blue-400 animate-spin" strokeWidth={1.5} />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-300 border-r-blue-300 animate-spin opacity-50" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-300 border-l-purple-300 animate-spin opacity-30" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-semibold text-white tracking-tight">
                        Loading
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Please wait while we prepare everything for you...
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"
                        style={{
                            animation: 'progress 2s ease-in-out infinite',
                            backgroundSize: '200% 100%'
                        }}
                    ></div>
                </div>
            </div>
        </main>
    </>
    );
}