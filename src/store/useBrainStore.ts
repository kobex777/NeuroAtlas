import { create } from 'zustand';

interface BrainStore {
    selectedRegionId: string | null;
    hoveredRegionId: string | null;
    activePathologyId: string | null;
    searchTerm: string;
    isSidebarOpen: boolean;
    isRotationEnabled: boolean;
    isUIHidden: boolean;


    selectRegion: (id: string | null) => void;
    setHoveredRegion: (id: string | null) => void;
    setPathology: (id: string | null) => void;
    setSearch: (term: string) => void;
    toggleSidebar: (isOpen?: boolean) => void;
    toggleRotation: () => void;
    toggleUI: () => void;
}

export const useBrainStore = create<BrainStore>((set) => ({
    selectedRegionId: null,
    hoveredRegionId: null,
    activePathologyId: null,
    searchTerm: '',
    isSidebarOpen: true,
    isRotationEnabled: false,
    isUIHidden: false,

    selectRegion: (id) => set({ selectedRegionId: id, activePathologyId: null, isSidebarOpen: !!id }),
    setHoveredRegion: (id) => set({ hoveredRegionId: id }),
    setPathology: (id) => set({ activePathologyId: id, selectedRegionId: null, isSidebarOpen: true }),
    setSearch: (term) => set({ searchTerm: term }),
    toggleSidebar: (isOpen) => set((state) => ({
        isSidebarOpen: isOpen !== undefined ? isOpen : !state.isSidebarOpen
    })),
    toggleRotation: () => set((state) => ({ isRotationEnabled: !state.isRotationEnabled })),
    toggleUI: () => set((state) => ({ isUIHidden: !state.isUIHidden })),
}));
