import { Request, Response } from "express";
import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// We need to import an external rate-limiting library and a regex validator.
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

// Define the number of salt rounds for bcrypt using an environment variable.
// We use a fallback value (10) if the environment variable is not set.
const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;

// Create a rate limiter for the signup endpoint.
// It allows a maximum of 5 requests per 15 minutes from the same IP address.
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many accounts created from this IP, please try again after an hour",
});

/**
 * Handles user signup by validating input, hashing the password,
 * creating a new user in the database, and generating a JWT for authentication.
 *
 * @param req - The request object containing user signup data.
 * @param res - The response object used to send back the desired HTTP response.
 * @returns A JSON response with user details and a JWT on success, or an error message on failure.
 *
 * @throws 400 - If any required fields are missing, the email format is invalid, or if the email/username already exists.
 * @throws 429 - If rate limiting is triggered.
 * @throws 500 - If there is a server error during the signup process.
 */
export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Use express-validator to validate the email format.
  await body("email").isEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // The rest of your existing logic for checking for missing fields
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Never return password!
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err: any) {
    if (err instanceof Error && (err as any).code === "P2002") {
      return res.status(400).json({ error: "Email or username already exists" });
    }
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
