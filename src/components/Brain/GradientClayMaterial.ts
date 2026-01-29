import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { BRAIN_COLORS, LIGHT_SETTINGS } from './BrainConfig';

const GradientClayMaterial = shaderMaterial(
    {
        uColorCenter: BRAIN_COLORS.center,
        uColorEdge: BRAIN_COLORS.edge,
        uShadeColor: BRAIN_COLORS.shade,
        uLightPos: LIGHT_SETTINGS.main.position,
        uBackLightPos: LIGHT_SETTINGS.back.position,
        uNoiseScale: 2.0,
    },
    
    `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
    `,
    
    `
    uniform vec3 uColorCenter;
    uniform vec3 uColorEdge;
    uniform vec3 uShadeColor;
    uniform vec3 uLightPos;
    uniform vec3 uBackLightPos;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    
    float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition); 
        
        
        float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
        
        
        float gradientFactor = smoothstep(0.0, 1.0, fresnel); 
        gradientFactor = pow(gradientFactor, 1.5); 

        vec3 baseColor = mix(uColorCenter, uColorEdge, gradientFactor);

        
        float wrap = 0.5; 
        
        
        vec3 lightDir = normalize(uLightPos - vWorldPosition);
        float diffuseMain = max(0.0, (dot(normal, lightDir) + wrap) / (1.0 + wrap));
        
        
        vec3 backLightDir = normalize(uBackLightPos - vWorldPosition);
        float diffuseBack = max(0.0, (dot(normal, backLightDir) + wrap) / (1.0 + wrap));
        
        float totalLight = max(diffuseMain, diffuseBack);
        
        
        float shadowFactor = 1.0 - smoothstep(0.3, 1.0, totalLight);
        vec3 shadowedColor = mix(baseColor, uShadeColor, shadowFactor * 0.3); 

        vec3 finalColor = shadowedColor;

        
        float noise = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        finalColor += (noise - 0.5) * 0.05;

        gl_FragColor = vec4(finalColor, 1.0);
    }
    `
);

extend({ GradientClayMaterial });

export { GradientClayMaterial };
