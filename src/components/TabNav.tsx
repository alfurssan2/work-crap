/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';
import { DETAIL_TABS } from '../constants';

interface TabNavProps {
  activeTab: string;
  onSwitchTab: (id: string) => void;
}

export function TabNav({ activeTab, onSwitchTab }: TabNavProps) {
  const tabs = [
    { id: 'master', label: 'Master Map', color: 'var(--sky)' },
    { id: 'cs', label: 'Corporate Strategy', color: 'var(--f-cs)' },
    { id: 'km', label: 'Knowledge Management', color: 'var(--f-km)' },
    { id: 'inn', label: 'Innovation & UAE Innovate', color: 'var(--f-inn)' },
    { id: 'cm', label: 'Change Management', color: 'var(--f-cm)' },
    { id: 'eq', label: 'Excellence & Quality', color: 'var(--f-eq)' },
  ];

  return (
    <div className="bg-navy border-b border-white/10 flex px-7 overflow-x-auto sticky top-[52px] z-[200] no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "tn-btn",
            activeTab === tab.id && "active"
          )}
          style={{ '--ta': tab.color } as React.CSSProperties}
          onClick={() => onSwitchTab(tab.id)}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: tab.color }}
          ></span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
