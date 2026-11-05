(function () {
  const cfg = window.BLOOMLINE_CONFIG || {};
  const rawUrl = String(cfg.SUPABASE_URL || '').trim(), apiKey = String(cfg.SUPABASE_ANON_KEY || '').trim();
  // Tidy common URL mistakes: trailing slash, /rest/v1 paths, or the dashboard link instead of the project URL.
  function cleanUrl(u) {
    const m = u.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
    if (m) return 'https://' + m[1] + '.supabase.co';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try { return new URL(u).origin; } catch (e) { return u; }
  }
  const url = cleanUrl(rawUrl);
  const configured = rawUrl && apiKey && !/YOUR_/.test(rawUrl + apiKey);
  const sb = configured && window.supabase ? window.supabase.createClient(url, apiKey) : null;

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
    host: url.replace(/^https?:\/\//, ''),
    get user() { return user; },
    async session() {
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      user = data.session ? data.session.user : null;
      return user;
    },
    onAuth(cb) { if (sb) sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') user = null; cb(ev); }); },
    async signUp(email, password, name) {
      const r = await sb.auth.signUp({ email, password, options: { data: { name: name || null } } });
      if (r.data && r.data.session) user = r.data.session.user;
      return r;
    },
    async signIn(email, password, name) {
      const r = await sb.auth.signInWithPassword({ email, password });
      if (r.data && r.data.session) {
        user = r.data.session.user;
        if (name) {   // lets existing accounts set or change their nickname at sign in
          const u = await sb.auth.updateUser({ data: { name } });
          if (u.data && u.data.user) user = u.data.user;
        }
      }
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
    
    save(state) {
      try { localStorage.setItem(key(), JSON.stringify(state)); } catch (e) {}
      if (!sb || !user) return;
      pending = state; clearTimeout(timer); timer = setTimeout(flush, 700);
    }
  };
})();
