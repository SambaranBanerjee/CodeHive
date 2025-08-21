"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

export default function LandingPage() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // load the slim engine
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0"
          options={{
            background: { color: "#0d0d0d" },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: true, mode: "push" },
                resize: { enable: true },
              },
              modes: {
                repulse: { distance: 100, duration: 0.4 },
                push: { quantity: 3 },
              },
            },
            particles: {
              color: { value: "#00ffcc" },
              links: {
                color: "#00ffcc",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              move: { enable: true, speed: 2, outModes: { default: "bounce" } },
              number: { value: 60, density: { enable: true, width: 800, height: 800 } },
              opacity: { value: 0.6 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )}

      {/* Page Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl font-bold mb-6 text-[#00ffcc] drop-shadow-[0_0_15px_#00ffcc]">
          Welcome to CodeHive
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Collaborate, create, and discover amazing projects with your team.
        </p>
        <div className="flex space-x-4 justify-center">
          <a
            href="/signup"
            className="px-6 py-3 rounded-lg border border-white text-white hover:bg-white hover:text-black transition"
          >
            Get Started
          </a>
          <a
            href="/signin"
            className="px-6 py-3 rounded-lg bg-[#00ffcc] text-black hover:bg-[#00ffcc] hover:text-white transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
