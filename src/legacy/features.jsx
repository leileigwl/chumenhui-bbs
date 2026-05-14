// features.jsx — UserProfileScreen + FilterSheet
const { useState } = React;
const { Ico, Avatar, TagChip, PostCard } = window;

/* ══════════════════════════════════════════════════════════
   USER PROFILE SCREEN
══════════════════════════════════════════════════════════ */
function UserProfileScreen({ user, onBack, onPostClick, accentColor, posts }) {
  const [following, setFollowing] = useState(false);
  const safeUser = user || window.APP_DATA.users[0];
  const userPosts = (posts || window.APP_DATA.posts).filter(p => p.userId === safeUser.id);
  const left  = userPosts.filter((_, i) => i % 2 === 0);
  const right = userPosts.filter((_, i) => i % 2 === 1);
  const palette = ['#C95B15', '#2B5CE6', '#1A7A4A', '#7C3AED', '#0891B2'];
  const bg = palette[safeUser.id % palette.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover */}
        <div style={{
          height: 110, position: 'relative',
          background: `linear-gradient(135deg, ${bg}dd, #1C1815)`,
        }}>
          <button onClick={onBack} style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(0,0,0,0.28)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          }}>
            <Ico name="back" size={18} color="#fff"/>
          </button>
          <div style={{
            position: 'absolute', left: 56, right: 16, top: 20,
            fontSize: 16, fontWeight: 700, color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {safeUser.name}
          </div>
        </div>

        {/* Info card */}
        <div style={{ background: '#fff', padding: '0 16px 16px', position: 'relative' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 26, fontWeight: 700,
            border: '3px solid #fff', position: 'absolute', top: -34, left: 16,
          }}>{safeUser.name?.[0]}</div>

          <div style={{ paddingTop: 42 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1815' }}>{safeUser.name}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 100,
                  background: '#FEF1E8', color: accentColor, fontSize: 11, fontWeight: 700,
                }}>{safeUser.level}</span>
              </div>
              <button
                onClick={() => setFollowing(!following)}
                style={{
                  background: following ? '#F8F5F0' : accentColor,
                  color: following ? '#6B6560' : '#fff',
                  border: following ? '1px solid #E8E2D9' : 'none',
                  borderRadius: 20, padding: '8px 20px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {following ? '已关注' : '+ 关注'}
              </button>
            </div>

            <div style={{ fontSize: 13, color: '#7A7268', marginBottom: 12 }}>{safeUser.title}</div>

            {/* Stats */}
            <div style={{ display: 'flex', borderTop: '1px solid #EDE8E0', paddingTop: 14 }}>
              {[
                ['发帖',  safeUser.posts],
                ['获赞',  safeUser.likes > 999 ? `${(safeUser.likes/1000).toFixed(1)}k` : safeUser.likes],
                ['粉丝',  safeUser.followers > 999 ? `${(safeUser.followers/1000).toFixed(1)}k` : safeUser.followers],
              ].map(([label, val]) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1C1815' }}>{val}</div>
                  <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts waterfall */}
        <div style={{ padding: '10px 10px 24px', marginTop: 8 }}>
          {userPosts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#A49E97', fontSize: 14, marginTop: 40 }}>
              暂无发布内容
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                {left.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)}/>)}
              </div>
              <div style={{ flex: 1 }}>
                {right.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)}/>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FILTER SHEET
══════════════════════════════════════════════════════════ */
function FilterSheet({ visible, onClose, onApply, accentColor }) {
  const { categories } = window.APP_DATA;
  const [selCat,  setSelCat]  = useState('all');
  const [selTime, setSelTime] = useState('all');
  const [selType, setSelType] = useState('all');

  const times = [['all','全部时间'], ['week','本周'], ['month','本月']];
  const types = [['all','全部'], ['image','有图片'], ['elite','精华']];

  const chipStyle = (active, color, bg) => ({
    padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 13,
    background: active ? bg : '#F8F5F0',
    color: active ? color : '#6B6560',
    border: `1.5px solid ${active ? color : 'transparent'}`,
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  });

  return (
    <>
      {visible && (
        <div
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 80 }}
        />
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '20px 20px 0 0',
        zIndex: 90, maxHeight: '72%', overflowY: 'auto',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E8E2D9' }}/>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 16px' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1815' }}>筛选内容</span>
          <button
            onClick={() => { setSelCat('all'); setSelTime('all'); setSelType('all'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#A49E97' }}>
            重置
          </button>
        </div>

        {/* Category */}
        <div style={{ padding: '0 16px 18px' }}>
          <div style={{ fontSize: 11, color: '#A49E97', fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>分类</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(cat => (
              <span key={cat.id} onClick={() => setSelCat(cat.id)}
                style={chipStyle(selCat === cat.id, cat.color || accentColor, cat.bg || '#FEF1E8')}>
                {cat.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#F2EDE6', margin: '0 16px 18px' }}/>

        {/* Time */}
        <div style={{ padding: '0 16px 18px' }}>
          <div style={{ fontSize: 11, color: '#A49E97', fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>发布时间</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {times.map(([id, label]) => (
              <span key={id} onClick={() => setSelTime(id)}
                style={chipStyle(selTime === id, accentColor, '#FEF1E8')}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#F2EDE6', margin: '0 16px 18px' }}/>

        {/* Type */}
        <div style={{ padding: '0 16px 22px' }}>
          <div style={{ fontSize: 11, color: '#A49E97', fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>内容类型</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {types.map(([id, label]) => (
              <span key={id} onClick={() => setSelType(id)}
                style={chipStyle(selType === id, accentColor, '#FEF1E8')}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Apply */}
        <div style={{ padding: '0 16px 30px' }}>
          <button
            onClick={() => { onApply({ category: selCat, time: selTime, type: selType }); onClose(); }}
            style={{
              width: '100%', background: accentColor, color: '#fff', border: 'none',
              borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
            应用筛选
          </button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { UserProfileScreen, FilterSheet });
