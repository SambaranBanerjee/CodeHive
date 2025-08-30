/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { loadSlim } from "@tsparticles/slim";
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaRocket } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SigninData {
  email: string;
  password: string;
}

export default function SigninPage() {
  const router = useRouter();
  const [init, setInit] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [formData, setFormData] = useState<SigninData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  // game state refs
  const rocketX = useRef(0);
  const rocketY = useRef(0);
  const obstacles = useRef<{ x: number; y: number; w: number; h: number }[]>([]);
  const coins = useRef<{ x: number; y: number; r: number }[]>([]);
  const frame = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const scoreRef = useRef(0);

  const rocketImgRef = useRef<HTMLImageElement | null>(null);
  const coinImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));

    // Check if backend is running
    checkBackendStatus();
    
    // Create rocket image
    const rocket = new Image();
    rocket.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%2300ffcc' d='M156.6 384.9L125.7 354c-8.5-8.5-11.5-20.8-7.7-32.2c3-8.9 7-20.5 11.8-33.8L24 288c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3l82.3 0c58.5 0 105.3 49.7 97.2 108.2c-1.5 10.8-4.4 21.1-8.4 30.9l-4.8 11.3c-10.5 24.8-21.9 47.9-33.5 67.4c89.6 39.6 154.7 97.2 185.7 153.6c5.7 10.2 5.2 22.8-1.3 32.5s-16.9 15.3-28.3 15.3c-80.7 0-156.1-42.7-199.7-112.1c-8.1-13-16.9-27.4-26.2-42.9l-31.3-52.2c-5.7-9.5-15.3-15.5-25.9-15.5c-12.8 0-23.8 8.7-27.7 20.2c-2.3 6.6-4.9 14.1-7.7 22.1l-33.3 79.8c-3.8 9.1-12.4 15.2-22.1 15.2c-5.9 0-11.7-2.2-16-6.2l-46.5-46.5C144.5 468.7 130 512 80 512c-26.5 0-48-21.5-48-48c0-41.9 47.2-70.8 92.8-70.8c9.9 0 20.2 1.2 30.7 3.5l41.1 41.1c8 8 20.2 9.4 29.5 3.5c8.2-5.2 17.6-10.9 27.5-16.9c18.7-11.5 38.8-24.2 58.4-36.6l-44.4-44.4z'/%3E%3C/svg%3E";
    
    // Create coin image
    const coin = new Image();
    coin.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23FFD700' d='M0 256C0 114.6 114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256S0 397.4 0 256zM256 464c-114.9 0-208-93.1-208-208S141.1 48 256 48s208 93.1 208 208s-93.1 208-208 208zM192 144c0-26.5 21.5-48 48-48s48 21.5 48 48l0 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H288v48c0 17.7-14.3 32-32 32s-32-14.3-32-32V240H192c-17.7 0-32-14.3-32-32s14.3-32 32-32h32V144z'/%3E%3C/svg%3E";
    
    rocketImgRef.current = rocket;
    coinImgRef.current = coin;

    // Clean up animation frame on unmount
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  const checkBackendStatus = async () => {
    try {
      setBackendStatus("checking");
      const response = await fetch("http://localhost:5000/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200 || response.status === 404) {
        // Even if we get a 404, it means the server is running
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch (error) {
      setBackendStatus("offline");
      console.error("Backend is not running:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (backendStatus === "offline") {
      setError("Backend server is offline. Please make sure it's running on port 5000.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Try the most common endpoint patterns
      const endpoints = [
        "/api/auth/login"
      ];
      
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store token and redirect to dashboard
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
            return;
          }
          
          if (response.status === 401) {
            const data = await response.json();
            throw new Error(data.message || "Invalid email or password");
          }
          
          if (response.status !== 404) {
            const data = await response.json();
            throw new Error(data.message || `Server error: ${response.status}`);
          }
          
        } catch (err: any) {
          lastError = err;
          // Continue to next endpoint if this one failed
          continue;
        }
      }
      
      // If we've tried all endpoints and none worked
      if (lastError) {
        throw lastError;
      } else {
        throw new Error("No valid signin endpoint found. Please check your backend routes.");
      }
      
    } catch (err: any) {
      setError(err.message || "An error occurred during signin. Please check if your backend is running and has the correct endpoints.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 game loop logic (same as SignupPage)
  const runGameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight;

    const rocketWidth = 50;
    const rocketHeight = 50;
    const rocketSpeed = 7;

    rocketX.current = canvas.width / 2;
    rocketY.current = canvas.height - 120;
    obstacles.current = [];
    coins.current = [];
    frame.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);

    function drawRocket() {
        if (!ctx) return;
      if (rocketImgRef.current) {
        ctx.drawImage(
          rocketImgRef.current,
          rocketX.current - rocketWidth / 2,
          rocketY.current,
          rocketWidth,
          rocketHeight
        );
      }
    }

    function drawObstacles() {
        if (!ctx) return;
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
      obstacles.current.forEach((ob) => {
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      });
    }

    function drawCoins() {
        if (!ctx || !coinImgRef.current) return;
      coins.current.forEach((c) => {
        ctx.drawImage(coinImgRef.current!, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      });
    }

    function checkCollision() {
      const rocketBox = {
        x: rocketX.current - rocketWidth / 2,
        y: rocketY.current,
        w: rocketWidth,
        h: rocketHeight,
      };

      for (const ob of obstacles.current) {
        if (
          rocketBox.x < ob.x + ob.w &&
          rocketBox.x + rocketBox.w > ob.x &&
          rocketBox.y < ob.y + ob.h &&
          rocketBox.y + rocketBox.h > ob.y
        ) {
          return true;
        }
      }
      return false;
    }

    function checkCoinCollection() {
      const rocketBox = {
        x: rocketX.current - rocketWidth / 2,
        y: rocketY.current,
        w: rocketWidth,
        h: rocketHeight,
      };

      coins.current = coins.current.filter((c) => {
        const collected =
          rocketBox.x < c.x + c.r &&
          rocketBox.x + rocketBox.w > c.x - c.r &&
          rocketBox.y < c.y + c.r &&
          rocketBox.y + rocketBox.h > c.y - c.r;

        if (collected) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          return false;
        }
        return true;
      });
    }

    function update() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars in background
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          1,
          1
        );
      }

      // Move rocket
      if (keys.current["ArrowLeft"] || keys.current["a"]) {
        rocketX.current -= rocketSpeed;
      }
      if (keys.current["ArrowRight"] || keys.current["d"]) {
        rocketX.current += rocketSpeed;
      }

      if (rocketX.current < rocketWidth / 2) rocketX.current = rocketWidth / 2;
      if (rocketX.current > canvas.width - rocketWidth / 2)
        rocketX.current = canvas.width - rocketWidth / 2;

      drawRocket();

      // Spawn obstacles
      if (frame.current % 100 === 0) {
        obstacles.current.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          w: 30,
          h: 30,
        });
      }

      // Spawn coins
      if (frame.current % 150 === 0) {
        coins.current.push({
          x: Math.random() * (canvas.width - 20) + 20,
          y: -30,
          r: 15,
        });
      }

      // Move + filter
      obstacles.current.forEach((ob) => (ob.y += 4));
      obstacles.current = obstacles.current.filter((ob) => ob.y < canvas.height);

      coins.current.forEach((c) => (c.y += 3));
      coins.current = coins.current.filter((c) => c.y < canvas.height);

      drawObstacles();
      drawCoins();

      if (checkCollision()) {
        setGameOver(true);
        setGameRunning(false);
        setHighScore((prev) => Math.max(prev, scoreRef.current));
        return;
      }

      checkCoinCollection();

      ctx.fillStyle = "#00ffcc";
      ctx.font = "20px Arial";
      ctx.fillText(`Highscore: ${highScore}`, canvas.width - 180, 30);
      ctx.fillText(`Score: ${scoreRef.current}`, canvas.width - 180, 60);

      frame.current++;
      animationId.current = requestAnimationFrame(update);
    }

    animationId.current = requestAnimationFrame(update);
  }, [highScore]);

  // key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-900">
      {/* Particles Background */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          options={{
            background: { color: "#0d0d0d" },
            fpsLimit: 60,
            particles: {
              color: { value: "#00ffcc" },
              links: { color: "#00ffcc", distance: 150, enable: true },
              move: { enable: true, speed: 2 },
              number: { value: 50 },
              opacity: { value: 0.5 },
              size: { value: { min: 1, max: 3 } },
            },
          }}
        />
      )}

      {/* Left Signin Section */}
      <div className="w-full md:w-1/3 bg-white z-10 flex flex-col justify-center px-8 py-10">
        <div className="flex items-center justify-center mb-6">
          <FaRocket className="text-green-600 text-4xl mr-2" />
          <h1 className="text-3xl font-bold text-black">CodeHive</h1>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-black text-center">Welcome Back</h2>
        
        {/* Backend status indicator */}
        <div className={`mb-4 p-2 rounded-lg text-center text-sm ${
          backendStatus === "online" ? "bg-green-100 text-green-700" : 
          backendStatus === "offline" ? "bg-red-100 text-red-700" : 
          "bg-blue-100 text-blue-700"
        }`}>
          {backendStatus === "online" ? "✓ Backend connected" : 
           backendStatus === "offline" ? "✗ Backend offline" : 
           "Checking backend connection..."}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-4 focus:ring-green-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full border px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-4 focus:ring-green-500 transition-all pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || backendStatus === "offline"}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : backendStatus === "offline" ? "Backend Offline" : "Sign In"}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <button
            type="button"
            className="p-3 border rounded-full hover:bg-gray-100 transition-all flex items-center justify-center w-12 h-12"
          >
            <FaGoogle className="text-red-500 text-lg" />
          </button>
          <button
            type="button"
            className="p-3 border rounded-full hover:bg-gray-100 transition-all flex items-center justify-center w-12 h-12"
          >
            <FaFacebook className="text-blue-600 text-lg" />
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-green-600 hover:underline font-medium">
            Sign Up
          </a>
        </p>
      </div>

      {/* Right Game Section */}
      <div className="hidden md:flex md:w-2/3 z-10 items-center justify-center relative">
        <canvas ref={canvasRef} className="bg-transparent" />

        {/* Game Instructions */}
        {!gameRunning && !gameOver && (
          <div className="absolute bg-black bg-opacity-70 p-6 rounded-lg text-center max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">Rocket Game</h3>
            <p className="text-gray-300 mb-2">Use ← → arrow keys or A/D to move</p>
            <p className="text-gray-300 mb-4">Collect coins and avoid obstacles!</p>
            <button
              onClick={() => {
                setGameRunning(true);
                runGameLoop();
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all"
            >
              Start Game
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute flex flex-col items-center space-y-4 bg-black bg-opacity-70 p-6 rounded-lg">
            <h2 className="text-white text-2xl font-bold text-center">
              Game Over!<br />
              Score: {score} | Highscore: {highScore}
            </h2>
            <button
              onClick={() => {
                setGameRunning(true);
                runGameLoop();
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}