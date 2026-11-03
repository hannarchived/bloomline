// Storage layer: Supabase (accounts + per-user cloud sync) with a localStorage cache.
// If config.js still has the placeholder values, the app runs in "local mode" instead.
(function () {
  const cfg = window.BLOOMLINE_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !/YOUR_/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY);
  const sb = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  let user = null, timer = null, pending = null;
  const key = () => 'bloomline:' + (user ? user.id : 'local');

  async function flush() {
    if (!sb || !user || !pending) return;
    const state = pending; pending = null;
    const { error } = await sb.from('user_state').upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
    if (error) console.warn('bloomline: sync failed -', error.message);
  }
  addEventListener('pagehide', flush);
  addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  window.Store = {
    enabled: !!sb,
    get user() { return user; },
    async session() {
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      user = data.session ? data.session.user : null;
      return user;
    },
    onAuth(cb) { if (sb) sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') user = null; cb(ev); }); },
    async signUp(email, password) {
      const r = await sb.auth.signUp({ email, password });
      if (r.data && r.data.session) user = r.data.session.user;
      return r;
    },
    async signIn(email, password) {
      const r = await sb.auth.signInWithPassword({ email, password });
      if (r.data && r.data.session) user = r.data.session.user;
      return r;
    },
    async signOut() {
      await flush();
      try { localStorage.removeItem(key()); } catch (e) {}   // don't leave a user's cached data on a shared device
      if (sb) await sb.auth.signOut();
      user = null;
    },
    // Returns the saved state (cloud first, local cache as a fallback), or null for a brand new user.
    async load() {
      let local = null;
      try { local = JSON.parse(localStorage.getItem(key())); } catch (e) {}
      if (!sb || !user) return local;
      const { data, error } = await sb.from('user_state').select('data').eq('user_id', user.id).maybeSingle();
      if (error) { console.warn('bloomline: load failed -', error.message); return local; }
      return data ? data.data : local;
    },
    // Called on every change: cache locally right away, sync to Supabase after a short pause.
    save(state) {
      try { localStorage.setItem(key(), JSON.stringify(state)); } catch (e) {}
      if (!sb || !user) return;
      pending = state; clearTimeout(timer); timer = setTimeout(flush, 700);
    }
  };
})();
