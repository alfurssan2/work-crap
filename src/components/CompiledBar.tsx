/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppState, RagStatus } from '../types';
import { DETAIL_TABS } from '../constants';

interface CompiledBarProps {
  tab: string;
  state: AppState;
}

const TAB_NAMES: Record<string, string> = {
  master: 'Corporate Strategy & Innovation',
  cs: 'Corporate Strategy',
  km: 'Knowledge Management',
  inn: 'Innovation & UAE Innovate',
  cm: 'Change Management',
  eq: 'Excellence & Quality',
};

export function CompiledBar({ tab, state }: CompiledBarProps) {
  const getMilestoneRag = (tabKey: string, act: any): RagStatus => {
    const init = state.initiatives[tabKey]?.find(i => i.id === act.init);
    return init ? init.rag : 'b';
  };

  const getStats = () => {
    let milestones: { rag: RagStatus }[] = [];
    if (tab === 'master') {
      DETAIL_TABS.forEach(t => {
        state.activities[t]?.filter(a => a.type === 'milestone').forEach(a => {
          milestones.push({ rag: getMilestoneRag(t, a) });
        });
      });
    } else {
      state.activities[tab]?.filter(a => a.type === 'milestone').forEach(a => {
        milestones.push({ rag: getMilestoneRag(tab, a) });
      });
    }

    const c = { g: 0, a: 0, r: 0, b: 0, total: milestones.length };
    milestones.forEach(m => c[m.rag]++);
    const pct = c.total ? Math.round((c.g / c.total) * 100) : 0;
    return { ...c, pct };
  };

  const c = getStats();
  const name = TAB_NAMES[tab] || tab;
  const subtitle = tab === 'master'
    ? 'Automatically reflects milestones from all function tabs below.'
    : 'Automatically reflects activities marked as Major Milestones from the detailed plan.';

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-5 mb-4 shadow-sm shrink-0">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="font-sans text-[0.85rem] font-black tracking-tight text-slate-900 uppercase">
            Compiled Level — <span className="text-slate-500">{name} TQT</span>
          </div>
          <div className="text-[0.65rem] text-slate-400 mt-1 font-medium">{subtitle}</div>
        </div>
        <div className="flex gap-4 items-center shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500 shadow-sm"></span>On Track
          </div>
          <div className="flex items-center gap-1.5 text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full shrink-0 bg-amber-500 shadow-sm"></span>At Risk
          </div>
          <div className="flex items-center gap-1.5 text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full shrink-0 bg-rose-500 shadow-sm"></span>Off Track
          </div>
          <div className="flex items-center gap-1.5 text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full shrink-0 bg-slate-200 shadow-sm"></span>Not Started
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-900 font-bold">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500 shadow-sm"></span>
          <span className="font-sans font-black text-[1rem] text-emerald-600 leading-none">{c.g}</span>
          <span className="uppercase tracking-wide text-slate-500 text-[0.6rem]">On Track</span>
        </div>
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-900 font-bold">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-amber-500 shadow-sm"></span>
          <span className="font-sans font-black text-[1rem] text-amber-600 leading-none">{c.a}</span>
          <span className="uppercase tracking-wide text-slate-500 text-[0.6rem]">At Risk</span>
        </div>
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-900 font-bold">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-rose-500 shadow-sm"></span>
          <span className="font-sans font-black text-[1rem] text-rose-600 leading-none">{c.r}</span>
          <span className="uppercase tracking-wide text-slate-500 text-[0.6rem]">Off Track</span>
        </div>
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-900 font-bold">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-200 shadow-sm"></span>
          <span className="font-sans font-black text-[1rem] text-slate-400 leading-none">{c.b}</span>
          <span className="uppercase tracking-wide text-slate-500 text-[0.6rem]">Not Started</span>
        </div>

        <div className="w-px h-6 bg-slate-200"></div>

        <div className="flex items-center gap-4 flex-1 min-w-[150px]">
          <span className="font-sans font-black text-[1rem] text-slate-900 whitespace-nowrap leading-none">{c.pct}%</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px] border border-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${c.pct}%` }}
            ></div>
          </div>
          <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">milestones on track</span>
        </div>
      </div>
    </div>
  );
}
