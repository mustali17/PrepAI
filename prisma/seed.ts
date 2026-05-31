import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@prepai.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@prepai.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo candidate
  const candidatePassword = await bcrypt.hash("demo123456", 12);
  await prisma.user.upsert({
    where: { email: "demo@prepai.com" },
    update: {},
    create: {
      name: "Demo Candidate",
      email: "demo@prepai.com",
      password: candidatePassword,
      role: "CANDIDATE",
      experienceLevel: "MID",
      targetRole: "Full Stack Developer",
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    },
  });

  const tracksData = [
    {
      title: "Frontend Developer",
      description:
        "Master HTML, CSS, JavaScript, React, and modern frontend concepts for frontend roles.",
      difficulty: "INTERMEDIATE" as const,
      icon: "⚛️",
      questions: [
        { question: "Explain the difference between `==` and `===` in JavaScript.", category: "JavaScript", difficulty: "BEGINNER" as const, tags: ["javascript", "basics"] },
        { question: "What is the virtual DOM and how does React use it to optimize performance?", category: "React", difficulty: "INTERMEDIATE" as const, tags: ["react", "performance"] },
        { question: "Explain React hooks: useState, useEffect, useCallback, and useMemo. When should you use each?", category: "React", difficulty: "INTERMEDIATE" as const, tags: ["react", "hooks"] },
        { question: "How does event delegation work in JavaScript? Give a practical example.", category: "JavaScript", difficulty: "INTERMEDIATE" as const, tags: ["javascript", "dom"] },
        { question: "What are CSS custom properties (variables) and how do they differ from preprocessor variables?", category: "CSS", difficulty: "BEGINNER" as const, tags: ["css"] },
        { question: "Explain the concept of code splitting in React and how to implement it with React.lazy() and Suspense.", category: "React", difficulty: "ADVANCED" as const, tags: ["react", "performance", "optimization"] },
        { question: "What is the difference between controlled and uncontrolled components in React?", category: "React", difficulty: "INTERMEDIATE" as const, tags: ["react", "forms"] },
        { question: "Describe how you would optimize a slow-rendering React application.", category: "Performance", difficulty: "ADVANCED" as const, tags: ["react", "performance"] },
      ],
    },
    {
      title: "Backend Developer",
      description: "Master Node.js, REST APIs, databases, authentication, and server-side concepts.",
      difficulty: "INTERMEDIATE" as const,
      icon: "⚙️",
      questions: [
        { question: "What is the Node.js event loop and how does it handle asynchronous operations?", category: "Node.js", difficulty: "INTERMEDIATE" as const, tags: ["nodejs", "async"] },
        { question: "Explain the difference between authentication and authorization. How would you implement JWT authentication?", category: "Security", difficulty: "INTERMEDIATE" as const, tags: ["security", "jwt", "auth"] },
        { question: "What are the key differences between SQL and NoSQL databases? When would you choose MongoDB over PostgreSQL?", category: "Databases", difficulty: "INTERMEDIATE" as const, tags: ["databases", "mongodb", "sql"] },
        { question: "How would you design a rate limiting system for a REST API?", category: "API Design", difficulty: "ADVANCED" as const, tags: ["api", "rate-limiting", "security"] },
        { question: "Explain the middleware pattern in Express.js and how it affects request processing.", category: "Node.js", difficulty: "INTERMEDIATE" as const, tags: ["nodejs", "express"] },
        { question: "What is connection pooling and why is it important in database management?", category: "Databases", difficulty: "INTERMEDIATE" as const, tags: ["databases", "performance"] },
        { question: "How do you handle database transactions to ensure data integrity?", category: "Databases", difficulty: "ADVANCED" as const, tags: ["databases", "transactions"] },
      ],
    },
    {
      title: "Full Stack Developer",
      description: "End-to-end development covering both frontend and backend with Next.js.",
      difficulty: "ADVANCED" as const,
      icon: "🔥",
      questions: [
        { question: "Explain the difference between SSR, SSG, ISR, and CSR in Next.js. When would you use each?", category: "Next.js", difficulty: "ADVANCED" as const, tags: ["nextjs", "rendering"] },
        { question: "How would you architect a scalable full-stack application? Walk through your decisions.", category: "Architecture", difficulty: "ADVANCED" as const, tags: ["architecture", "scalability"] },
        { question: "What is the difference between Server Components and Client Components in Next.js 13+?", category: "Next.js", difficulty: "INTERMEDIATE" as const, tags: ["nextjs", "react"] },
        { question: "How do you handle state management in a large-scale React application?", category: "React", difficulty: "ADVANCED" as const, tags: ["react", "state"] },
        { question: "Describe your approach to API error handling both on the frontend and backend.", category: "Error Handling", difficulty: "INTERMEDIATE" as const, tags: ["api", "errors"] },
        { question: "How would you implement real-time features (like notifications) in a Next.js app?", category: "Real-time", difficulty: "ADVANCED" as const, tags: ["websockets", "realtime"] },
      ],
    },
    {
      title: "System Design",
      description: "High-level system design, scalability, distributed systems, and architecture patterns.",
      difficulty: "ADVANCED" as const,
      icon: "🏗️",
      questions: [
        { question: "Design a URL shortening service like bit.ly. Discuss scalability, database choices, and API design.", category: "System Design", difficulty: "ADVANCED" as const, tags: ["system-design", "scalability"] },
        { question: "How would you design a distributed caching system? What are the trade-offs?", category: "Caching", difficulty: "ADVANCED" as const, tags: ["caching", "distributed"] },
        { question: "Explain CAP theorem. How does it affect your database selection?", category: "Distributed Systems", difficulty: "ADVANCED" as const, tags: ["distributed", "databases"] },
        { question: "Design a notification system that needs to handle millions of users.", category: "System Design", difficulty: "ADVANCED" as const, tags: ["system-design", "scale"] },
        { question: "What is the difference between horizontal and vertical scaling? When would you use each?", category: "Scalability", difficulty: "INTERMEDIATE" as const, tags: ["scaling", "infrastructure"] },
      ],
    },
    {
      title: "JavaScript Fundamentals",
      description: "Core JavaScript concepts including closures, prototypes, async patterns, and ES6+.",
      difficulty: "BEGINNER" as const,
      icon: "📜",
      questions: [
        { question: "What is a closure in JavaScript? Provide a practical use case.", category: "JavaScript", difficulty: "INTERMEDIATE" as const, tags: ["javascript", "closure"] },
        { question: "Explain prototypal inheritance in JavaScript. How does it differ from class-based inheritance?", category: "JavaScript", difficulty: "INTERMEDIATE" as const, tags: ["javascript", "oop"] },
        { question: "What is the difference between `var`, `let`, and `const`? Explain hoisting.", category: "JavaScript", difficulty: "BEGINNER" as const, tags: ["javascript", "basics"] },
        { question: "How does `async/await` work under the hood? Explain Promises.", category: "JavaScript", difficulty: "INTERMEDIATE" as const, tags: ["javascript", "async"] },
        { question: "What are generators in JavaScript and when would you use them?", category: "JavaScript", difficulty: "ADVANCED" as const, tags: ["javascript", "generators"] },
        { question: "Explain the difference between `call`, `apply`, and `bind` methods.", category: "JavaScript", difficulty: "INTERMEDIATE" as const, tags: ["javascript", "functions"] },
      ],
    },
  ];

  for (const trackData of tracksData) {
    const { questions, ...trackInfo } = trackData;

    // Skip if track already exists (idempotent seed)
    const existing = await prisma.track.findFirst({ where: { title: trackInfo.title } });
    if (existing) {
      console.log(`⏭  Skipping existing track: ${trackInfo.title}`);
      continue;
    }

    const track = await prisma.track.create({
      data: {
        ...trackInfo,
        createdBy: admin.id,
        isPublished: true,
      },
    });

    for (const q of questions) {
      await prisma.question.create({
        data: { ...q, trackId: track.id },
      });
    }

    console.log(`✓ Created track: ${trackInfo.title} with ${questions.length} questions`);
  }

  console.log("\n🎉 Seed completed!");
  console.log("📧 Admin: admin@prepai.com / admin123456");
  console.log("📧 Demo:  demo@prepai.com  / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
