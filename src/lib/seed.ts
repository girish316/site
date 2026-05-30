// Run this script once to seed your Firebase with sample data.
// Usage: npx ts-node -r tsconfig-paths/register src/lib/seed.ts
// Or paste individual sections into a browser console after auth.

import { db } from "./firebase";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";

export const SEED_PROJECTS = [
  {
    name: "AutonomNav-ROS2", slug: "autonomnav-ros2",
    category: "robotics", featured: true, order: 1,
    description: "Full-stack autonomous navigation for differential-drive robots. Custom SLAM, obstacle avoidance with LIDAR + depth camera fusion, real-time path planning on NVIDIA Jetson.",
    stack: ["C++","ROS2","Python","SLAM","OpenCV","Jetson Orin"],
    metrics: [{ val: "22ms", label: "Loop Time" }, { val: "98.3%", label: "Obstacle Avoid." }],
    githubUrl: "https://github.com", challenges: "Sensor fusion latency was the biggest hurdle — we had LIDAR running at 20Hz but the camera at 30Hz, requiring careful timestamp interpolation.",
    outcomes: "Successfully demonstrated at UofT Robotics Competition, placing 2nd overall.",
  },
  {
    name: "NeuralDiff Engine", slug: "neuraldiff-engine",
    category: "ai", featured: true, order: 2,
    description: "Differentiable physics simulation layer for training robot policies end-to-end. Custom autodiff kernels in CUDA, 40× faster gradient computation than JAX baselines.",
    stack: ["CUDA","PyTorch","C++","Python","JAX"],
    metrics: [{ val: "40×", label: "Speedup" }, { val: "2.1M", label: "Parameters" }],
    githubUrl: "https://github.com",
  },
  {
    name: "MindBridge", slug: "mindbridge",
    category: "hackathon", featured: true, order: 3,
    description: "EEG-to-text real-time transcription built in 36 hours at HackMIT. BCI using consumer-grade headsets + transformer decoder. Won Best Hardware Hack.",
    stack: ["Python","MNE","Transformers","React","WebSockets"],
    metrics: [{ val: "36h", label: "Build Time" }, { val: "1st", label: "HW Prize" }],
    githubUrl: "https://github.com",
  },
  {
    name: "DistributedFS", slug: "distributedfs",
    category: "systems", featured: false, order: 4,
    description: "Fault-tolerant distributed file system implementing Raft consensus. Leader election, log replication, linearizable reads across 5-node clusters. Built from scratch in Go.",
    stack: ["Go","Raft","gRPC","Docker","Linux"],
    metrics: [{ val: "99.9%", label: "Uptime" }, { val: "5-node", label: "Cluster" }],
    githubUrl: "https://github.com",
  },
];

export const SEED_TIMELINE = [
  { order: 1, date: "Sep 2024 – Present", event: "CS & AI Double Major", place: "University of Toronto", description: "Focusing on systems, computer vision, and ML theory.", tag: "Education", color: "cyan" },
  { order: 2, date: "Summer 2024", event: "Software Engineering Intern", place: "Cohere AI, Toronto", description: "Worked on inference optimization. Reduced p99 latency by 35% through CUDA kernel development.", tag: "Internship", color: "purple" },
  { order: 3, date: "Jan 2024", event: "🥇 1st Place — HackMIT", place: "MIT, Cambridge MA", description: "Built MindBridge in 36 hours. Won Best Hardware Hack out of 400+ teams.", tag: "Hackathon", color: "pink" },
  { order: 4, date: "Sep 2023", event: "Robotics Team Lead", place: "UofT Robotics Club", description: "Leading 12-person team building an autonomous rover for the Canadian Robotics Competition.", tag: "Leadership", color: "neon" },
  { order: 5, date: "Summer 2023", event: "Research Assistant", place: "Toronto Robotics Institute", description: "Differentiable simulation pipeline for robot policy learning. Co-authored paper on sim-to-real transfer.", tag: "Research", color: "cyan" },
];

export const SEED_EXPERIMENTS = [
  { name: "Neural Radiance Arm", status: "active", statusLabel: "Building", thought: "What if a robot arm could reconstruct 3D scenes with NeRF and plan grasps in the learned latent space?", tags: ["NeRF","RL","PyTorch","ROS2"], progress: 35, order: 1 },
  { name: "Mesh OS", status: "active", statusLabel: "Designing", thought: "Distributed OS where every laptop becomes a compute node. CRDT-based state sync, zero-config mesh networking.", tags: ["Go","CRDT","P2P"], progress: 15, order: 2 },
  { name: "RL for Speedruns", status: "active", statusLabel: "Running", thought: "Training an RL agent to speedrun Super Mario using screen pixels only. Currently hitting 4min.", tags: ["RL","PPO","Computer Vision"], progress: 72, order: 3 },
  { name: "LLM Kernel", status: "active", statusLabel: "Researching", thought: "Can you run 7B model inference in Linux kernel space? Probably terrible. Will find out.", tags: ["C","CUDA","Linux","LLM"], progress: 8, order: 4 },
];

export const SEED_CONFIG = {
  name: "Girish M",
  title: "Software Engineer",
  subtitle: "Robotics Developer · AI Builder",
  bio: "I build systems that move, think, react, and occasionally break in spectacular ways. Currently obsessed with the intersection of robotics, distributed AI, and interfaces that don't feel like interfaces.",
  location: "Toronto, Canada",
  email: "girishm1603@gmail.com",
  github: "https://github.com/girish316",
  linkedin: "https://www.linkedin.com/in/girish-m-788b9a303/",
  status: "Open to Summer 2026 internships",
  roles: ["Software Engineer","Robotics Developer","AI Builder","Systems Thinker","Full Stack Hacker","Builder of Weird Things"],
  stats: [{ val: "12+", label: "Projects Shipped" }, { val: "3×", label: "Hackathon Wins" }, { val: "∞", label: "Lines of Curiosity" }, { val: "∞", label: "Side Quests" }],
};
