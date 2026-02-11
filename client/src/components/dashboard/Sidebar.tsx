'use client';

import { useState } from 'react';
import { Home, FileText, User, Crown, Settings, LogOut } from 'lucide-react';
import { NavigationItem as NavType } from '@/lib/types';
import UserStatsCard from './UserStatsCard';
import { mockUserStats } from '@/lib/mockData';

interface NavItemProps {
  icon: React.ReactNode;
  label: NavType;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
        transition-all duration-200 relative group
        ${isActive 
          ? 'text-text-primary bg-surface-elevated' 
          : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
        }
      `}
    >
      {/* Active Accent Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-(--primary)" />
      )}
      
      {/* Icon */}
      <span className={`${isActive ? 'text-(--primary)' : ''}`} style={{ width: '20px', height: '20px' }}>
        {icon}
      </span>
      
      {/* Label */}
      <span>{label}</span>
      
      {/* Hover Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-(--primary) opacity-5 pointer-events-none" />
      )}
    </button>
  );
}

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState<NavType>('Home');

  const navItems: { icon: React.ReactNode; label: NavType }[] = [
    { icon: <Home size={20} />, label: 'Home' },
    { icon: <FileText size={20} />, label: 'My Posts' },
    { icon: <User size={20} />, label: 'My Profile' },
    { icon: <Crown size={20} />, label: 'Subscription' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-(--border) flex flex-col">
      {/* Logo/Header */}
      <div className="px-4 py-6 border-b border-(--border)">
        <h1 className="text-text-primary text-xl font-display font-bold tracking-wider">
          FACTCHECK
        </h1>
        <p className="text-text-muted text-xs mt-1">
          Truth Verification Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </nav>

      {/* User Stats Card */}
      <UserStatsCard stats={mockUserStats} />

      {/* Logout */}
      <button
        className="
          flex items-center gap-3 px-4 py-4 text-sm font-medium
          text-text-muted hover:text-red-400 hover:bg-red-500/10
          border-t border-(--border) transition-all duration-200
        "
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
