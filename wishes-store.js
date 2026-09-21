/* Standalone local wishes v0.1. No shared-device or Runtime sync. */
(() => {
  'use strict';
  const KEY = 'asteria.visual.wishes.v1';
  const STATUSES = Object.freeze(['not-started','planning','active','completed','paused']);
  const isText = (s, n) => typeof s === 'string' && s.trim().length > 0 && s.length <= n;
  const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(new Date(s+'T12:00:00').getTime()) &&
    new Date(s+'T12:00:00').toISOString().slice(0,10) === s;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const urlValid = (s) => {
    try { const u = new URL(s); return ['https:','http:'].includes(u.protocol) && s.length <= 1500; }
    catch (_) { return false; }
  };
  function valid(w) {
    return w && typeof w === 'object' && !Array.isArray(w) &&
      isText(w.id,80) && isText(w.title,90) && STATUSES.includes(w.status) &&
      isText(w.createdAt,35) && isText(w.updatedAt,35) &&
      (w.proposedOn === '' || isDate(w.proposedOn)) &&
      typeof w.idea === 'string' && w.idea.length <= 3000 &&
      typeof w.plan === 'string' && w.plan.length <= 5000 &&
      ['Shen','Nuo','Together',''].includes(w.proposer) &&
      Array.isArray(w.links) && w.links.length <= 30 &&
      w.links.every(l => l && isText(l.title,100) && urlValid(l.url)) &&
      Array.isArray(w.progress) && w.progress.length <= 100 &&
      w.progress.every(p => p && isText(p.id,80) && isText(p.date,35) && isText(p.text,1000));
  }
  function list() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(parsed) ? clone(parsed.filter(valid).slice(0,300)) : [];
    } catch (_) { return []; }
  }
  function persist(next) {
    if (!Array.isArray(next) || next.length > 300 || !next.every(valid)) return {ok:false,error:'invalid data'};
    try { localStorage.setItem(KEY,JSON.stringify(next)); window.dispatchEvent(new Event('asteria:wishes-change')); return {ok:true}; }
    catch (error) { return {ok:false,error:String(error)}; }
  }
  function save(record) {
    if (!valid(record)) return {ok:false,error:'invalid wish'};
    const all=list(), index=all.findIndex(w=>w.id===record.id);
    if(index>=0) all[index]=clone(record); else all.unshift(clone(record));
    return persist(all);
  }
  const id = () => typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : String(Date.now())+'-'+Math.random().toString(36).slice(2);
  window.AsteriaWishes=Object.freeze({storageKey:KEY,statuses:STATUSES,list,save,id,urlValid,isDate});
})();
