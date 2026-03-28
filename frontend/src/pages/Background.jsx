import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Background() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.008);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
      targetRotation.y = mouse.x * 0.5;
      targetRotation.x = mouse.y * 0.3;
    };
    
    window.addEventListener("mousemove", handleMouseMove);

    // PARTICLE SYSTEM 1: SPIRAL GALAXY
    const spiralCount = 3000;
    const spiralGeometry = new THREE.BufferGeometry();
    const spiralPositions = new Float32Array(spiralCount * 3);
    const spiralColors = new Float32Array(spiralCount * 3);
    
    for (let i = 0; i < spiralCount; i++) {
      const t = i / spiralCount;
      const angle = t * Math.PI * 12;
      const radius = 3 + t * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 1.5;
      
      spiralPositions[i * 3] = x;
      spiralPositions[i * 3 + 1] = y;
      spiralPositions[i * 3 + 2] = z;
      
      // Rainbow colors
      const hue = (angle % (Math.PI * 2)) / (Math.PI * 2);
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      spiralColors[i * 3] = color.r;
      spiralColors[i * 3 + 1] = color.g;
      spiralColors[i * 3 + 2] = color.b;
    }
    
    spiralGeometry.setAttribute("position", new THREE.BufferAttribute(spiralPositions, 3));
    spiralGeometry.setAttribute("color", new THREE.BufferAttribute(spiralColors, 3));
    
    const spiralMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    const spiralSystem = new THREE.Points(spiralGeometry, spiralMaterial);
    scene.add(spiralSystem);

    // PARTICLE SYSTEM 2: FLOATING ORBS
    const orbCount = 150;
    const orbGeometry = new THREE.BufferGeometry();
    const orbPositions = new Float32Array(orbCount * 3);
    const orbVelocities = [];
    
    for (let i = 0; i < orbCount; i++) {
      orbPositions[i * 3] = (Math.random() - 0.5) * 15;
      orbPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      orbPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      orbVelocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      });
    }
    
    orbGeometry.setAttribute("position", new THREE.BufferAttribute(orbPositions, 3));
    
    const orbMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff44aa,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    const orbSystem = new THREE.Points(orbGeometry, orbMaterial);
    scene.add(orbSystem);
    
    const orbPosAttribute = orbGeometry.attributes.position;

    // PARTICLE SYSTEM 3: STARFIELD
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 25;
    }
    
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const starSystem = new THREE.Points(starGeometry, starMaterial);
    scene.add(starSystem);

    // GLOWING CORE
    const coreGeometry = new THREE.SphereGeometry(0.8, 64, 64);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.2,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);
    
    const coreLight = new THREE.PointLight(0xff6600, 1, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    
    // RINGS
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.05, 64, 500);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xff44aa,
      emissive: 0xff2288,
      emissiveIntensity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);
    
    const ring2Geometry = new THREE.TorusGeometry(2.2, 0.03, 64, 500);
    const ring2Material = new THREE.MeshStandardMaterial({
      color: 0x44aaff,
      emissive: 0x2288ff,
      emissiveIntensity: 0.4,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    scene.add(ring2);
    
    const ring3Geometry = new THREE.TorusGeometry(2.8, 0.04, 64, 500);
    const ring3Material = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xff8844,
      emissiveIntensity: 0.3,
    });
    const ring3 = new THREE.Mesh(ring3Geometry, ring3Material);
    ring3.rotation.x = Math.PI / 2;
    scene.add(ring3);
    
    // FLOATING SHAPES
    const shapes = [];
    const shapeColors = [0xff3366, 0x33ff66, 0x3366ff, 0xff6633, 0xff33ff];
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.DodecahedronGeometry(0.25),
      new THREE.OctahedronGeometry(0.35),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.BoxGeometry(0.4, 0.4, 0.4)
    ];
    
    for (let i = 0; i < 30; i++) {
      const geometry = shapeGeometries[i % shapeGeometries.length];
      const material = new THREE.MeshStandardMaterial({
        color: shapeColors[i % shapeColors.length],
        emissive: shapeColors[i % shapeColors.length],
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
      });
      const shape = new THREE.Mesh(geometry, material);
      shape.position.x = (Math.random() - 0.5) * 12;
      shape.position.y = (Math.random() - 0.5) * 8;
      shape.position.z = (Math.random() - 0.5) * 8 - 4;
      shape.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        speedZ: (Math.random() - 0.5) * 0.01,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
      };
      scene.add(shape);
      shapes.push(shape);
    }
    
    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 5, 3);
    scene.add(mainLight);
    
    const coloredLights = [];
    const lightColors = [0xff3366, 0x33ff66, 0x3366ff, 0xff6633];
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(lightColors[i], 0.5, 12);
      light.position.set(
        Math.sin(i * Math.PI * 2) * 4,
        Math.cos(i * Math.PI * 2) * 3,
        Math.sin(i * Math.PI) * 3
      );
      scene.add(light);
      coloredLights.push(light);
    }
    
    const rimLight = new THREE.PointLight(0xff66ff, 0.8);
    rimLight.position.set(-3, 2, -4);
    scene.add(rimLight);
    
    // ANIMATION
    let time = 0;
    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.008;
      
      // Camera movement based on mouse
      camera.position.x += (targetRotation.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-targetRotation.y * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      
      // Spiral rotation
      spiralSystem.rotation.y = time * 0.15;
      spiralSystem.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Update floating orbs
      const positions = orbPosAttribute.array;
      for (let i = 0; i < orbCount; i++) {
        positions[i * 3] += orbVelocities[i].x;
        positions[i * 3 + 1] += orbVelocities[i].y;
        positions[i * 3 + 2] += orbVelocities[i].z;
        
        if (Math.abs(positions[i * 3]) > 8) positions[i * 3] *= -0.9;
        if (Math.abs(positions[i * 3 + 1]) > 5) positions[i * 3 + 1] *= -0.9;
        if (Math.abs(positions[i * 3 + 2]) > 8) positions[i * 3 + 2] *= -0.9;
      }
      orbPosAttribute.needsUpdate = true;
      
      // Starfield rotation
      starSystem.rotation.y = time * 0.02;
      
      // Core pulsing
      const pulseScale = 1 + Math.sin(time * 8) * 0.05;
      core.scale.set(pulseScale, pulseScale, pulseScale);
      coreLight.intensity = 0.8 + Math.sin(time * 6) * 0.4;
      
      // Ring rotations
      ring.rotation.z = time * 0.5;
      ring.rotation.x = Math.sin(time * 0.3) * 0.2;
      ring2.rotation.y = time * 0.4;
      ring3.rotation.z = time * 0.3;
      
      // Animate shapes
      shapes.forEach((shape) => {
        shape.position.x += shape.userData.speedX;
        shape.position.y += shape.userData.speedY;
        shape.position.z += shape.userData.speedZ;
        shape.rotation.x += shape.userData.rotSpeedX;
        shape.rotation.y += shape.userData.rotSpeedY;
        shape.rotation.z += shape.userData.rotSpeedZ;
        
        if (Math.abs(shape.position.x) > 7) shape.userData.speedX *= -1;
        if (Math.abs(shape.position.y) > 5) shape.userData.speedY *= -1;
        if (Math.abs(shape.position.z) > 6) shape.userData.speedZ *= -1;
      });
      
      // Animate colored lights
      coloredLights.forEach((light, index) => {
        const angle = time * 0.8 + (index * Math.PI * 2) / coloredLights.length;
        light.position.x = Math.sin(angle) * 4.5;
        light.position.z = Math.cos(angle) * 4;
        light.position.y = Math.sin(angle * 1.5) * 2.5;
        light.intensity = 0.5 + Math.sin(time * 2 + index) * 0.3;
      });
      
      rimLight.position.x = Math.sin(time * 0.7) * 3;
      rimLight.position.z = Math.cos(time * 0.5) * 4;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  return <div ref={mountRef} className="threeBgPremium"></div>;
}