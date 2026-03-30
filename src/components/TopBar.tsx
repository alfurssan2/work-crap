/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Save, Menu, CheckSquare, RotateCcw, Import } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  userName: string;
  onPromptUser: () => void;
  onOpenIE: () => void;
  onSave: () => void;
  lastSaved?: string;
  activeTab: string;
  onToggleSidebar: (panel: string) => void;
}

export function TopBar({
  userName,
  onPromptUser,
  onOpenIE,
  onSave,
  lastSaved,
  activeTab,
  onToggleSidebar,
}: TopBarProps) {
  const isMaster = activeTab === 'master';

  return (
    <div className="bg-navy px-7 h-[52px] flex items-center justify-between sticky top-0 z-[300] shadow-2xl">
      <div className="flex items-center gap-4">
        <span className="font-display text-[0.72rem] font-extrabold tracking-widest uppercase text-white">
          TQT <span className="text-sky">2026</span>
        </span>
        <span className="font-display text-[0.52rem] font-bold tracking-widest uppercase bg-sky/15 border border-sky/30 text-sky px-2.5 py-0.5 rounded-sm">
          Strategy & Innovation Planner
        </span>
        {lastSaved && (
          <span className="text-[0.6rem] text-ice/50">
            ● Saved {new Date(lastSaved).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isMaster && (
          <>
            <button
              className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm bg-white/10 text-ice border border-white/15 hover:bg-white/15 transition-all"
              onClick={() => onToggleSidebar('summary')}
            >
              <Menu size={12} /> Summary
            </button>
            <button
              className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm bg-white/10 text-ice border border-white/15 hover:bg-white/15 transition-all"
              onClick={() => onToggleSidebar('tasks')}
            >
              <CheckSquare size={12} /> Tasks
            </button>
            <button
              className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm bg-white/10 text-ice border border-white/15 hover:bg-white/15 transition-all"
              onClick={() => onToggleSidebar('history')}
            >
              <RotateCcw size={12} /> History
            </button>
          </>
        )}

        <div
          className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest text-ice/70 cursor-pointer px-2.5 py-1.5 rounded-sm border border-white/10 hover:opacity-100 transition-opacity"
          onClick={onPromptUser}
        >
          <span className="w-2 h-2 rounded-full bg-mint"></span>
          <span>{userName || 'Set your name'}</span>
        </div>

        <button
          className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm bg-white/10 text-ice border border-white/15 hover:bg-white/15 transition-all"
          onClick={onOpenIE}
        >
          <Import size={12} /> Import / Export
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        <button
          className="flex items-center gap-1.5 font-display text-[0.58rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm bg-steel text-white hover:bg-sky transition-all"
          onClick={onSave}
        >
          <Save size={12} /> Save
        </button>
      </div>
    </div>
  );
}
