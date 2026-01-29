

export function Header() {
    return (
        <header className="w-full pt-4 flex flex-col items-center justify-center select-none z-20 pointer-events-none">
            <div className="flex flex-col items-center group cursor-default pointer-events-auto">
                <div className="logo-container relative inline-flex items-center">
                    <h1 className="text-2xl font-display font-medium text-lab-text tracking-tight logo-text">NeuroAtlas</h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-[1px] w-3 bg-gradient-to-r from-transparent to-primary/30"></div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-[9px] font-display font-light text-accent-light uppercase tracking-[0.4em]">by Bryan Munguia</p>
                        <span className="material-symbols-outlined text-[10px] text-gray-500">code</span>
                    </div>
                    <div className="h-[1px] w-3 bg-gradient-to-l from-transparent to-primary/30"></div>
                </div>
            </div>
        </header>
    );
}
