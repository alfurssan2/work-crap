/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState, Activity, Task, Initiative, RagStatus, MoveHistory } from './types';
import { DEFAULT_ACTIVITIES, DEFAULT_INITIATIVES, DETAIL_TABS, FUNCTIONS } from './constants';

const STORAGE_KEY = 'tqt_combined_v1';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all tabs have data
        DETAIL_TABS.forEach(t => {
          if (!parsed.activities[t]) parsed.activities[t] = JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES[t]));
          if (!parsed.initiatives[t]) parsed.initiatives[t] = JSON.parse(JSON.stringify(DEFAULT_INITIATIVES[t]));
          if (!parsed.tasks[t]) parsed.tasks[t] = [];
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }

    const initial: AppState = {
      nowMonth: 2,
      mapMilestones: {},
      tasks: {},
      activities: JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES)),
      initiatives: JSON.parse(JSON.stringify(DEFAULT_INITIATIVES)),
    };
    DETAIL_TABS.forEach(t => {
      if (!initial.tasks[t]) initial.tasks[t] = [];
    });
    return initial;
  });

  const saveState = useCallback((newState: AppState) => {
    const stateWithTime = { ...newState, lastSaved: new Date().toISOString() };
    setState(stateWithTime);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTime));
  }, []);

  const updateNowMonth = (month: number) => {
    saveState({ ...state, nowMonth: month });
  };

  const updateActivity = (tab: string, activity: Activity) => {
    const newActivities = { ...state.activities };
    const index = newActivities[tab].findIndex(a => a.id === activity.id);
    if (index > -1) {
      newActivities[tab][index] = activity;
    } else {
      newActivities[tab].push(activity);
    }
    saveState({ ...state, activities: newActivities });
  };

  const deleteActivity = (tab: string, id: string) => {
    const newActivities = { ...state.activities };
    newActivities[tab] = newActivities[tab].filter(a => a.id !== id);
    saveState({ ...state, activities: newActivities });
  };

  const cycleInitiativeRag = (tab: string, initId: string) => {
    const newInits = { ...state.initiatives };
    const init = newInits[tab].find(i => i.id === initId);
    if (init) {
      const order: RagStatus[] = ['g', 'a', 'r', 'b'];
      const currentIndex = order.indexOf(init.rag);
      init.rag = order[(currentIndex + 1) % order.length];
      saveState({ ...state, initiatives: newInits });
    }
  };

  const toggleActivityDone = (tab: string, id: string) => {
    const newActivities = { ...state.activities };
    const act = newActivities[tab].find(a => a.id === id);
    if (act) {
      act.done = !act.done;
      saveState({ ...state, activities: newActivities });
    }
  };

  const addTask = (tab: string, title: string, owner?: string) => {
    const newTasks = { ...state.tasks };
    if (!newTasks[tab]) newTasks[tab] = [];
    newTasks[tab].push({
      id: 't' + Date.now(),
      title,
      owner,
      done: false
    });
    saveState({ ...state, tasks: newTasks });
  };

  const toggleTask = (tab: string, id: string) => {
    const newTasks = { ...state.tasks };
    const task = newTasks[tab].find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      saveState({ ...state, tasks: newTasks });
    }
  };

  const deleteTask = (tab: string, id: string) => {
    const newTasks = { ...state.tasks };
    newTasks[tab] = newTasks[tab].filter(t => t.id !== id);
    saveState({ ...state, tasks: newTasks });
  };

  const updateMapMilestone = (id: string, data: { rag?: RagStatus; note?: string; currentMonth?: number; baselineMonth?: number; moveHistory?: MoveHistory[] }) => {
    const newMapMilestones = { ...state.mapMilestones };
    newMapMilestones[id] = { ...(newMapMilestones[id] || {}), ...data };
    saveState({ ...state, mapMilestones: newMapMilestones });
  };

  const resetState = () => {
    const initial: AppState = {
      nowMonth: 2,
      mapMilestones: {},
      tasks: {},
      activities: JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES)),
      initiatives: JSON.parse(JSON.stringify(DEFAULT_INITIATIVES)),
    };
    DETAIL_TABS.forEach(t => {
      initial.tasks[t] = [];
    });
    saveState(initial);
  };

  const importFullState = (newState: AppState) => {
    saveState(newState);
  };

  const moveActivity = (tab: string, id: string, toMonth: number, by: string) => {
    const newActivities = { ...state.activities };
    const act = newActivities[tab].find(a => a.id === id);
    if (act && act.month !== toMonth) {
      if (act.baselineMonth === undefined) act.baselineMonth = act.month;
      if (!act.moveHistory) act.moveHistory = [];
      act.moveHistory.push({
        from: act.month,
        to: toMonth,
        by,
        at: new Date().toISOString()
      });
      act.month = toMonth;
      saveState({ ...state, activities: newActivities });
    }
  };

  const moveMapMilestone = (id: string, toMonth: number, by: string) => {
    const newMapMilestones = { ...state.mapMilestones };
    const ms = newMapMilestones[id] || {};
    const currentMonth = ms.currentMonth ?? FUNCTIONS.find(f => f.milestones.some(m => m.id === id))?.milestones.find(m => m.id === id)?.month ?? 0;
    
    if (currentMonth !== toMonth) {
      if (ms.baselineMonth === undefined) ms.baselineMonth = currentMonth;
      if (!ms.moveHistory) ms.moveHistory = [];
      ms.moveHistory.push({
        from: currentMonth,
        to: toMonth,
        by,
        at: new Date().toISOString()
      });
      ms.currentMonth = toMonth;
      newMapMilestones[id] = ms;
      saveState({ ...state, mapMilestones: newMapMilestones });
    }
  };

  const cycleActivityRag = (tab: string, id: string) => {
    const newActivities = { ...state.activities };
    const act = newActivities[tab].find(a => a.id === id);
    if (act) {
      const order: RagStatus[] = ['g', 'a', 'r', 'b'];
      const currentIndex = order.indexOf(act.rag || 'b');
      act.rag = order[(currentIndex + 1) % order.length];
      saveState({ ...state, activities: newActivities });
    }
  };

  const cycleMapMilestoneRag = (id: string) => {
    const newMapMilestones = { ...state.mapMilestones };
    const ms = newMapMilestones[id] || {};
    const order: RagStatus[] = ['g', 'a', 'r', 'b'];
    const currentRag = ms.rag || FUNCTIONS.find(f => f.milestones.some(m => m.id === id))?.milestones.find(m => m.id === id)?.rag || 'b';
    const currentIndex = order.indexOf(currentRag);
    ms.rag = order[(currentIndex + 1) % order.length];
    newMapMilestones[id] = ms;
    saveState({ ...state, mapMilestones: newMapMilestones });
  };

  return {
    state,
    updateNowMonth,
    updateActivity,
    deleteActivity,
    moveActivity,
    moveMapMilestone,
    cycleInitiativeRag,
    cycleActivityRag,
    cycleMapMilestoneRag,
    toggleActivityDone,
    addTask,
    toggleTask,
    deleteTask,
    updateMapMilestone,
    resetState,
    importFullState,
  };
}
