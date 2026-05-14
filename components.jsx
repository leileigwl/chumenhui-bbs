// Shared UI components for 楚门会
const { useState } = React;

/* ─── Icon helper ─────────────────────────────────────────── */
function Ico({ name, size = 20, color = 'currentColor', filled = false }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 };
  const sw = filled ? '0' : '1.8';
  const f = filled ? color : 'none';
  const icons = {
    heart:    <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth={sw}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    bookmark: <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth={sw}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    message:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    share:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    home:     <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    compass:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={f}/></svg>,
    bell:     <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    user:     <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    plus:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    back:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2"><polyline points="15,18 9,12 15,6"/></svg>,
    more:     <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>,
    search:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    image:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
    tag:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    fire:     <svg style={s} viewBox="0 0 24 24" fill={f} stroke={color} strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
    pencil:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    check:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
    x:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    link:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[name] || null;
}

/* ─── Logo SVG ────────────────────────────────────────────── */
function Logo({ size = 28, color = '#C95B15' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Gate / 门 shape */}
      <rect x="4" y="10" width="5" height="17" rx="1.5" fill={color}/>
      <rect x="23" y="10" width="5" height="17" rx="1.5" fill={color}/>
      <rect x="4" y="10" width="24" height="5.5" rx="1.5" fill={color}/>
      {/* Diamond keystone at top */}
      <rect x="13.5" y="4" width="5" height="5" rx="1" fill={color} transform="rotate(45 16 6.5)"/>
    </svg>
  );
}

/* ─── Avatar ──────────────────────────────────────────────── */
function Avatar({ user, size = 36 }) {
  if (!user) return null;
  const palette = ['#C95B15', '#2B5CE6', '#1A7A4A', '#7C3AED', '#0891B2'];
  const bg = palette[user.id % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.4, fontWeight: '700', flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {user.name?.[0]}
    </div>
  );
}

/* ─── TagChip ─────────────────────────────────────────────── */
function TagChip({ categoryId, small = false }) {
  const cat = window.APP_DATA.categories.find(c => c.id === categoryId);
  if (!cat || categoryId === 'all') return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 100, background: cat.bg, color: cat.color,
      fontSize: small ? '11px' : '12px', fontWeight: '600', flexShrink: 0,
      letterSpacing: '0.2px',
    }}>
      {cat.label}
    </span>
  );
}

/* ─── DataHighlight ───────────────────────────────────────── */
function DataHighlight({ before, after }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#F8F5F0', borderRadius: 10, padding: '10px 14px', marginTop: 8,
    }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#A49E97', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>before</div>
        <div style={{ fontSize: 13, color: '#6B6560', fontWeight: 600 }}>{before}</div>
      </div>
      <div style={{ color: '#C95B15', fontSize: 18, fontWeight: 300 }}>→</div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#A49E97', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>after</div>
        <div style={{ fontSize: 13, color: '#1A7A4A', fontWeight: 700 }}>{after}</div>
      </div>
    </div>
  );
}

/* ─── ImagePlaceholder ────────────────────────────────────── */
function ImagePlaceholder({ categoryId, aspect = 1.4, rounded = true }) {
  const colorMap = {
    agent:   { from: '#EBF0FD', to: '#C5D5F8', stripe: '#2B5CE6', label: '智能体截图' },
    earning: { from: '#E6F5EE', to: '#BBE4D0', stripe: '#1A7A4A', label: '收益数据' },
    camp:    { from: '#FEF1E8', to: '#F8D5B0', stripe: '#C95B15', label: '训练营截图' },
    talent:  { from: '#F5F3FF', to: '#DDD6FE', stripe: '#7C3AED', label: '人才案例' },
  };
  const c = colorMap[categoryId] || colorMap.agent;
  const patId = `stripe-${categoryId}-${Math.floor(aspect * 10)}`;
  return (
    <div style={{
      position: 'relative', paddingTop: `${(1 / aspect) * 100}%`,
      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
      borderRadius: rounded ? '10px 10px 0 0' : 10,
      overflow: 'hidden',
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}>
        <defs>
          <pattern id={patId} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="16" stroke={c.stripe} strokeWidth="3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patId})`}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 6,
      }}>
        <Ico name="image" size={24} color={c.stripe}/>
        <span style={{ fontSize: 11, color: c.stripe, fontFamily: 'monospace', opacity: 0.8 }}>{c.label}</span>
      </div>
    </div>
  );
}

/* ─── PostCard ────────────────────────────────────────────── */
function PostCard({ post, onClick, onUserClick }) {
  const { users } = window.APP_DATA;
  const user = users.find(u => u.id === post.userId);

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
      overflow: 'hidden', marginBottom: 10,
    }}>
      {post.hasImage && <ImagePlaceholder categoryId={post.category} aspect={post.imageAspect || 1.4}/>}

      <div style={{ padding: '10px 12px 12px' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {post.isElite && (
            <span style={{
              padding: '2px 7px', borderRadius: 100,
              background: '#C95B15', color: 'white', fontSize: 10, fontWeight: 700,
            }}>精华</span>
          )}
          <TagChip categoryId={post.category} small/>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#1C1815', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: !post.hasImage ? 6 : 0,
        }}>
          {post.title}
        </div>

        {/* Excerpt (only if no image) */}
        {!post.hasImage && (
          <div style={{
            fontSize: 12, color: '#7A7268', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </div>
        )}

        {/* Data highlight */}
        {post.dataHighlight && <DataHighlight {...post.dataHighlight}/>}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div
            onClick={onUserClick ? (e) => { e.stopPropagation(); onUserClick(user); } : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: onUserClick ? 'pointer' : 'default' }}>
            <Avatar user={user} size={20}/>
            <span style={{ fontSize: 11, color: '#A49E97' }}>{user?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Ico name="heart" size={13} color="#A49E97"/>
            <span style={{ fontSize: 11, color: '#A49E97' }}>{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── BottomNav ───────────────────────────────────────────── */
function BottomNav({ active, onChange, onPublish }) {
  const items = [
    { id: 'feed',     label: '首页', icon: 'home' },
    { id: 'search',   label: '发现', icon: 'compass' },
    { id: 'publish',  label: '',     icon: 'plus', isAction: true },
    { id: 'messages', label: '消息', icon: 'bell' },
    { id: 'profile',  label: '我的', icon: 'user' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 58, background: '#fff', borderTop: '1px solid #EDE8E0',
      flexShrink: 0, padding: '0 4px',
    }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => item.isAction ? onPublish?.() : onChange(item.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, background: item.isAction ? '#C95B15' : 'none',
            border: 'none', cursor: 'pointer',
            padding: item.isAction ? 0 : '6px 14px',
            borderRadius: item.isAction ? '50%' : 0,
            width: item.isAction ? 46 : 'auto', height: item.isAction ? 46 : 'auto',
            justifyContent: 'center', color: item.isAction ? '#fff' : active === item.id ? '#C95B15' : '#A49E97',
          }}
        >
          <Ico name={item.icon} size={item.isAction ? 22 : 22}
            color={item.isAction ? '#fff' : active === item.id ? '#C95B15' : '#A49E97'}
            filled={active === item.id && !item.isAction}/>
          {!item.isAction && (
            <span style={{ fontSize: 10, fontWeight: active === item.id ? 600 : 400 }}>{item.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Exports ─────────────────────────────────────────────── */
Object.assign(window, { Ico, Logo, Avatar, TagChip, DataHighlight, ImagePlaceholder, PostCard, BottomNav });
