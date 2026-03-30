/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppState, FunctionData, Milestone, RagStatus } from '../types';
import { FUNCTIONS, MONTHS } from '../constants';
import { CompiledBar } from './CompiledBar';
import { cn, ragCol, ragStr } from '../lib/utils';

import { motion, AnimatePresence } from 'motion/react';

interface MasterMapProps {
  state: AppState;
  onUpdateNowMonth: (month: number) => void;
  onOpenDetail: (msId: string, fnId: string) => void;
  onMoveMilestone: (id: string, toMonth: number) => void;
  onCycleRag: (id: string) => void;
}

export function MasterMap({ state, onUpdateNowMonth, onOpenDetail, onMoveMilestone, onCycleRag }: MasterMapProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['all']));
  const [dragMs, setDragMs] = useState<{ id: string; fnId: string } | null>(null);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const getMsRag = (id: string, def: RagStatus): RagStatus => {
    return state.mapMilestones[id]?.rag || def;
  };

  const handleDragStart = (e: React.DragEvent, id: string, fnId: string) => {
    setDragMs({ id, fnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, month: number) => {
    e.preventDefault();
    if (dragMs) {
      onMoveMilestone(dragMs.id, month);
      setDragMs(null);
    }
  };

  const toggleFilter = (id: string) => {
    const next = new Set(activeFilters);
    if (id === 'all') {
      next.clear();
      next.add('all');
    } else {
      next.delete('all');
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) next.add('all');
      } else {
        next.add(id);
      }
    }
    setActiveFilters(next);
  };


  const stats = () => {
    const c = { g: 0, a: 0, r: 0, b: 0, t: 0 };
    FUNCTIONS.forEach(fn => fn.milestones.forEach(ms => {
      const r = getMsRag(ms.id, ms.rag);
      c[r]++;
      c.t++;
    }));
    const pct = c.t ? Math.round((c.g / c.t) * 100) : 0;
    return { ...c, pct };
  };

  const s = stats();

  return (
    <div className="p-4 md:p-6 min-h-full flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
        <div className="ph-left">
          <h2 className="font-sans text-[1.4rem] font-black tracking-tight uppercase text-slate-900">
            Corporate Strategy & Innovation — <span className="text-slate-500">2026 Programme Milestones</span>
          </h2>
          <div className="text-[0.75rem] text-slate-500 mt-1 font-medium">
            All five functions on one view · Click any milestone to update status & notes · Click month header to move the NOW line
          </div>
        </div>
        <div className="flex gap-4 flex-wrap items-center p-2.5 bg-white border border-slate-200 rounded-sm shadow-sm">
          <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>On Track
          </div>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>At Risk
          </div>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>Off Track
          </div>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shadow-sm"></span>Not Started
          </div>
          <div className="text-[0.62rem] italic text-slate-400 font-medium">Bold border = key milestone · Dot colour = delivery status</div>
        </div>
      </div>

      <CompiledBar tab="master" state={state} />

      <div className="flex gap-4 items-center p-3 bg-white border border-slate-200 rounded-sm mb-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-[0.7rem] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-sans font-black text-emerald-600 text-[0.9rem] leading-none">{s.g}</span>
          <span className="uppercase tracking-wide text-slate-400 text-[0.6rem]">On Track</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="font-sans font-black text-amber-600 text-[0.9rem] leading-none">{s.a}</span>
          <span className="uppercase tracking-wide text-slate-400 text-[0.6rem]">At Risk</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="font-sans font-black text-rose-600 text-[0.9rem] leading-none">{s.r}</span>
          <span className="uppercase tracking-wide text-slate-400 text-[0.6rem]">Off Track</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] font-bold">
          <span className="w-2 h-2 rounded-full bg-slate-200"></span>
          <span className="font-sans font-black text-slate-400 text-[0.9rem] leading-none">{s.b}</span>
          <span className="uppercase tracking-wide text-slate-400 text-[0.6rem]">Not Started</span>
        </div>
        <div className="w-px h-5 bg-slate-200"></div>
        <div className="flex items-center gap-2 text-[0.7rem]">
          <strong className="font-sans font-black text-slate-900 text-[0.9rem] leading-none">{s.pct}%</strong>
          <span className="uppercase tracking-wide text-slate-400 text-[0.6rem] font-bold">milestones on track</span>
        </div>
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[100px] border border-slate-200">
          <div
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${s.pct}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4 items-center">
        <span className="font-sans text-[0.55rem] font-bold tracking-widest uppercase text-slate-400 mr-1">Show:</span>
        <button
          className={cn("fp", activeFilters.has('all') && "on")}
          onClick={() => toggleFilter('all')}
        >
          All
        </button>
        <button
          className={cn("fp", activeFilters.has('cs') && "on")}
          data-f="cs"
          onClick={() => toggleFilter('cs')}
        >
          Corp. Strategy
        </button>
        <button
          className={cn("fp", activeFilters.has('km') && "on")}
          data-f="km"
          onClick={() => toggleFilter('km')}
        >
          Knowledge Mgmt
        </button>
        <button
          className={cn("fp", activeFilters.has('inn') && "on")}
          data-f="inn"
          onClick={() => toggleFilter('inn')}
        >
          Innovation
        </button>
        <button
          className={cn("fp", activeFilters.has('cm') && "on")}
          data-f="cm"
          onClick={() => toggleFilter('cm')}
        >
          Change Mgmt
        </button>
        <button
          className={cn("fp", activeFilters.has('eq') && "on")}
          data-f="eq"
          onClick={() => toggleFilter('eq')}
        >
          Excellence & Quality
        </button>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="relative w-full min-w-[1016px]">
          {/* NOW Line */}
          <div
            className="absolute w-0.5 bg-gold z-10 pointer-events-none"
            style={{
              left: `calc(200px + (100% - 200px) * (${state.nowMonth + 0.5} / 12))`,
              top: '52px',
              height: 'calc(100% - 52px)'
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-sans text-[0.5rem] font-black tracking-widest text-white bg-gold px-2 py-0.5 rounded-sm shadow-sm">
              NOW
            </div>
          </div>

          <div className="q-banner mb-0.5">
            <div></div>
            <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q1</div>
            <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q2</div>
            <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q3</div>
            <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q4</div>
          </div>

          <div className="mh-row-m mb-1">
            <div></div>
            {MONTHS.map((m, i) => (
              <div
                key={m}
                className={cn(
                  "text-center font-sans text-[0.55rem] font-bold tracking-widest uppercase text-slate-400 py-1.5 border-r border-slate-200 cursor-pointer transition-colors hover:text-slate-900",
                  i % 3 === 0 && "border-l-2 border-slate-300",
                  i === state.nowMonth && "text-slate-900 font-black bg-slate-50"
                )}
                onClick={() => onUpdateNowMonth(i)}
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {FUNCTIONS.map((fn, fi) => {
              const isVisible = activeFilters.has('all') || activeFilters.has(fn.id);
              if (!isVisible) return null;

              const msOnTrack = fn.milestones.filter(m => getMsRag(m.id, m.rag) === 'g').length;

              return (
                <React.Fragment key={fn.id}>
                  <div className="fn-row-m group border-b border-slate-200">
                    <div
                      className="flex flex-col justify-center py-3 pr-4 border-r-4 mr-0 self-stretch bg-slate-50/30"
                      style={{ borderRightColor: fn.color }}
                    >
                      <div className="font-sans text-[0.65rem] font-extrabold tracking-tight uppercase" style={{ color: fn.color }}>
                        {fn.label}
                      </div>
                      <div className="text-[0.6rem] text-slate-500 font-medium mt-0.5">{fn.owner}</div>
                      <div className="text-[0.55rem] text-slate-400 mt-1 font-bold uppercase tracking-tighter">
                        {msOnTrack}/{fn.milestones.length} ON TRACK
                      </div>
                    </div>

                    {Array.from({ length: 12 }).map((_, m) => {
                      const msState = state.mapMilestones;
                      const currentMilestones = fn.milestones.filter(ms => (msState[ms.id]?.currentMonth ?? ms.month) === m);
                      const baselineMilestones = fn.milestones.filter(ms => {
                        const s = msState[ms.id];
                        return s && s.baselineMonth === m && (s.currentMonth ?? ms.month) !== m;
                      });

                      return (
                        <div
                          key={m}
                          className={cn(
                            "relative p-1.5 border-r border-slate-200 flex flex-col gap-1.5 items-start min-h-[90px] transition-colors duration-200",
                            m % 3 === 0 && "border-l-2 border-slate-300",
                            m === state.nowMonth && "bg-amber-50/20",
                            dragMs && hoverMonth === m && "bg-indigo-50 ring-2 ring-inset ring-indigo-200"
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setHoverMonth(m);
                          }}
                          onDragLeave={() => setHoverMonth(null)}
                          onDrop={(e) => {
                            handleDrop(e, m);
                            setHoverMonth(null);
                          }}
                        >
                          <AnimatePresence>
                            {baselineMilestones.map(ms => (
                              <motion.div
                                key={`ghost-${ms.id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 0.35, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="ghost-pill"
                                style={{ borderColor: fn.color, color: fn.color }}
                                title={`Baseline: ${MONTHS[m]} (moved to ${MONTHS[msState[ms.id]?.currentMonth ?? 0]})`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: fn.color }}></span>
                                {ms.label}
                              </motion.div>
                            ))}

                            {currentMilestones.map(ms => {
                              const rag = getMsRag(ms.id, ms.rag);
                              const s = msState[ms.id];
                              const baseline = s?.baselineMonth ?? ms.month;
                              const delta = m - baseline;
                              const slipCls = delta <= 0 ? 'slip-early' : delta >= 3 ? 'slip-late3' : 'slip-late';
                              const slipLbl = delta === 0 ? '' : `${delta > 0 ? '+' : ''}${delta}mo`;

                              return (
                                <motion.div
                                  key={ms.id}
                                  layoutId={ms.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, ms.id, fn.id)}
                                  className={cn(
                                    "mspill cursor-grab active:cursor-grabbing group",
                                    ms.key && "key-pill",
                                    rag === 'g' && "done"
                                  )}
                                  style={{ borderLeftColor: fn.color, borderLeftWidth: '3px' }}
                                  onClick={() => onOpenDetail(ms.id, fn.id)}
                                  whileHover={{ scale: 1.02, zIndex: 10 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0 transition-transform hover:scale-150 cursor-pointer shadow-sm"
                                    style={{ background: ragCol(rag) }}
                                    onClick={(e) => { e.stopPropagation(); onCycleRag(ms.id); }}
                                    title="Cycle Status"
                                  ></span>
                                  <span className="truncate max-w-[120px]">{ms.label}</span>
                                  {delta !== 0 && <span className={cn("slip-badge", slipCls)}>{slipLbl}</span>}
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                  {fi < FUNCTIONS.length - 1 && <div className="h-px bg-navy/5 my-0.5"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
