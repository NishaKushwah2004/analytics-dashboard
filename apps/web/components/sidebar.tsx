'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText,
  FolderOpen,
  Users,
  Settings,
  TrendingUp
} from 'lucide-react';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  // {
  //   label: 'Invoice',
  //   icon: FileText,
  //   href: '/invoices',
  // },
  // {
  //   label: 'Other files',
  //   icon: FolderOpen,
  //   href: '/files',
  // },
  // {
  //   label: 'Departments',
  //   icon: Users,
  //   href: '/departments',
  // },
  {
    label: 'Chat with Data',
    icon: MessageSquare,
    href: '/chat',
  },
  // {
  //   label: 'Settings',
  //   icon: Settings,
  //   href: '/settings',
  // },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col bg-[#1E3A8A] text-white w-64">
      
      {/* Logo/Header */}
      <div className="px-6 py-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-[#1E3A8A]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Flowbit AI</h2>
            <p className="text-xs text-blue-200">Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-blue-800/30 rounded-lg p-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
            NK
          </div>
          <div>
            <p className="text-sm font-medium">Nisha Kushwah</p>
            <p className="text-xs text-blue-200">12 months</p>
          </div>
        </div>
      </div>

      {/* Section: GENERAL */}
      <div className="px-6 mb-2">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
          General
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
                isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-blue-100 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{route.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer branding */}
      <div className="px-6 py-6 border-t border-blue-700">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-[#1E3A8A] text-xs font-bold">F</span>
          </div>
          <span className="text-sm font-semibold">Flowbit AI</span>
        </div>
      </div>

      {/* ... existing content */}
      <div className="px-3 py-2 mt-auto">
        <ThemeToggle />
      </div>
      
    </div>
  );
}