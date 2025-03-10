"use client";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use refs to store persistent Three.js objects or values.
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    // Texture LoaderRef
    const loaderRef = useRef<THREE.TextureLoader | null>(null);

    // Keep track of the animation frame ID for cancellation
    const animationFrameRef = useRef<number | null>(null);

    // Keep track of the clock so it doesn't get re-instantiated on every render
    const clockRef = useRef(new THREE.Clock());

    // We'll store the current size in state, so resizing triggers re-render
    const [size, setSize] = useState({ width: 0, height: 0 });

    // ----- Initialize Scene, Camera, Renderer (only once) -----
    useEffect(() => {
        // Create scene
        sceneRef.current = new THREE.Scene();

        // Create camera
        cameraRef.current = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            100
        );
        cameraRef.current.position.z = 5;

        // Create renderer
        rendererRef.current = new THREE.WebGLRenderer({
            canvas: canvasRef.current!,
        });
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        // Set pixel ratio for performance and sharpness
        rendererRef.current.setPixelRatio(window.devicePixelRatio);

        // Texture Loader
        loaderRef.current = new THREE.TextureLoader();
        const materialTexture = loaderRef.current.load(
            "/Wood048_1K-JPG/Wood048_1K-JPG_Color.jpg"
        );
        // Set texture tiling (scaling)
        materialTexture.wrapS = THREE.RepeatWrapping; // Enable repeat horizontally
        materialTexture.wrapT = THREE.RepeatWrapping; // Enable repeat vertically
        materialTexture.repeat.set(5, 5); // Scale the texture (2x tiling in both directions)

        // The minFilter property determines how a texture is filtered when it appears smaller than its original size (due to distance from the camera, or when applied to a small object).
        // If mipmaps are disabled, the texture appears jagged, pixelated, or aliased when scaled down.
        materialTexture.minFilter = THREE.LinearFilter; // Linear filtering
        materialTexture.generateMipmaps = false; // Disable mipmaps (Bruno says disable it when using .minFilter = THREE.LinearFilter) because midmaps are not used when that filter is used

        const materialNormalMap = loaderRef.current.load(
            "/Wood048_1K-JPG/Wood048_1K-JPG_NormalGL.jpg"
        );
        const roughnessMap = loaderRef.current.load(
            "/Wood048_1K-JPG/Wood048_1K-JPG_Roughness.jpg"
        );

        // Add basic objects
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            map: materialTexture,
            normalMap: materialNormalMap,
            roughnessMap: roughnessMap,
        });
        const mesh = new THREE.Mesh(geometry, material);
        sceneRef.current.add(mesh);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft global light
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        sceneRef.current.add(directionalLight);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(3);
        sceneRef.current.add(axesHelper);

        // OrbitControls
        controlsRef.current = new OrbitControls(
            cameraRef.current,
            canvasRef.current!
        );
        controlsRef.current.enableDamping = true;

        // Initialize size in state
        setSize({ width: window.innerWidth, height: window.innerHeight });

        // Cleanup on unmount
        return () => {
            // Cancel any running animation when the component unmounts
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            rendererRef.current?.dispose();
        };
    }, []);

    // ----- Handle Animation Loop -----
    const animate = () => {
        // Request the next frame
        animationFrameRef.current = requestAnimationFrame(animate);

        if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
            return;

        // Update OrbitControls (especially if damping is enabled)
        controlsRef.current?.update();

        // Render the scene
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // ----- Handle Window Resize -----
    const resizeHandler = () => {
        // Cancel any active animation frame to avoid multiple loops
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Update size in state
        setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Attach resize listener once
    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    // ----- Re-run any time size changes -----
    useEffect(() => {
        if (!rendererRef.current || !cameraRef.current) return;

        // Update camera aspect and renderer size
        cameraRef.current.aspect = size.width / size.height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(size.width, size.height);

        // Start animation (unless width/height is zero)
        if (size.width > 0 && size.height > 0) {
            animate();
        }
    }, [size]);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start fixed top-0 left-0 w-screen h-screen">
                <canvas ref={canvasRef} className="cursor-grab"></canvas>
            </main>
        </div>
    );
}
