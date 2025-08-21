"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { loadSlim } from "@tsparticles/slim";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import RocketImg from "@/assets/Rocket.png";
import CoinImg from "@/assets/coin.jpg";

export default function SigninPage() {
  const [init, setInit] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

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

    // preload images
    const rocket = new Image();
    rocket.src = RocketImg.src;

    const coin = new Image();
    coin.src = CoinImg.src;

    rocketImgRef.current = rocket;
    coinImgRef.current = coin;
  }, []);

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
      ctx.fillStyle = "gray";
      obstacles.current.forEach((ob) => {
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      });
    }

    function drawCoins() {
        if (!ctx || !coinImgRef.current) return;
      coins.current.forEach((c) => {
        if (coinImgRef.current) {
          ctx.drawImage(coinImgRef.current, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
        }
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

      ctx.fillStyle = "white";
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
    <div className="min-h-screen flex relative overflow-hidden">
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
      <div className="w-1/3 bg-white z-10 flex flex-col justify-center px-8 py-10">
        <h2 className="text-3xl font-bold mb-6 text-black">Sign In</h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded-lg text-black focus:outline-none hover:ring-4 hover:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded-lg text-black hover:ring-4 hover:ring-green-500"
          />

          {/* OAuth */}
          <div className="flex space-x-4 justify-center mt-4">
            <button type="button" className="p-3 border rounded-full hover:bg-gray-200">
              <FaGoogle className="text-red-500" />
            </button>
            <button type="button" className="p-3 border rounded-full hover:bg-gray-200">
              <FaFacebook className="text-blue-600" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-6"
          >
            Sign In
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Don’t have an account?{" "}
            <a href="/signup" className="text-green-600 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>

      {/* Right Game Section */}
      <div className="w-2/3 z-10 flex items-center justify-center relative">
        <canvas ref={canvasRef} className="bg-transparent" />

        {!gameRunning && !gameOver && (
          <button
            onClick={() => {
              setGameRunning(true);
              runGameLoop();
            }}
            className="absolute bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700"
          >
            Start Game
          </button>
        )}

        {gameOver && (
          <div className="absolute flex flex-col items-center space-y-4">
            <h2 className="text-white text-2xl font-bold">
              Game Over! Score: {score} | Highscore: {highScore}
            </h2>
            <button
              onClick={() => {
                setGameRunning(true);
                runGameLoop();
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700"
            >
              Restart Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
