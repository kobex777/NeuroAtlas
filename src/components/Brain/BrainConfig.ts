import * as THREE from 'three';

export const BRAIN_COLORS = {
    
    center: new THREE.Color('#ffffffff'),

    
    edge: new THREE.Color('#e0d8c8'),

    
    shade: new THREE.Color('#8c7e6e'),

    
    hover: {
        center: new THREE.Color('#d1e6f5'), 
        edge: new THREE.Color('#a3c2db'),   
    },

    
    selected: new THREE.Color('#a3c2db'), 
    pathology: new THREE.Color('#fc8181'), 

    
    impact: {
        high: new THREE.Color('#feb2b2'),   
        medium: new THREE.Color('#fef08a'), 
        low: new THREE.Color('#fed7aa'),    
    },
};

export const LIGHT_SETTINGS = {
    main: {
        position: new THREE.Vector3(0, 200, 600),
        intensity: 1.0,
    },
    back: {
        position: new THREE.Vector3(0, 200, -600),
        intensity: 1.0,
    }
};
