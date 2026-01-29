import { useMemo } from 'react';
import { useBrainStore } from '../../store/useBrainStore';
import brainRegions from '../../data/brainRegions.json';
import pathologies from '../../data/pathologies.json';
import { motion, AnimatePresence } from 'framer-motion';


const IMPACT_COLORS = {
    high: { bg: 'bg-red-400/10', text: 'text-red-200', border: 'border-red-300/20' }, 
    medium: { bg: 'bg-yellow-300/10', text: 'text-yellow-200', border: 'border-yellow-200/20' }, 
    low: { bg: 'bg-orange-300/10', text: 'text-orange-200', border: 'border-orange-300/20' } 
};

export function Sidebar() {
    const {
        isSidebarOpen,
        selectedRegionId,
        activePathologyId,
        setPathology,
        selectRegion,
        searchTerm,
        toggleSidebar
    } = useBrainStore();

    
    const selectedRegion = useMemo(() =>
        brainRegions.find(r => r.id === selectedRegionId),
        [selectedRegionId]);

    const activePathology = useMemo(() =>
        pathologies.find(p => p.id === activePathologyId),
        [activePathologyId]);

    
    const hierarchy = useMemo(() => {
        const tree: Record<string, Record<string, Record<string, typeof pathologies>>> = {};

        
        const currentPathologies = searchTerm
            ? pathologies.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : pathologies;

        currentPathologies.forEach(pathology => {
            
            const main = pathology.mainCategory || 'Other';
            
            const sub = pathology.subCategory || 'General';
            
            const group = pathology.group || 'Miscellaneous';

            if (!tree[main]) tree[main] = {};
            if (!tree[main][sub]) tree[main][sub] = {};
            if (!tree[main][sub][group]) tree[main][sub][group] = [];

            tree[main][sub][group].push(pathology);
        });

        return tree;
    }, [searchTerm]);

    
    const sidebarVariants = {
        open: { width: "22rem" }, 
        closed: { width: "1.25rem" }
    };

    const contentVariants = {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10, transition: { duration: 0.1 } }
    };

    return (
        <motion.aside
            initial="closed"
            animate={isSidebarOpen ? "open" : "closed"}
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 h-screen z-30 pointer-events-auto flex flex-col shadow-2xl overflow-hidden glass-sidebar"
        >
            <AnimatePresence mode="wait">
                {!isSidebarOpen ? (
                    
                    <motion.div
                        key="collapsed"
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="h-full w-full flex flex-col justify-center"
                    >
                        <button
                            onClick={() => toggleSidebar(true)}
                            className="h-full w-full backdrop-blur-sm bg-black/20 border-r border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group relative"
                            title="Open Sidebar"
                        >
                            <span className="material-symbols-outlined text-white/90 text-[14px] group-hover:scale-125 transition-transform drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]">chevron_right</span>
                        </button>
                    </motion.div>
                ) : (
                    
                    <motion.div
                        key="open"
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="h-full w-full flex flex-col"
                    >
                        {(selectedRegion || activePathology) ? (
                            <DetailView
                                item={selectedRegion || activePathology}
                                isPathology={!!activePathology}
                                selectRegion={selectRegion}
                                setPathology={setPathology}
                            />
                        ) : (
                            <ListView
                                toggleSidebar={toggleSidebar}
                                hierarchy={hierarchy}
                                setPathology={setPathology}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    );
}


function DetailView({ item, isPathology, selectRegion, setPathology }: any) {
    return (
        <div className="flex flex-col h-full m-3 rounded-3xl overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={() => { selectRegion(null); setPathology(null); }}
                    className="text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    title="Back to Menu"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
            </div>

            <div className="p-4 relative border-b border-white/10 mt-6">
                <h2 className="text-xs font-sans font-semibold text-primary tracking-widest uppercase mb-2">
                    {isPathology ? (item.subCategory || 'Pathology') : 'Brain Structure'}
                </h2>
                <h1 className="text-2xl font-display text-white mb-1 leading-tight">
                    {item?.name}
                </h1>
                {isPathology && item.group && (
                    <p className="text-[10px] text-white/50 font-sans uppercase tracking-widest mt-1">
                        {item.group}
                    </p>
                )}
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">
                <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Description</h3>
                    <p className="text-sm text-white/80 font-sans leading-relaxed">
                        {item?.description}
                    </p>
                </section>

                {isPathology && item.affectedRegions && (
                    <section>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Affected Regions</h3>
                        <div className="flex flex-col gap-2">
                            {item.affectedRegions.map((region: any, i: number) => {
                                const rName = brainRegions.find(br => br.id === region.id)?.name || region.id;
                                
                                const style = IMPACT_COLORS[region.impact] || IMPACT_COLORS.low;

                                return (
                                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded border ${style.bg} ${style.border}`}>
                                        <span className={`text-xs font-medium ${style.text}`}>
                                            {rName}
                                        </span>
                                        <span className={`text-[10px] uppercase tracking-wider opacity-70 ${style.text}`}>
                                            {region.impact || 'Low'} Impact
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[9px] text-white/30 italic mt-2 text-right">
                            * Due to brain model limitations some areas might not be shown
                        </p>
                    </section>
                )}

                {item?.formattedReferences && (
                    <section>
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">References</h3>
                        <ul className="space-y-3">
                            {item.formattedReferences.map((ref: string, i: number) => (
                                <li key={i} className="text-[11px] text-white/60 font-sans leading-relaxed pl-2 border-l-2 border-white/10">
                                    {ref}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

function ListView({ toggleSidebar, hierarchy, setPathology }: any) {
    return (
        <div className="flex flex-col h-full m-3 rounded-3xl overflow-hidden relative">
            <button
                onClick={() => toggleSidebar(false)}
                className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                title="Collapse Sidebar"
            >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="p-6 pb-4 relative">
                <h2 className="text-xl font-sans font-bold text-white tracking-widest uppercase antialiased">
                    NeuroAtlas
                </h2>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar px-4 pb-6">
                <div className="flex flex-col gap-6">
                    {Object.entries(hierarchy).map(([mainCat, subCats]: any) => (
                        <div key={mainCat}>
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 pl-2 border-b border-white/10 pb-1">
                                {mainCat}
                            </h3>
                            <div className="flex flex-col gap-3">
                                {Object.entries(subCats).map(([subCat, groups]: any) => (
                                    <details key={subCat} className="group/sub" open>
                                        <summary className="flex items-center justify-between py-1.5 cursor-pointer list-none text-white/90 hover:text-white transition-colors">
                                            <span className="text-sm font-semibold font-sans">{subCat}</span>
                                            <span className="material-symbols-outlined text-xs opacity-50 group-open/sub:rotate-180 transition-transform">expand_more</span>
                                        </summary>
                                        <div className="ml-3 mt-1 pl-3 border-l border-white/10 flex flex-col gap-2 pt-1">
                                            {Object.entries(groups).map(([groupName, items]: any) => (
                                                <div key={groupName}>
                                                    {groupName !== 'Miscellaneous' && (
                                                        <h4 className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1 mt-1">
                                                            {groupName}
                                                        </h4>
                                                    )}
                                                    <div className="flex flex-col gap-1">
                                                        {items.map((item: any) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => setPathology(item.id)}
                                                                className="text-left py-1.5 px-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-all font-sans"
                                                            >
                                                                {item.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
