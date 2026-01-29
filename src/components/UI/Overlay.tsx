import { useState, useMemo, useEffect, useRef } from 'react';
import { useBrainStore } from '../../store/useBrainStore';
import brainRegions from '../../data/brainRegions.json';

export function Overlay() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { selectRegion, searchTerm, isRotationEnabled, toggleRotation, isUIHidden, toggleUI } = useBrainStore();
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const uniqueCategories = useMemo(() => {
        const categories = new Set(brainRegions.map(r => r.category));
        return Array.from(categories).sort();
    }, []);

    const categoryRegions = useMemo(() => {
        if (!selectedCategory) return [];
        return brainRegions.filter(r => r.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedCategory]);

    const handleRegionSelect = (regionId: string) => {
        selectRegion(regionId);
        setIsDropdownOpen(false);
        setSelectedCategory(null);
    };

    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            {}
            {!isUIHidden && (
                <div className="absolute top-4 right-6 md:right-12 z-20 w-64 pointer-events-auto" ref={searchContainerRef}>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                        <input
                            className="w-full bg-white/70 backdrop-blur-xl border border-white/20 rounded-full py-2 pl-11 pr-4 text-xs text-lab-text placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-body shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]"
                            placeholder="Search neural structures..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                useBrainStore.getState().setSearch(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onClick={() => setIsDropdownOpen(true)}
                        />

                        {}
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-80 transition-all animate-in fade-in zoom-in-95 duration-200">

                                {}
                                {useBrainStore.getState().searchTerm ? (
                                    <div className="overflow-y-auto custom-scrollbar p-1">
                                        {brainRegions.filter(r =>
                                            r.name.toLowerCase().includes(useBrainStore.getState().searchTerm.toLowerCase()) ||
                                            r.latinName.toLowerCase().includes(useBrainStore.getState().searchTerm.toLowerCase())
                                        ).length > 0 ? (
                                            <div className="flex flex-col gap-0.5">
                                                {brainRegions
                                                    .filter(r =>
                                                        r.name.toLowerCase().includes(useBrainStore.getState().searchTerm.toLowerCase()) ||
                                                        r.latinName.toLowerCase().includes(useBrainStore.getState().searchTerm.toLowerCase())
                                                    )
                                                    .map(region => (
                                                        <button
                                                            key={region.id}
                                                            onClick={() => handleRegionSelect(region.id)}
                                                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                                            <div className="flex flex-col">
                                                                <span>{region.name}</span>
                                                                <span className="text-[9px] text-gray-400 font-light">{region.latinName}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-xs text-gray-400 italic">
                                                No matching structures found.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    
                                    <>
                                        {}
                                        {selectedCategory && (
                                            <div className="flex items-center gap-2 p-3 border-b border-black/5 bg-white/50">
                                                <button
                                                    onClick={() => setSelectedCategory(null)}
                                                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm text-gray-600">arrow_back</span>
                                                </button>
                                                <span className="text-xs font-semibold text-gray-700">{selectedCategory}</span>
                                            </div>
                                        )}

                                        <div className="overflow-y-auto custom-scrollbar p-1">
                                            {!selectedCategory ? (
                                                
                                                <div className="flex flex-col gap-0.5">
                                                    {uniqueCategories.map(category => (
                                                        <button
                                                            key={category}
                                                            onClick={() => setSelectedCategory(category)}
                                                            className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left group/item"
                                                        >
                                                            <span>{category}</span>
                                                            <span className="material-symbols-outlined text-[10px] opacity-0 group-hover/item:opacity-100 transition-opacity">chevron_right</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                
                                                <div className="flex flex-col gap-0.5">
                                                    {categoryRegions.map(region => (
                                                        <button
                                                            key={region.id}
                                                            onClick={() => handleRegionSelect(region.id)}
                                                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                                            <span>{region.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {}
            <div className="absolute bottom-8 right-24 md:right-32 z-20 flex items-center gap-2 pointer-events-auto">
                {!isUIHidden && (
                    <button
                        onClick={() => toggleRotation()}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 active:neumorphic-pressed shadow-md mr-6 ${isRotationEnabled
                            ? 'bg-primary text-white shadow-primary/30'
                            : 'bg-white/60 glass-panel text-gray-500 hover:text-primary'
                            }`}
                        title={isRotationEnabled ? "Pause Rotation" : "Move Freely"}
                    >
                        <span className="material-symbols-outlined text-xl">
                            accessibility_new
                        </span>
                    </button>
                )}

                {}
                <button
                    onClick={toggleUI}
                    className="px-6 py-2.5 bg-white/60 glass-panel rounded-full border border-white/20 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 hover:text-primary flex items-center gap-3 transition-all hover:scale-105 active:scale-95 active:neumorphic-pressed shadow-md"
                >
                    <span className="material-symbols-outlined text-base">
                        {isUIHidden ? 'visibility' : 'photo_camera'}
                    </span>
                    {isUIHidden ? 'Show UI' : 'Hide UI'}
                </button>
            </div>
        </>
    );
}
