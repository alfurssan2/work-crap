/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppState, Activity, Initiative, Swimlane, RagStatus } from '../types';
import { MONTHS, SWIMLANES, INIT_COLORS, INIT_THEMES } from '../constants';
import { CompiledBar } from './CompiledBar';
import { cn, ragStr, esc } from '../lib/utils';
import { Plus, Check, RotateCcw, X } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

interface DetailTabProps {
  tab: string;
  state: AppState;
  onUpdateNowMonth: (month: number) => void;
  onCycleRag: (tab: string, initId: string) => void;
  onToggleDone: (id: string) => void;
  onOpenNewAct: (tab: string, initId: string, month: number) => void;
  onOpenEditAct: (id: string) => void;
  onMoveActivity: (id: string, toMonth: number) => void;
  sidebarOpen: boolean;
  sidebarPanel: string;
  onSwitchPanel: (panel: string) => void;
  onAddTask: (tab: string, title: string, owner?: string) => void;
  onToggleTask: (tab: string, id: string) => void;
  onDeleteTask: (tab: string, id: string) => void;
  onRevertActivity: (id: string) => void;
  onClearHistory: (tab: string) => void;
  onCycleActivityRag: (id: string) => void;
}

export function DetailTab({
  tab,
  state,
  onUpdateNowMonth,
  onCycleRag,
  onToggleDone,
  onOpenNewAct,
  onOpenEditAct,
  onMoveActivity,
  sidebarOpen,
  sidebarPanel,
  onSwitchPanel,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onRevertActivity,
  onClearHistory,
  onCycleActivityRag,
}: DetailTabProps) {
  const [dragActId, setDragActId] = useState<string | null>(null);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragActId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, month: number) => {
    e.preventDefault();
    if (dragActId) {
      onMoveActivity(dragActId, month);
      setDragActId(null);
    }
  };


  const inits = state.initiatives[tab] || [];
  const acts = state.activities[tab] || [];
  const swimlanes = SWIMLANES[tab] || [];

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
        <CompiledBar tab={tab} state={state} />

        <div className="relative overflow-auto">
          <div className="relative w-full min-w-[1001px]">
              {/* NOW Line */}
              <div
                className="absolute w-0.5 bg-gold z-10 pointer-events-none"
                style={{
                  left: `calc(185px + (100% - 185px) * (${state.nowMonth + 0.5} / 12))`,
                  top: '52px',
                  height: 'calc(100% - 52px)'
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-sans text-[0.5rem] font-black tracking-widest text-white bg-gold px-2 py-0.5 rounded-sm shadow-sm">
                  NOW
                </div>
              </div>

            <div className="q-banner-d mb-0.5">
              <div></div>
              <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q1</div>
              <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q2</div>
              <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q3</div>
              <div className="col-span-3 border-l-2 border-slate-300 text-center font-sans text-[0.6rem] font-bold tracking-widest uppercase text-slate-500 py-1.5 bg-slate-100/50">Q4</div>
            </div>

            <div className="mh-row-d mb-1">
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

            {swimlanes.map((sl, sli) => (
              <div key={sli}>
                <div className="flex items-center gap-2 mt-4 mb-1.5 font-sans text-[0.55rem] font-black tracking-[0.2em] uppercase text-slate-400 after:content-[''] after:flex-1 after:h-px after:bg-slate-200">
                  <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: sl.color }}></span>
                  {sl.owner}
                </div>
                {sl.inits.map(initId => {
                  const init = inits.find(i => i.id === initId);
                  if (!init) return null;
                  const colorKey = INIT_COLORS[tab]?.[initId] || 'steel';
                  const themeClass = INIT_THEMES[tab]?.[initId] || '';

                  return (
                    <div key={initId} className={cn("init-row mb-1.5 relative animate-in fade-in slide-in-from-bottom-1 duration-300 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden", themeClass)}>
                      <div className="il flex flex-col justify-center py-3 px-3 border-r-4 mr-0 self-stretch bg-slate-50/50" style={{ borderRightColor: `var(--${colorKey})` }}>
                        <span className="il-code font-sans text-[0.55rem] font-black tracking-widest uppercase text-slate-400 mb-0.5">{initId}</span>
                        <span className="il-title text-[0.75rem] font-bold leading-tight text-slate-900">{init.title}</span>
                        <span className="il-owner text-[0.6rem] text-slate-500 font-medium mt-1">{init.owner}</span>
                        <span
                          className={cn("rag-pill mt-2", `r${init.rag}`)}
                          onClick={() => onCycleRag(tab, initId)}
                          title="Click to change"
                        >
                          <span className="rp-dot w-1.5 h-1.5 rounded-full shrink-0"></span>
                          {ragStr(init.rag)}
                        </span>
                      </div>

                      {Array.from({ length: 12 }).map((_, m) => {
                        const cellActs = acts.filter(a => a.init === initId && a.month === m);
                        const baselineActs = acts.filter(a => a.init === initId && a.baselineMonth === m && a.month !== m);

                        return (
                          <div
                            key={m}
                            className={cn(
                              "mc-d relative p-1.5 border-r border-slate-200 flex flex-col gap-1.5 items-start min-h-[50px] transition-colors duration-200",
                              m % 3 === 0 && "border-l-2 border-slate-300",
                              m === state.nowMonth && "bg-amber-50/20",
                              dragActId && hoverMonth === m && "bg-indigo-50 ring-2 ring-inset ring-indigo-200"
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
                              {baselineActs.map(act => (
                                <motion.div
                                  key={`ghost-${act.id}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 0.35, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className={act.type === 'milestone' ? "ghost-pill" : "ghost-card"}
                                  style={{ borderColor: `var(--${colorKey})`, color: `var(--${colorKey})` }}
                                  title={`Baseline: ${MONTHS[act.baselineMonth || 0]} (moved to ${MONTHS[act.month]})`}
                                >
                                  {act.type === 'milestone' && (
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(--${colorKey})` }}></span>
                                  )}
                                  {act.label}
                                </motion.div>
                              ))}

                              {cellActs.map(act => {
                                const isMoved = act.baselineMonth !== undefined && act.month !== act.baselineMonth;
                                const delta = isMoved ? act.month - (act.baselineMonth || 0) : 0;
                                const slipCls = delta <= 0 ? 'slip-early' : delta >= 3 ? 'slip-late3' : 'slip-late';
                                const slipLbl = delta === 0 ? '' : `${delta > 0 ? '+' : ''}${delta}mo`;

                                if (act.type === 'milestone') {
                                  return (
                                    <motion.div
                                      key={act.id}
                                      layoutId={act.id}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, act.id)}
                                      className={cn("ms-pill-d cursor-grab active:cursor-grabbing shadow-sm", act.done && "opacity-40")}
                                      style={{ borderLeftColor: `var(--${colorKey})`, borderLeftWidth: '3px', color: `var(--${colorKey})` }}
                                      onClick={() => onOpenEditAct(act.id)}
                                      title={act.tooltip}
                                      whileHover={{ scale: 1.02, zIndex: 10 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <span className="ms-dot-d w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: `var(--${colorKey})` }}></span>
                                      <span className="truncate max-w-[100px]">{act.label}</span>
                                      {isMoved && <span className={cn("slip-badge", slipCls)}>{slipLbl}</span>}
                                    </motion.div>
                                  );
                                }

                                const isRisk = act.type === 'risk';
                                const isDel = act.type === 'deliverable';

                                return (
                                  <motion.div
                                    key={act.id}
                                    layoutId={act.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, act.id)}
                                    className={cn(
                                      "act-card cursor-grab active:cursor-grabbing group",
                                      isRisk && "risk-card",
                                      isDel && "deliverable-card",
                                      act.done && "done-card"
                                    )}
                                    style={!isRisk ? { borderLeftColor: `var(--${colorKey})`, borderLeftWidth: '3px' } : {}}
                                    onClick={() => onOpenEditAct(act.id)}
                                    title={act.tooltip}
                                    whileHover={{ scale: 1.02, zIndex: 10 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <span className="ac-lbl">
                                      {isRisk && '⚠ '}{act.label}
                                      {isMoved && <span className={cn("slip-badge", slipCls)}>{slipLbl}</span>}
                                    </span>
                                    {act.kpi && <span className="ac-kpi block text-[0.54rem] text-slate-400 mt-0.5 font-medium">{act.kpi}</span>}
                                    
                                    <div className="absolute top-1 right-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        className="w-2.5 h-2.5 rounded-full border border-slate-200 hover:scale-125 transition-transform shadow-sm"
                                        style={{ background: act.rag === 'g' ? '#10b981' : act.rag === 'a' ? '#f59e0b' : act.rag === 'r' ? '#ef4444' : '#64748b' }}
                                        onClick={(e) => { e.stopPropagation(); onCycleActivityRag(act.id); }}
                                        title="Cycle Status"
                                      />
                                      <button
                                        className="text-slate-400 hover:text-slate-900 hover:scale-110 transition-all"
                                        onClick={(e) => { e.stopPropagation(); onToggleDone(act.id); }}
                                        title={act.done ? "Mark as Incomplete" : "Mark as Done"}
                                      >
                                        {act.done ? <RotateCcw size={11} /> : <Check size={11} />}
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            <button
                              className="mc-add opacity-0 hover:opacity-100 bg-transparent border border-dashed border-slate-200 rounded-sm text-slate-400 text-[0.56rem] p-0.5 cursor-pointer transition-all w-full hover:border-slate-400 hover:text-slate-600 mt-auto"
                              onClick={() => onOpenNewAct(tab, initId, m)}
                            >
                              <Plus size={10} className="mx-auto" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn("sidebar w-[300px] min-w-[300px] bg-white border-l border-border flex flex-col transition-all duration-300", !sidebarOpen && "w-0 min-w-0 overflow-hidden")}>
        <div className="sidebar-tabs flex border-b border-border shrink-0">
          <button
            className={cn("s-tab flex-1 py-3 text-center font-sans text-[0.55rem] font-black tracking-widest uppercase cursor-pointer text-slate-400 border-b-2 border-transparent transition-all", sidebarPanel === 'summary' && "text-slate-900 border-b-slate-900 bg-slate-50/50")}
            onClick={() => onSwitchPanel('summary')}
          >
            Summary
          </button>
          <button
            className={cn("s-tab flex-1 py-3 text-center font-sans text-[0.55rem] font-black tracking-widest uppercase cursor-pointer text-slate-400 border-b-2 border-transparent transition-all", sidebarPanel === 'tasks' && "text-slate-900 border-b-slate-900 bg-slate-50/50")}
            onClick={() => onSwitchPanel('tasks')}
          >
            Tasks
          </button>
          <button
            className={cn("s-tab flex-1 py-3 text-center font-sans text-[0.55rem] font-black tracking-widest uppercase cursor-pointer text-slate-400 border-b-2 border-transparent transition-all", sidebarPanel === 'history' && "text-slate-900 border-b-slate-900 bg-slate-50/50")}
            onClick={() => onSwitchPanel('history')}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sidebarPanel === 'summary' && <SummaryPanel tab={tab} state={state} />}
          {sidebarPanel === 'tasks' && (
            <TasksPanel
              tab={tab}
              tasks={state.tasks[tab] || []}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
            />
          )}
          {sidebarPanel === 'history' && (
            <HistoryPanel
              tab={tab}
              activities={acts}
              onRevert={onRevertActivity}
              onClear={() => onClearHistory(tab)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({ tab, state }: { tab: string; state: AppState }) {
  const inits = state.initiatives[tab] || [];
  const acts = state.activities[tab] || [];
  const c = { g: 0, a: 0, r: 0, b: 0 };
  inits.forEach(i => c[i.rag]++);
  const done = acts.filter(a => a.done).length;
  const pct = acts.length ? Math.round((done / acts.length) * 100) : 0;

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <span className="font-sans text-[0.6rem] font-black tracking-widest uppercase text-slate-500">Progress Summary</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 p-4">
        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm">
          <div className="font-sans text-[1.4rem] font-black text-emerald-600">{c.g}</div>
          <div className="text-[0.55rem] text-slate-400 font-black uppercase tracking-widest">On Track</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm">
          <div className="font-sans text-[1.4rem] font-black text-amber-500">{c.a}</div>
          <div className="text-[0.55rem] text-slate-400 font-black uppercase tracking-widest">At Risk</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm">
          <div className="font-sans text-[1.4rem] font-black text-rose-500">{c.r}</div>
          <div className="text-[0.55rem] text-slate-400 font-black uppercase tracking-widest">Off Track</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm">
          <div className="font-sans text-[1.4rem] font-black text-slate-400">{c.b}</div>
          <div className="text-[0.55rem] text-slate-400 font-black uppercase tracking-widest">Not Started</div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-tight">Completion Rate</span>
            <span className="font-sans text-[0.65rem] font-black text-slate-900">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksPanel({
  tab,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: {
  tab: string;
  tasks: any[];
  onAddTask: (tab: string, title: string, owner?: string) => void;
  onToggleTask: (tab: string, id: string) => void;
  onDeleteTask: (tab: string, id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAddTask(tab, title, owner);
    setTitle('');
    setOwner('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <span className="font-sans text-[0.6rem] font-black tracking-widest uppercase text-slate-500">Action Items</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
        {tasks.length === 0 ? (
          <div className="p-8 text-[0.7rem] text-slate-400 text-center italic font-medium">No tasks assigned yet</div>
        ) : (
          tasks.map(t => (
            <div key={t.id} className={cn("bg-white border border-slate-200 rounded-sm p-3 mb-2 border-l-4 border-l-slate-400 shadow-sm transition-all hover:shadow-md", t.done && "opacity-50 border-l-emerald-500")}>
              <div className="flex items-start gap-3">
                <button
                  className={cn("w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center transition-all hover:border-slate-400", t.done && "bg-emerald-500 border-emerald-500")}
                  onClick={() => onToggleTask(tab, t.id)}
                >
                  {t.done && <Check size={10} color="white" strokeWidth={4} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-[0.75rem] font-bold block text-slate-800 leading-tight", t.done && "line-through text-slate-400")}>{t.title}</span>
                  {t.owner && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-tighter">Owner:</span>
                      <span className="text-[0.6rem] text-slate-500 font-black italic">{t.owner}</span>
                    </div>
                  )}
                </div>
                <button className="text-slate-300 hover:text-rose-500 transition-colors" onClick={() => onDeleteTask(tab, t.id)}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <input
          className="w-full p-2.5 mb-2 border border-slate-200 rounded-sm text-[0.75rem] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-medium"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <input
          className="w-full p-2.5 mb-2 border border-slate-200 rounded-sm text-[0.75rem] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-medium"
          placeholder="Assignee"
          value={owner}
          onChange={e => setOwner(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          className="w-full p-2.5 bg-slate-900 text-white rounded-sm font-sans text-[0.6rem] font-black tracking-widest uppercase mt-1 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm"
          onClick={handleAdd}
        >
          + Add Task
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({
  tab,
  activities,
  onRevert,
  onClear
}: {
  tab: string;
  activities: Activity[];
  onRevert: (id: string) => void;
  onClear: () => void;
}) {
  let allMoves: { act: Activity; mv: any; idx: number }[] = [];
  activities.forEach(act => {
    if (act.moveHistory?.length) {
      act.moveHistory.forEach((mv, idx) => {
        allMoves.push({ act, mv, idx });
      });
    }
  });
  allMoves.sort((a, b) => new Date(b.mv.at).getTime() - new Date(a.mv.at).getTime());

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <span className="font-sans text-[0.6rem] font-black tracking-widest uppercase text-slate-500">Timeline Audit</span>
        <button
          className="bg-white border border-slate-200 text-slate-500 text-[0.55rem] font-bold px-2.5 py-1.5 rounded-sm hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm uppercase tracking-tighter"
          onClick={onClear}
        >
          Reset Log
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
        {allMoves.length === 0 ? (
          <div className="p-8 text-[0.7rem] text-slate-400 text-center italic font-medium">No timeline adjustments recorded.<br/>Drag items to capture schedule changes.</div>
        ) : (
          allMoves.map(({ act, mv, idx }, i) => {
            const when = new Date(mv.at);
            const dateStr = when.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
            const timeStr = when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const isStatusUpdate = mv.type === 'status_update';
            const isImport = (mv.by || '').includes('via Excel import');
            const isLatest = idx === act.moveHistory!.length - 1;

            return (
              <div key={i} className={cn("bg-white border border-slate-200 rounded-sm p-3 mb-2 relative shadow-sm", isImport && "border-l-4 border-l-emerald-500")}>
                <div className="text-[0.75rem] font-bold text-slate-900 mb-1.5 leading-tight">
                  {act.label.replace(/^[\u{1F000}-\u{1FFFF}]|[\u2600-\u26FF]\s*/gu, '').trim()}
                </div>
                {isStatusUpdate ? (
                  <div className="text-[0.65rem] text-emerald-600 font-bold mb-1.5 bg-emerald-50 px-2 py-1 rounded-sm inline-block">
                    📥 Status: {mv.statusNote || mv.toRag || ''}
                  </div>
                ) : (
                  <div className="text-[0.65rem] text-slate-500 font-medium mb-1.5 flex items-center gap-2">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">{MONTHS[mv.from]}</span>
                    <span className="text-slate-300">→</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded text-white">{MONTHS[mv.to]}</span>
                  </div>
                )}
                <div className={cn("text-[0.6rem] text-slate-400 font-bold italic", isImport && "text-emerald-600")}>
                  {mv.by || 'System'} · {dateStr} {timeStr}
                </div>
                {isLatest && !isStatusUpdate && (
                  <button
                    className="absolute top-3 right-3 bg-rose-50 border border-rose-100 text-rose-600 text-[0.55rem] font-black uppercase tracking-tighter px-2 py-1 rounded-sm hover:bg-rose-100 transition-all shadow-sm"
                    onClick={() => onRevert(act.id)}
                  >
                    ↩ Revert
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
