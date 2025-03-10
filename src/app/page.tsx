"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Scene
    const scene = new THREE.Scene();

    // Group
    const group = new THREE.Group();
    scene.add(group);
    group.rotateY(Math.PI / 2);

    // Geometry 1
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh1 = new THREE.Mesh(geometry, material);
    mesh1.position.set(1, 0, -2);
    mesh1.rotation.y = Math.PI;
    group.add(mesh1);

    // Geometry 2
    const geometry2 = new THREE.BoxGeometry(1, 2, 1);
    const material2 = new THREE.MeshBasicMaterial({
        color: "rgb(252, 126, 1)",
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.set(-1, 0, -2);
    group.add(mesh2);

    // Material

    // Camera
    const sizes = { width: 800, height: 600 };

    // Camera args- #1 = fov, #2 = aspect, #3 = near, #4 = far
    // Any objects closer than near, or further from far, won't show up

    const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        1,
        100
    );
    camera.position.z = 5;

    // AXES helper
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Animation

    // let time = Date.now();
    const clock = new THREE.Clock();

    const animate = () => {
        if (!canvasRef.current) return;

        // Updates transformation amount based on delta time  | makes transformations consistent across displays

        // ---Native way of animating frame based on delta time----
        // const currentTime = Date.now();
        // const deltaTime = currentTime - time;
        // time = currentTime;
        const elapsedTime = clock.getElapsedTime();

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
        });

        renderer.setSize(sizes.width, sizes.height);
        renderer.render(scene, camera);

        // Update rotation
        group.rotateY(0.01);

        mesh1.translateY(Math.sin(elapsedTime * Math.PI) * 0.1);
        mesh2.rotation.y += 0.001 * elapsedTime;

        camera.lookAt(mesh1.position);

        // Render
        renderer.render(scene, camera);

        // Request new frame
        requestAnimationFrame(animate);
    };

    // Render
    useEffect(() => {
        if (!canvasRef.current) return;
        animate();
    }, [canvasRef]);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1>Three.js project</h1>
                <canvas ref={canvasRef}></canvas>
            </main>
        </div>
    );
}
