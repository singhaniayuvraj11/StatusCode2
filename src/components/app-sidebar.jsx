
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  PenSquare,
  BookText,
  HelpCircle,
  BrainCircuit,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
   {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tooltip: 'Dashboard',
  },
  {
    href: '/resume-builder',
    label: 'Resume Builder',
    icon: FileText,
    tooltip: 'Resume Builder',
  },
  {
    href: '/note-generator',
    label: 'Note Generator',
    icon: PenSquare,
    tooltip: 'Note Generator',
  },
  {
    href: '/document-summarizer',
    label: 'Doc Summarizer',
    icon: BookText,
    tooltip: 'Document Summarizer',
  },
  {
    href: '/quiz-creator',
    label: 'Quiz Creator',
    icon: HelpCircle,
    tooltip: 'Quiz Creator',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden">
                <Link href="/">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                </Link>
            </Button>
            <h2 className="text-xl font-headline font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
                ScholarAI
            </h2>
            <div className="flex-1" />
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.tooltip, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
         {user && 
          <div className="p-2 group-data-[collapsible=icon]:p-0">
             <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip={{children: "Logout", side:"right"}}>
                  <LogOut/>
                  <span>Logout</span>
                </SidebarMenuButton>
               </SidebarMenuItem>
             </SidebarMenu>
              <p className="text-xs text-muted-foreground mt-2 px-2 truncate group-data-[collapsible=icon]:hidden">{user.email}</p>
          </div>
        }
      </SidebarFooter>
    </>
  );
}
