import React from 'react'

function Spinner() {
    return (
        <div className="space-y-6 text-center">
            <h2 className="text-white text-sm font-medium tracking-wide">Loading ...</h2>
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-slate-500/20 animate-pulse"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-violet-500 border-b-violet-400 rounded-full animate-spin" style={{ boxShadow: '0 0 14px rgba(168, 85, 247, 0.4)' }}></div>
            </div>
        </div>
    )
}

export default Spinner