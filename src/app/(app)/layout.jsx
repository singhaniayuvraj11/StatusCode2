

'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';


export default function AppLayout({ children }) {
  const [open, setOpen] = React.useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
     return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
