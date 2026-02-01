import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-2xl mx-auto">
                {children}
            </main>

            <footer className="w-full py-6 text-center text-gray-400 text-xs tracking-widest uppercase">
                <p>윤슬기의 슬기로운 시스템 탐구생활 Instagram @business.automator</p>
            </footer>
        </div>
    );
}
