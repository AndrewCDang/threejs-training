"use client";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { OrbitControls } from "three/examples/jsm/Addons.js";

function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    const animationFrameRef = useRef<number | null>(null);

    const [size, setSize] = useState({ width: 0, height: 0 });

    // Sets size
    useEffect(() => {
        sceneRef.current = new THREE.Scene();
        cameraRef.current = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        cameraRef.current.position.z = 5;
        rendererRef.current = new THREE.WebGLRenderer({
            canvas: canvasRef.current!,
        });

        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);

        // Object created from random array points

        const geometry = new THREE.BufferGeometry();
        const points = 50;
        const arrayPoints = new Float32Array(points * 3 * 3);

        for (let i = 0; i < points * 3 * 3; i++) {
            arrayPoints[i] = (Math.random() - 0.5) * 3;
        }
        const positionsAttribute = new THREE.BufferAttribute(arrayPoints, 3);
        geometry.setAttribute("position", positionsAttribute);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        sceneRef.current.add(mesh);

        // OrbitControls
        controlsRef.current = new OrbitControls(
            cameraRef.current,
            canvasRef.current!
        );
        controlsRef.current.enableDamping = true;

        setSize({ width: window.innerWidth, height: window.innerHeight });

        return () => {
            // Cancel any running animation when the component unmounts
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            rendererRef.current?.dispose();
        };
    }, []);

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

    useEffect(() => {
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

export default Page;

// Breaking Down the Float32Array Structure

// Each point (vertex) in 3D space consists of 3 values:
// coordinate = [x, y, z]; // (x, y, z) position

// Since each triangle requires 3 vertices, a single triangle is represented as:
// triangle = [x1, y1, z1, x2, y2, z2, x3, y3, z3];

// Thus, the full Float32Array consists of multiple triangle arrays stacked together:
// Float32Array = [...triangle1, ...triangle2, ...triangle3, ...triangle4, ...]; // and so on
// Float32Array = [
//     x1, y1, z1, x2, y2, z2, x3, y3, z3,  // Triangle 1
//     x4, y4, z4, x5, y5, z5, x6, y6, z6,  // Triangle 2
//     x7, y7, z7, x8, y8, z8, x9, y9, z9,  // Triangle 3
//     ...
// ];
