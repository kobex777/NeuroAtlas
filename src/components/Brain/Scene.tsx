import { Canvas, useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Vignette, Noise, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { GradientClayMaterial } from './GradientClayMaterial';
import { easing } from 'maath';
import { useBrainStore } from '../../store/useBrainStore';
import { BRAIN_COLORS } from './BrainConfig';

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';


const BACKGROUND_COLOR = '#b0b0b0';
const NOISE_OPACITY = 0.8;


import brainRegions from '../../data/brainRegions.json';
import pathologies from '../../data/pathologies.json';

function BrainModel() {
    // Configure Draco loader
    useGLTF.preload('/brain.glb', true)
    const { scene } = useGLTF('/brain.glb', true) as any;
    const {
        hoveredRegionId,
        selectedRegionId,
        activePathologyId,
        setHoveredRegion,
        selectRegion
    } = useBrainStore();


    const baseMaterial = useMemo(() => {
        return new GradientClayMaterial();
    }, []);


    const getRegionIdFromMeshName = (meshName: string) => {
        const region = brainRegions.find(r => meshName.includes(r.id));
        return region ? region.id : null;
    };


    const getRegionImpact = (id: string | null) => {
        if (!id) return null;
        if (activePathologyId) {
            const pathology = pathologies.find(p => p.id === activePathologyId);
            const affected = pathology?.affectedRegions?.find((r: any) => r.id === id);
            return affected ? affected.impact : null;
        }
        return null;
    };

    const isRegionHighlighted = (id: string | null) => {
        if (!id) return false;
        if (selectedRegionId) {
            return selectedRegionId === id;
        }
        return !!getRegionImpact(id);
    };

    const isRegionDimmed = (id: string | null) => {
        if (!id) return false;
        if (activePathologyId) {
            return !getRegionImpact(id);
        }
        if (selectedRegionId) {
            return selectedRegionId !== id;
        }
        return false;
    };

    useEffect(() => {
        scene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {

                if (child.geometry && !child.userData.hasSmoothed) {
                    try {
                        child.geometry.deleteAttribute('normal');
                        child.geometry = BufferGeometryUtils.mergeVertices(child.geometry);
                        child.geometry.computeVertexNormals();
                        child.userData.hasSmoothed = true;
                    } catch (e) {
                        console.warn("Could not smooth geometry:", e);
                    }
                }

                child.material = baseMaterial.clone();
                child.castShadow = true;
                child.receiveShadow = true;


                const regionId = getRegionIdFromMeshName(child.name);
                child.userData.regionId = regionId;
            }
        });
    }, [scene, baseMaterial]);

    useFrame((_state, delta) => {
        scene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
                const regionId = child.userData.regionId;

                const isHovered = regionId !== null && regionId === hoveredRegionId;
                const impact = getRegionImpact(regionId);
                const isHighlighted = isRegionHighlighted(regionId);
                let isDimmed = isRegionDimmed(regionId);


                if (regionId === null && (activePathologyId || selectedRegionId)) {
                    isDimmed = true;
                }

                let targetCenter = BRAIN_COLORS.center;
                let targetEdge = BRAIN_COLORS.edge;

                if (isHighlighted) {
                    if (activePathologyId && impact) {

                        const color = BRAIN_COLORS.impact[impact as keyof typeof BRAIN_COLORS.impact] || BRAIN_COLORS.impact.low;
                        targetCenter = color;
                        targetEdge = color;
                    } else {

                        targetCenter = BRAIN_COLORS.selected;
                        targetEdge = BRAIN_COLORS.selected;
                    }
                } else if (isDimmed) {
                    targetCenter = new THREE.Color('#e0e0e0');
                    targetEdge = new THREE.Color('#d6d6d6');
                }

                if (isHovered && !isHighlighted) {
                    targetCenter = BRAIN_COLORS.hover.center;
                    targetEdge = BRAIN_COLORS.hover.edge;
                }


                easing.dampC(child.material.uColorCenter, targetCenter, 0.25, delta);

                easing.dampC(child.material.uColorEdge, targetEdge, 0.25, delta);
            }
        });
    });

    return (
        <primitive
            object={scene}
            scale={[2, 2, 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                if (e.object && e.object.userData.regionId) {
                    setHoveredRegion(e.object.userData.regionId);
                    document.body.style.cursor = 'pointer';
                }
            }}
            onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredRegion(null);
                document.body.style.cursor = 'auto';
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (e.object && e.object.userData.regionId) {

                    if (selectedRegionId === e.object.userData.regionId) {
                        selectRegion(null);
                    } else {
                        selectRegion(e.object.userData.regionId);
                    }
                } else {
                    selectRegion(null);
                }
            }}
            onPointerMissed={() => selectRegion(null)}
        />
    );
}

function CameraRig() {
    const { selectedRegionId, activePathologyId } = useBrainStore();
    const { scene } = useThree();
    const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
    const cameraPos = useMemo(() => new THREE.Vector3(0, 200, 600), []);
    const isFocusing = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {

        if (selectedRegionId || activePathologyId) {
            isFocusing.current = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
                isFocusing.current = false;
            }, 1000);
        } else {

            isFocusing.current = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
                isFocusing.current = false;
            }, 1000);

            target.set(0, 0, 0);
            cameraPos.set(0, 200, 600);
            return;
        }

        const meshesToFocus: THREE.Object3D[] = [];

        scene.traverse((obj) => {
            if (!obj.userData?.regionId) return;

            if (selectedRegionId && obj.userData.regionId === selectedRegionId) {
                meshesToFocus.push(obj);
            } else if (activePathologyId) {
                const pathology = pathologies.find(p => p.id === activePathologyId);
                const isAffected = pathology?.affectedRegions?.some((r: any) => r.id === obj.userData.regionId);
                if (isAffected) {
                    meshesToFocus.push(obj);
                }
            }
        });

        if (meshesToFocus.length > 0) {
            const box = new THREE.Box3();
            meshesToFocus.forEach(mesh => {
                box.expandByObject(mesh);
            });

            box.getCenter(target);


            const direction = target.clone().normalize();
            if (direction.lengthSq() < 0.001) {
                direction.set(0, 0, 1);
            }


            const distance = 450;
            cameraPos.copy(direction.multiplyScalar(distance));
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [selectedRegionId, activePathologyId, scene, target, cameraPos]);

    useFrame((state, delta) => {
        if (!isFocusing.current) return;

        const controls = state.controls as any;
        if (controls && controls.target) {

            easing.damp3(controls.target, target, 0.25, delta);

            easing.damp3(state.camera.position, cameraPos, 0.25, delta);
        }
    });

    return null;
}

export function Scene() {
    const { selectedRegionId, isRotationEnabled } = useBrainStore();

    return (
        <div className="w-full h-full relative z-10">
            <Canvas
                camera={{ position: [0, 0, 600], fov: 45 }}
                shadows
                gl={{
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 0.6,
                    powerPreference: "high-performance",
                    antialias: false,
                    stencil: false,
                    depth: true
                }}
            >
                { }
                <hemisphereLight
                    color={'#f5faff'}
                    groundColor={'#c4b7a6'}
                    intensity={0.5}
                />

                { }
                <directionalLight
                    position={[0, 200, 600]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-bias={-0.0001}
                    shadow-radius={10}
                />

                { }
                <directionalLight
                    position={[0, -200, 600]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-bias={-0.0001}
                    shadow-radius={10}
                />

                { }
                <directionalLight
                    position={[0, 200, -600]}
                    intensity={1.0}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-bias={-0.0001}
                    shadow-radius={10}
                />

                { }
                <color attach="background" args={[BACKGROUND_COLOR]} />
                <fog attach="fog" args={[BACKGROUND_COLOR, 500, 1500]} />

                { }
                <BrainModel />

                { }
                <CameraRig />

                { }
                <AdaptiveDpr pixelated />
                <AdaptiveEvents />

                { }
                <OrbitControls
                    makeDefault
                    enablePan={false}
                    enableZoom={true}
                    minDistance={200}
                    maxDistance={850}
                    autoRotate={isRotationEnabled && !selectedRegionId}
                    autoRotateSpeed={0.5}
                />

                { }
                <EffectComposer enableNormalPass>
                    <>
                        { }
                        <SSAO
                            radius={0.4}
                            intensity={70}
                            luminanceInfluence={0.6}
                            color={new THREE.Color('#4a2c0f')}
                            worldDistanceThreshold={1.0}
                            worldDistanceFalloff={0.1}
                            worldProximityThreshold={1.0}
                            worldProximityFalloff={0.1}
                        />

                        { }
                        <Noise opacity={NOISE_OPACITY} premultiply />

                        { }
                        <Vignette eskil={false} offset={0.1} darkness={0.9} />
                    </>
                </EffectComposer>
            </Canvas>
        </div>
    );
}
