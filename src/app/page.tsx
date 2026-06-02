import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Target,
  TrendingUp,
  Zap,
  Shield,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Code2,
  BarChart3,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Question Generation",
    description:
      "Get personalized interview questions based on your target role, experience level, and tech stack.",
  },
  {
    icon: MessageSquare,
    title: "Real-time AI Evaluation",
    description:
      "Receive instant feedback on your answers — technical accuracy, communication, and completeness scored.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description:
      "Track your improvement over time with detailed charts and performance breakdowns by topic.",
  },
  {
    icon: Target,
    title: "Weakness Detection",
    description:
      "AI identifies recurring weak spots across your sessions and creates a personalized study plan.",
  },
  {
    icon: BookOpen,
    title: "Smart Notes",
    description:
      "Save key concepts, bookmark important topics, and build your personal revision library.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your interview data is encrypted and private. Role-based access ensures data security.",
  },
];

const stats = [
  { value: "10+", label: "Interview Tracks" },
  { value: "200+", label: "Questions" },
  { value: "AI-Powered", label: "Feedback Engine" },
  { value: "Real-time", label: "Evaluation" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PrepAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-primary/5 via-background to-background">
        <Badge variant="secondary" className="mb-4">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered Interview Preparation
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mb-6">
          Ace Your Next{" "}
          <span className="text-primary">Technical Interview</span> with AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-10">
          Practice mock interviews, get instant AI feedback, track your
          progress, and receive personalized study plans — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Practicing Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-20 max-w-2xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From AI-generated questions to detailed performance analytics —
              PrepAI covers every aspect of interview preparation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How PrepAI Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Code2,
                title: "Choose Your Track",
                desc: "Select from Frontend, Backend, Full Stack, System Design, and more.",
              },
              {
                step: "02",
                icon: MessageSquare,
                title: "Practice Interview",
                desc: "Answer AI-generated questions tailored to your experience and role.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Get Feedback & Improve",
                desc: "Receive detailed AI evaluation and a personalized improvement plan.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-mono text-primary mb-2">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join thousands of developers who prepared smarter with PrepAI.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits list */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "AI-powered question generation",
            "Real-time answer evaluation",
            "Weakness detection & study plans",
            "Progress tracking with charts",
            "Notes and bookmarking system",
            "Role-based interview tracks",
            "Admin panel for content management",
            "Secure authentication with JWT",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">PrepAI</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/mustali17"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mustali17"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
