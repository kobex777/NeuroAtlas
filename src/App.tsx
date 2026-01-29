
import { Loader } from './components/UI/Loader';
import { Scene } from './components/Brain/Scene';
import { Sidebar } from './components/UI/Sidebar';
import { Header } from './components/UI/Header';
import { Overlay } from './components/UI/Overlay';
import { useBrainStore } from './store/useBrainStore';

function App() {
    const isUIHidden = useBrainStore(state => state.isUIHidden);

    return (
        <div className="relative w-full h-screen bg-deep-charcoal overflow-hidden">
            <Loader />
            { }
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Scene />
            </div>

            { }
            <div className="relative z-10 w-full h-full pointer-events-none">
                {!isUIHidden && (
                    <>
                        <Sidebar />
                        <Header />
                    </>
                )}
                <Overlay />
            </div>
        </div>
    );
}

export default App;
