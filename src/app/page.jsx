
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, FileText, PenSquare, BookText, HelpCircle, BrainCircuit, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-accent" />,
    title: 'Resume Builder',
    description: 'Craft a professional resume with our intuitive builder and templates.',
    href: '/resume-builder',
  },
  {
    icon: <PenSquare className="h-8 w-8 text-accent" />,
    title: 'AI Note Generation',
    description: 'Generate concise notes from text or a document with AI-powered summarization.',
    href: '/note-generator',
  },
  {
    icon: <BookText className="h-8 w-8 text-accent" />,
    title: 'Document Summarization',
    description: 'Quickly summarize long documents and articles to save time.',
    href: '/document-summarizer',
  },
  {
    icon: <HelpCircle className="h-8 w-8 text-accent" />,
    title: 'AI Quiz Creator',
    description: 'Create customized quizzes from your study materials to test your knowledge.',
    href: '/quiz-creator',
  },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline">ScholarAI</h1>
        </Link>
        <div className="flex gap-2 items-center">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" onClick={logout} size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-foreground">
              Supercharge Your Studies
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              ScholarAI is your all-in-one platform for academic and career success, powered by cutting-edge AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-16">
            {features.map((feature) => (
              <Link href={feature.href} key={feature.title} className="group block">
                <Card className="h-full bg-card/50 hover:bg-card/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                  <CardHeader>
                    <div className="p-3 bg-muted rounded-full w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ScholarAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
