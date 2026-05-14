const { useState, useRef, useEffect } = React;
const { Ico, Logo, Avatar, TagChip, DataHighlight, ImagePlaceholder, PostImage, PostCard, BottomNav } = window;
const { TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio, TweakToggle } = window;
const { UserProfileScreen, FilterSheet } = window;
const { SettingsScreen } = window;

/* ══════════════════════════════════════════════════════════
   FEED SCREEN
══════════════════════════════════════════════════════════ */
function FeedScreen({ onPostClick, onViewHotList, onUserClick, onFilterClick, accentColor, posts }) {
  const { categories } = window.APP_DATA;
  const [activeCat, setActiveCat] = useState('all');
  const [filter, setFilter] = useState('hot');
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const pullRef = useRef(0);

  const sortedPosts = [...posts].sort((a, b) => {
    if (filter === 'new') return (b.id || 0) - (a.id || 0);
    if (filter === 'elite') return Number(b.isElite) - Number(a.isElite) || (b.likes || 0) - (a.likes || 0);
    return (b.likes || 0) - (a.likes || 0);
  });
  const allPosts = activeCat === 'all' ? sortedPosts : sortedPosts.filter(p => p.category === activeCat);
  const hasMore = visibleCount < allPosts.length;
  const displayed = allPosts.slice(0, visibleCount);
  const left  = displayed.filter((_, i) => i % 2 === 0);
  const right = displayed.filter((_, i) => i % 2 === 1);

  const hotTitles = [
    '从零到月薪 5 万 AI 工程师路线图',
    '帮 20 家企业 AI 落地踩过的 10 个真实坑',
    '3 个月 AI 副业月入 3 万，完整复盘',
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onTS = (e) => { if (el.scrollTop === 0) touchStartY.current = e.touches[0].clientY; };
    const onTM = (e) => {
      if (el.scrollTop > 5 || refreshing) return;
      const d = e.touches[0].clientY - touchStartY.current;
      if (d > 8) { pullRef.current = Math.min(d * 0.42, 64); setPullDist(pullRef.current); }
    };
    const onTE = () => {
      if (pullRef.current >= 48 && !refreshing) {
        setRefreshing(true); setPullDist(0);
        setTimeout(() => { setRefreshing(false); setVisibleCount(8); }, 1500);
      } else { setPullDist(0); }
      pullRef.current = 0;
    };
    el.addEventListener('touchstart', onTS, { passive: true });
    el.addEventListener('touchmove',  onTM, { passive: true });
    el.addEventListener('touchend',   onTE);
    return () => {
      el.removeEventListener('touchstart', onTS);
      el.removeEventListener('touchmove',  onTM);
      el.removeEventListener('touchend',   onTE);
    };
  }, [refreshing]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120 && hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => { setVisibleCount(c => c + 4); setLoadingMore(false); }, 900);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Top bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE8E0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 8px', gap: 10 }}>
          <Logo size={28} color={accentColor}/>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1C1815', letterSpacing: '-0.3px' }}>楚门会</span>
          <div style={{ flex: 1 }}/>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B6560' }}>
            <Ico name="search" size={20} color="#6B6560"/>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative', color: '#6B6560' }}>
            <Ico name="bell" size={20} color="#6B6560"/>
            <span style={{
              position: 'absolute', top: 2, right: 2, width: 7, height: 7,
              background: accentColor, borderRadius: '50%', border: '1.5px solid #fff',
            }}/>
          </button>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto', padding: '0 16px',
          scrollbarWidth: 'none',
        }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCat(cat.id); setVisibleCount(8); }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 14, whiteSpace: 'nowrap',
              color: activeCat === cat.id ? accentColor : '#6B6560',
              fontWeight: activeCat === cat.id ? 700 : 400,
              borderBottom: activeCat === cat.id ? `2.5px solid ${accentColor}` : '2.5px solid transparent',
              flexShrink: 0,
            }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', background: '#F8F5F0' }}>

        {/* Pull-to-refresh indicator */}
        {(pullDist > 0 || refreshing) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: refreshing ? 48 : pullDist,
            transition: pullDist === 0 ? 'height 0.3s ease' : 'none',
            overflow: 'hidden', background: '#F8F5F0',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `2.5px solid ${accentColor}`, borderTopColor: 'transparent',
              animation: refreshing ? 'cmSpin 0.8s linear infinite' : 'none',
              transform: !refreshing ? `rotate(${pullDist * 4}deg)` : undefined,
            }}/>
          </div>
        )}

        {/* Hot list (only on 全部) */}
        {activeCat === 'all' && (
          <div style={{ background: '#fff', borderBottom: '6px solid #F8F5F0', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico name="fire" size={16} color={accentColor} filled/>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1815' }}>热门榜单</span>
              </div>
              <span onClick={onViewHotList} style={{ fontSize: 12, color: accentColor, cursor: 'pointer' }}>查看全部 ›</span>
            </div>
            {hotTitles.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0' }}>
                <span style={{
                  width: 20, textAlign: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  color: i === 0 ? accentColor : i === 1 ? '#8B5CF6' : '#A49E97',
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#1C1815', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '10px 16px', background: '#F8F5F0',
        }}>
          {[['hot','热门'], ['new','最新'], ['elite','精华']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
              fontSize: 14, fontWeight: filter === id ? 700 : 400,
              color: filter === id ? '#1C1815' : '#A49E97',
              borderBottom: filter === id ? `2px solid #1C1815` : '2px solid transparent',
            }}>{label}</button>
          ))}
          <div style={{ flex: 1 }}/>
          <button onClick={onFilterClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Ico name="filter" size={15} color="#6B6560"/>
            <span style={{ fontSize: 12, color: '#6B6560' }}>筛选</span>
          </button>
        </div>

        {/* 2-column waterfall */}
        <div style={{ display: 'flex', gap: 8, padding: '4px 10px 10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {left.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)} onUserClick={onUserClick}/>)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {right.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)} onUserClick={onUserClick}/>)}
          </div>
        </div>

        {/* Load more */}
        {loadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2.5px solid ${accentColor}`, borderTopColor: 'transparent', animation: 'cmSpin 0.8s linear infinite' }}/>
          </div>
        )}
        {!hasMore && displayed.length > 0 && !loadingMore && (
          <div style={{ textAlign: 'center', color: '#C8C0B8', fontSize: 12, padding: '14px 0 22px' }}>— 没有更多了 —</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   POST DETAIL SCREEN
══════════════════════════════════════════════════════════ */
function PostDetailScreen({ post, onBack, onShare, onUserClick, savedPostIds, onToggleSave }) {
  const { users, comments, postBodies } = window.APP_DATA;
  const user = users.find(u => u.id === post.userId);
  const postComments = comments[post.id] || [];
  const body = postBodies[post.id];
  const [liked, setLiked] = useState(false);
  const bookmarked = savedPostIds ? savedPostIds.has(post.id) : false;

  const renderBody = (sections) => sections.map((s, i) => {
    if (s.type === 'h2') return (
      <div key={i} style={{ fontSize: 16, fontWeight: 700, color: '#1C1815', margin: '18px 0 6px' }}>{s.text}</div>
    );
    if (s.type === 'list') return (
      <ul key={i} style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0' }}>
        {s.items.map((item, j) => (
          <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#C95B15', fontSize: 14, marginTop: 1, flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 14, color: '#1C1815', lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    );
    return (
      <p key={i} style={{ fontSize: 15, color: '#2A2520', lineHeight: 1.85, margin: '6px 0' }}>{s.text}</p>
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        borderBottom: '1px solid #EDE8E0', flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 6, background: '#fff',
      }}>
        <button onClick={onBack} style={{
          background: '#F8F5F0', border: '1px solid #E8E2D9', cursor: 'pointer',
          padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4,
          color: '#1C1815', borderRadius: 999,
        }}>
          <Ico name="back" size={22} color="#1C1815"/>
          <span style={{ fontSize: 15 }}>返回</span>
        </button>
        <div style={{ flex: 1 }}/>
        <button onClick={onShare} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Ico name="share" size={20} color="#6B6560"/>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
          <Ico name="more" size={20} color="#6B6560"/>
        </button>
      </div>

      {/* Content scroll area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px' }}>
          <div onClick={() => onUserClick && onUserClick(user)} style={{ cursor: onUserClick ? 'pointer' : 'default' }}>
            <Avatar user={user} size={44}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1815' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{user?.title} · {post.timeAgo}</div>
          </div>
          <button style={{
            background: '#C95B15', color: '#fff', border: 'none',
            borderRadius: 20, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>关注</button>
        </div>

        {/* Tags + Title */}
        <div style={{ padding: '0 16px 16px' }}>
          <TagChip categoryId={post.category}/>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#1C1815', lineHeight: 1.4, margin: '10px 0 4px' }}>
            {post.title}
          </h1>

          {/* Image */}
          {post.hasImage && (
            <div style={{ margin: '12px 0' }}>
              <PostImage post={post} rounded={false}/>
            </div>
          )}

          {/* Body */}
          <div style={{ marginTop: 12 }}>
            {body ? renderBody(body) : (
              <p style={{ fontSize: 15, color: '#2A2520', lineHeight: 1.85 }}>{post.excerpt}</p>
            )}
          </div>

          {/* Data highlight */}
          {post.dataHighlight && (
            <div style={{ margin: '16px 0' }}>
              <DataHighlight {...post.dataHighlight}/>
            </div>
          )}

          {/* Hashtags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
            {post.tags?.map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: 100,
                background: '#F2EDE6', color: '#7A7268', fontSize: 12,
              }}>#{tag}</span>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div style={{ borderTop: '8px solid #F8F5F0', padding: '0 16px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1815', padding: '14px 0 10px' }}>
            评论 {postComments.length}
          </div>
          {postComments.length === 0 && (
            <div style={{ textAlign: 'center', color: '#A49E97', fontSize: 13, padding: '20px 0' }}>
              暂无评论，来说点什么
            </div>
          )}
          {postComments.map((c, i) => {
            const cu = users.find(u => u.id === c.userId);
            const hasReplies = c.replies && c.replies.length > 0;
            return (
              <div key={c.id} style={{
                padding: '12px 0',
                borderBottom: i < postComments.length - 1 ? '1px solid #F2EDE6' : 'none',
              }}>
                {/* Main comment */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Avatar user={cu} size={32}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1815' }}>{cu?.name}</span>
                      <span style={{ fontSize: 11, color: '#A49E97' }}>{c.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#2A2520', lineHeight: 1.6, marginTop: 3 }}>{c.content}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Ico name="heart" size={13} color="#A49E97"/>
                        <span style={{ fontSize: 12, color: '#A49E97' }}>{c.likes}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#A49E97', cursor: 'pointer' }}>回复</span>
                    </div>
                  </div>
                </div>
                {/* Replies */}
                {hasReplies && (
                  <div style={{ marginLeft: 42, marginTop: 8, background: '#F8F5F0', borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {c.replies.map(r => {
                      const ru = users.find(u => u.id === r.userId);
                      return (
                        <div key={r.id} style={{ display: 'flex', gap: 8 }}>
                          <Avatar user={ru} size={24}/>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1815' }}>{ru?.name}</span>
                              <span style={{ fontSize: 11, color: '#A49E97' }}>{r.timeAgo}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#2A2520', lineHeight: 1.5 }}>{r.content}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <Ico name="heart" size={11} color="#A49E97"/>
                              <span style={{ fontSize: 11, color: '#A49E97' }}>{r.likes}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 12px',
        borderTop: '1px solid #EDE8E0', background: '#fff', flexShrink: 0,
      }}>
        <div style={{
          flex: 1, background: '#F8F5F0', borderRadius: 20,
          padding: '9px 14px', fontSize: 13, color: '#A49E97',
        }}>写评论…</div>
        {[
          { icon: 'heart',    count: post.likes + (liked ? 1 : 0),      active: liked,      onTap: () => setLiked(!liked) },
          { icon: 'bookmark', count: post.bookmarks + (bookmarked ? 1 : 0), active: bookmarked, onTap: () => onToggleSave && onToggleSave(post.id) },
          { icon: 'share',    count: null, active: false, onTap: onShare },
        ].map(({ icon, count, active, onTap }) => (
          <button key={icon} onClick={onTap} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#C95B15' : '#A49E97',
          }}>
            <Ico name={icon} size={20} color={active ? '#C95B15' : '#A49E97'} filled={active}/>
            {count != null && <span style={{ fontSize: 11 }}>{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEARCH SCREEN
══════════════════════════════════════════════════════════ */
function SearchScreen({ onPostClick }) {
  const { posts, categories } = window.APP_DATA;
  const [query, setQuery] = useState('');
  const hotSearches = ['Claude API', 'Dify 搭建', 'AI副业', '本地部署', 'Prompt技巧', 'n8n自动化'];
  const results = query ? posts.filter(p =>
    p.title.includes(query) || p.excerpt.includes(query)
  ) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      {/* Search bar */}
      <div style={{ background: '#fff', padding: '14px 16px 12px', borderBottom: '1px solid #EDE8E0', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F2EDE6', borderRadius: 12, padding: '9px 14px',
        }}>
          <Ico name="search" size={17} color="#A49E97"/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索帖子、话题、用户…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: '#1C1815',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Ico name="x" size={16} color="#A49E97"/>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {!query ? (
          <>
            {/* Categories */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1815', marginBottom: 10, letterSpacing: 0.5 }}>分类浏览</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <div key={cat.id} style={{
                    background: cat.bg, borderRadius: 12,
                    padding: '14px 16px', cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</div>
                    <div style={{ fontSize: 12, color: cat.color, opacity: 0.7, marginTop: 2 }}>
                      {posts.filter(p => p.category === cat.id).length} 篇内容
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot searches */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1815', marginBottom: 10, letterSpacing: 0.5 }}>热门搜索</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hotSearches.map((s, i) => (
                  <span key={s} onClick={() => setQuery(s)} style={{
                    padding: '6px 14px', borderRadius: 100,
                    background: '#fff', border: '1px solid #EDE8E0',
                    fontSize: 13, color: '#4A4540', cursor: 'pointer',
                  }}>
                    {i < 3 && <span style={{ color: '#C95B15', marginRight: 3, fontSize: 11, fontWeight: 700 }}>{i+1}</span>}
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: '#A49E97', marginBottom: 12 }}>
              找到 {results.length} 条结果
            </div>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A49E97', fontSize: 14, marginTop: 40 }}>
                暂无相关内容
              </div>
            ) : (
              results.map(p => (
                <div key={p.id} onClick={() => onPostClick(p)} style={{
                  background: '#fff', borderRadius: 12, padding: 14,
                  marginBottom: 10, cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <TagChip categoryId={p.category} small/>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1815', marginTop: 6, lineHeight: 1.5 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#7A7268', marginTop: 4, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.excerpt}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#A49E97' }}>{p.timeAgo}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#A49E97' }}>
                      <Ico name="heart" size={11} color="#A49E97"/> {p.likes}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFILE SCREEN
══════════════════════════════════════════════════════════ */
function ProfileScreen({ onPostClick, accentColor, savedPostIds, onEditProfile, posts }) {
  const { users } = window.APP_DATA;
  const me = users[3];
  const myPosts = posts.filter(p => p.userId === me.id);
  const savedPosts = savedPostIds ? posts.filter(p => savedPostIds.has(p.id)) : [];
  const [tab, setTab] = useState('posts');

  const shownPosts = tab === 'posts' ? myPosts : tab === 'saved' ? savedPosts : myPosts.filter(p => p.isElite);
  const left  = shownPosts.filter((_, i) => i % 2 === 0);
  const right = shownPosts.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Cover */}
        <div style={{
          height: 120, position: 'relative',
          background: `linear-gradient(135deg, ${accentColor}cc, #1C1815)`,
        }}>
          <button onClick={onEditProfile} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer',
          }}>编辑资料</button>
        </div>

        {/* Avatar + Info */}
        <div style={{ background: '#fff', padding: '0 16px 16px', position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 700,
            border: '3px solid #fff', position: 'absolute', top: -36, left: 16,
          }}>{me.name[0]}</div>

          <div style={{ paddingTop: 44 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1C1815' }}>{me.name}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 100,
                background: '#FEF1E8', color: accentColor, fontSize: 11, fontWeight: 700,
              }}>{me.level}</span>
            </div>
            <div style={{ fontSize: 13, color: '#7A7268', marginBottom: 10 }}>{me.title}</div>
            <div style={{ fontSize: 13, color: '#7A7268', lineHeight: 1.6, marginBottom: 14 }}>
              专注 AI 落地与人才培养，帮助个人和企业用好 AI 工具。
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #EDE8E0', paddingTop: 14 }}>
              {[['发帖', me.posts], ['获赞', `${(me.likes / 1000).toFixed(1)}k`], ['粉丝', me.followers]].map(([label, val]) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1815' }}>{val}</div>
                  <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#fff', borderBottom: '1px solid #EDE8E0',
          marginTop: 8,
        }}>
          {[['posts','发帖'], ['saved','收藏'], ['elite','精华']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 0', fontSize: 14,
              fontWeight: tab === id ? 700 : 400,
              color: tab === id ? '#1C1815' : '#A49E97',
              borderBottom: tab === id ? `2.5px solid ${accentColor}` : '2.5px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* Post grid */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 10px 20px' }}>
          {shownPosts.length === 0 ? (
            <div style={{ flex: 1, textAlign: 'center', color: '#A49E97', fontSize: 13, padding: '32px 0' }}>
              {tab === 'saved' ? '还没有收藏内容' : '暂无内容'}
            </div>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {left.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)}/>)}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {right.map(p => <PostCard key={p.id} post={p} onClick={() => onPostClick(p)}/>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE POST SCREEN
══════════════════════════════════════════════════════════ */
function CreatePostScreen({ onBack, accentColor, onSubmit }) {
  const { categories } = window.APP_DATA;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selCat, setSelCat] = useState('');
  const [showData, setShowData] = useState(false);
  const [dataBefore, setDataBefore] = useState('');
  const [dataAfter, setDataAfter] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageRatio, setImageRatio] = useState('16:9');
  const done = title.trim() && selCat;

  const imageAspect = imageRatio === '9:16' ? (9 / 16) : (16 / 9);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        borderBottom: '1px solid #EDE8E0', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Ico name="x" size={22} color="#1C1815"/>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 600, color: '#1C1815' }}>发布帖子</span>
        <button
          disabled={!done}
          onClick={() => {
            if (!done) return;
            onSubmit?.({
              id: Date.now(),
              userId: 4,
              category: selCat,
              title: title.trim(),
              excerpt: body.trim() || title.trim(),
              hasImage: !!imageUrl,
              imageUrl,
              imageRatio,
              imageAspect,
              dataHighlight: showData && dataBefore && dataAfter ? { before: dataBefore, after: dataAfter } : null,
              likes: 0,
              bookmarks: 0,
              comments: 0,
              timeAgo: '刚刚',
              isHot: false,
              isElite: false,
              tags: ['新发布'],
            });
          }}
          style={{
          background: done ? accentColor : '#E8E2D9', color: done ? '#fff' : '#A49E97',
          border: 'none', borderRadius: 20, padding: '8px 20px',
          fontSize: 14, fontWeight: 600, cursor: done ? 'pointer' : 'default',
          transition: 'background 0.2s',
        }}>发布</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Title */}
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="写下你的标题（吸引人的标题获得更多曝光）"
          maxLength={60}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontSize: 18, fontWeight: 600, color: '#1C1815', lineHeight: 1.5,
            fontFamily: 'inherit', marginBottom: 4,
          }}
          rows={2}
        />
        <div style={{ fontSize: 11, color: '#A49E97', textAlign: 'right', marginBottom: 16 }}>
          {title.length}/60
        </div>

        <div style={{ height: 1, background: '#F2EDE6', marginBottom: 16 }}/>

        {/* Body */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="分享你的 AI 实战经验、智能体案例、赚钱心得……\n\n支持图片、数据对比等丰富内容"
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontSize: 15, color: '#1C1815', lineHeight: 1.8, fontFamily: 'inherit',
            minHeight: 160,
          }}
        />

        {/* Image upload */}
        <label style={{
          border: '1.5px dashed #E8E2D9', borderRadius: 12,
          padding: '16px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 16,
        }}>
          <Ico name="image" size={24} color="#C8C0B8"/>
          <span style={{ fontSize: 13, color: '#A49E97' }}>{imageUrl ? '重新选择图片' : '添加图片 / 截图'}</span>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }}/>
        </label>

        {imageUrl && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {['16:9', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setImageRatio(ratio)}
                  style={{
                    border: 'none', cursor: 'pointer',
                    padding: '7px 14px', borderRadius: 100,
                    background: imageRatio === ratio ? accentColor : '#F2EDE6',
                    color: imageRatio === ratio ? '#fff' : '#6B6560',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <div style={{
              position: 'relative',
              paddingTop: `${(1 / imageAspect) * 100}%`,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#F2EDE6',
            }}>
              <img
                src={imageUrl}
                alt="预览"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                }}
              />
              <span style={{
                position: 'absolute', right: 8, bottom: 8,
                padding: '3px 8px', borderRadius: 100,
                background: 'rgba(28,24,21,0.72)', color: '#fff',
                fontSize: 10, fontWeight: 700,
              }}>
                {imageRatio}
              </span>
            </div>
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1815', marginBottom: 8 }}>选择分类</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.filter(c => c.id !== 'all').map(cat => (
              <span key={cat.id} onClick={() => setSelCat(cat.id)} style={{
                padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: selCat === cat.id ? cat.bg : '#F8F5F0',
                color: selCat === cat.id ? cat.color : '#6B6560',
                border: `1.5px solid ${selCat === cat.id ? cat.color : 'transparent'}`,
                transition: 'all 0.15s',
              }}>{cat.label}</span>
            ))}
          </div>
        </div>

        {/* Data highlight toggle */}
        <div
          onClick={() => setShowData(!showData)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#F8F5F0', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
            marginBottom: showData ? 8 : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 14, color: '#1C1815', fontWeight: 500 }}>添加数据对比（效果更突出）</span>
          </div>
          <Ico name={showData ? 'back' : 'plus'} size={16} color="#A49E97"/>
        </div>

        {showData && (
          <div style={{ background: '#F8F5F0', borderRadius: '0 0 12px 12px', padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#A49E97', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Before</div>
                <input value={dataBefore} onChange={e => setDataBefore(e.target.value)}
                  placeholder="例：月收益 ¥0"
                  style={{ width: '100%', background: '#fff', border: '1px solid #E8E2D9', borderRadius: 8,
                    padding: '8px 10px', fontSize: 13, outline: 'none', color: '#1C1815', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#1A7A4A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>After</div>
                <input value={dataAfter} onChange={e => setDataAfter(e.target.value)}
                  placeholder="例：月收益 ¥32,000"
                  style={{ width: '100%', background: '#fff', border: '1px solid #E8E2D9', borderRadius: 8,
                    padding: '8px 10px', fontSize: 13, outline: 'none', color: '#1A7A4A', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MESSAGES SCREEN (simple)
══════════════════════════════════════════════════════════ */
function MessagesScreen() {
  const { users } = window.APP_DATA;
  const items = [
    { userId: 2, text: '太实用了！请问接单渠道主要是哪里？', time: '3分钟前', unread: 2 },
    { userId: 1, text: '你好，我想请教一下 AI 落地的问题', time: '1小时前', unread: 0 },
    { userId: 3, text: '收藏了你的文章，很有帮助！', time: '昨天', unread: 1 },
    { userId: 5, text: '能不能介绍一下你的培训课程？', time: '2天前', unread: 0 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EDE8E0', padding: '14px 16px', flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1C1815' }}>消息</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map((item, i) => {
          const u = users.find(u => u.id === item.userId);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', padding: '14px 16px',
              borderBottom: '1px solid #F2EDE6', cursor: 'pointer',
            }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={u} size={46}/>
                {item.unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2, width: 18, height: 18,
                    background: '#C95B15', borderRadius: '50%', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff', fontWeight: 700,
                  }}>{item.unread}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1815' }}>{u?.name}</span>
                  <span style={{ fontSize: 11, color: '#A49E97' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: 13, color: '#7A7268', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SHARE CARD MODAL
══════════════════════════════════════════════════════════ */
const QR = [[1,1,1,0,1,0,1,1,1],[1,0,1,0,0,0,1,0,1],[1,0,1,1,1,0,1,0,1],[0,0,0,1,0,1,0,0,0],[1,0,1,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,1],[1,1,1,0,1,0,1,1,1]];

function ShareCardModal({ post, onClose }) {
  const { users } = window.APP_DATA;
  const user = users.find(u => u.id === post?.userId);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 330, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Card face */}
        <div style={{
          background: 'linear-gradient(160deg, #2D1A0C 0%, #1A1007 55%, #0D0A08 100%)',
          padding: '26px 24px 22px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: -50, right: -50, width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(201,91,21,0.4) 0%, transparent 65%)',
          }}/>
          <div style={{
            position: 'absolute', bottom: -30, left: -30, width: 140, height: 140,
            background: 'radial-gradient(circle, rgba(43,92,230,0.2) 0%, transparent 65%)',
          }}/>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, position: 'relative' }}>
            <Logo size={22} color="#C95B15"/>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>楚门会</span>
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'monospace' }}>AI 实战社区</span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.45,
            marginBottom: 12, position: 'relative',
          }}>
            {post?.title}
          </div>

          {/* Excerpt */}
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 20, position: 'relative',
          }}>
            {post?.excerpt}
          </div>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, position: 'relative' }}>
            <Avatar user={user} size={30}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user?.title}</div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }}/>

          {/* QR + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <div style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: 6,
            }}>
              <svg width="48" height="48" viewBox={`0 0 ${QR[0].length * 6} ${QR.length * 6}`}>
                {QR.map((row, ri) => row.map((cell, ci) => cell ? (
                  <rect key={`${ri}-${ci}`} x={ci*6+1} y={ri*6+1} width="5" height="5" fill="rgba(255,255,255,0.75)" rx="0.5"/>
                ) : null))}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>扫码查看全文</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>chumenhui.com</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ background: '#F2EDE6', padding: '12px 14px', display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, background: '#1C1815', color: '#fff', border: 'none',
            borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Ico name="download" size={16} color="#fff"/> 保存图片
          </button>
          <button style={{
            flex: 1, background: '#fff', color: '#1C1815',
            border: '1px solid #E8E2D9', borderRadius: 10, padding: '11px 0',
            fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Ico name="link" size={16} color="#6B6560"/> 复制链接
          </button>
        </div>
      </div>

      {/* Close */}
      <button onClick={onClose} style={{
        marginTop: 20, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ico name="x" size={18} color="#fff"/>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOT LIST SCREEN
══════════════════════════════════════════════════════════ */
function HotListScreen({ onBack, onPostClick, accentColor }) {
  const { posts, users } = window.APP_DATA;
  const ranked = [...posts].sort((a, b) => b.likes - a.likes);

  const medalColor = ['#C95B15', '#7C3AED', '#1A7A4A'];
  const medalBg    = ['#FEF1E8', '#F5F3FF', '#E6F5EE'];
  const medalLabel = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        background: '#fff', borderBottom: '1px solid #EDE8E0', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px 4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Ico name="back" size={22} color="#1C1815"/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ico name="fire" size={16} color={accentColor} filled/>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1815' }}>热门榜单</span>
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '6px solid #F8F5F0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {ranked.slice(0, 3).map((post, i) => {
            const user = users.find(u => u.id === post.userId);
            return (
              <div key={post.id} onClick={() => onPostClick(post)} style={{
                flex: i === 0 ? '1.2' : '1',
                background: medalBg[i], borderRadius: 14,
                padding: '14px 12px', cursor: 'pointer',
                border: i === 0 ? `1.5px solid ${accentColor}40` : '1.5px solid transparent',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{medalLabel[i]}</div>
                <div style={{ fontSize: i === 0 ? 13 : 12, fontWeight: 700, color: '#1C1815', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  marginBottom: 8 }}>
                  {post.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Avatar user={user} size={16}/>
                  <span style={{ fontSize: 11, color: '#A49E97', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Ico name="heart" size={12} color={medalColor[i]} filled/>
                  <span style={{ fontSize: 12, color: medalColor[i], fontWeight: 700 }}>{post.likes}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full ranked list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {ranked.slice(3).map((post, i) => {
          const rank = i + 4;
          const user = users.find(u => u.id === post.userId);
          return (
            <div key={post.id} onClick={() => onPostClick(post)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', padding: '14px 16px',
              borderBottom: '1px solid #F2EDE6', cursor: 'pointer',
            }}>
              <span style={{
                width: 26, textAlign: 'center', fontSize: 15, fontWeight: 800,
                color: '#C8C0B8', flexShrink: 0,
              }}>{rank}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1815', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  marginBottom: 5 }}>
                  {post.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TagChip categoryId={post.category} small/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar user={user} size={14}/>
                    <span style={{ fontSize: 11, color: '#A49E97' }}>{user?.name}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <Ico name="heart" size={14} color="#A49E97"/>
                <span style={{ fontSize: 11, color: '#A49E97' }}>{post.likes}</span>
              </div>
            </div>
          );
        })}
        <div style={{ height: 24 }}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
function App() {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const accent = tweaks.accentColor || '#C95B15';
  const [posts, setPosts] = useState(window.APP_DATA.posts);

  const [screen, setScreen] = useState('feed');
  const [detailPost, setDetailPost] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [showHotList, setShowHotList] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [feedFilters, setFeedFilters] = useState({ category: 'all', time: 'all', type: 'all' });

  const matchesTimeFilter = (post, time) => {
    if (time === 'all') return true;
    const text = post?.timeAgo || '';
    if (time === 'week') return !text.includes('周');
    if (time === 'month') return text.includes('周') || text.includes('天');
    return true;
  };

  const matchesTypeFilter = (post, type) => {
    if (type === 'all') return true;
    if (type === 'image') return !!post.hasImage;
    if (type === 'data') return !!post.dataHighlight;
    if (type === 'elite') return !!post.isElite;
    return true;
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilters.category !== 'all' && post.category !== feedFilters.category) return false;
    if (!matchesTimeFilter(post, feedFilters.time)) return false;
    if (!matchesTypeFilter(post, feedFilters.type)) return false;
    return true;
  });

  const openPost = (post) => setDetailPost(post);
  const closeDetail = () => setDetailPost(null);
  const toggleSave = (postId) => setSavedPostIds(prev => {
    const next = new Set(prev);
    if (next.has(postId)) next.delete(postId); else next.add(postId);
    return next;
  });
  const openUser = (user) => { if (user) setViewingUser(user); };
  const handleCreatePost = (post) => {
    setPosts(prev => [post, ...prev]);
    setShowCreate(false);
    setScreen('feed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0', position: 'relative', overflow: 'hidden' }}>
      {/* Main screen */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {viewingUser ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: '#F8F5F0' }}>
            <UserProfileScreen
              user={viewingUser}
              onBack={() => setViewingUser(null)}
              onPostClick={(post) => { setViewingUser(null); setTimeout(() => openPost(post), 320); }}
              accentColor={accent}
              posts={posts}
            />
          </div>
        ) : (
          <>
            {screen === 'feed'     && <FeedScreen    posts={filteredPosts} onPostClick={openPost} onViewHotList={() => setShowHotList(true)} onUserClick={openUser} onFilterClick={() => setShowFilter(true)} accentColor={accent}/>}
            {screen === 'search'   && <SearchScreen  onPostClick={openPost}/>}
            {screen === 'messages' && <MessagesScreen/>}
            {screen === 'profile'  && <ProfileScreen posts={posts} onPostClick={openPost} accentColor={accent} savedPostIds={savedPostIds} onEditProfile={() => setShowSettings(true)}/>}
          </>
        )}
      </div>

      <BottomNav active={screen} onChange={setScreen} onPublish={() => setShowCreate(true)}/>

      {/* Post detail overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50,
        transform: detailPost ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {detailPost && (
          <PostDetailScreen
            post={detailPost}
            onBack={closeDetail}
            onShare={() => { setSharePost(detailPost); }}
            onUserClick={(user) => { closeDetail(); setTimeout(() => openUser(user), 320); }}
            savedPostIds={savedPostIds}
            onToggleSave={toggleSave}
          />
        )}
      </div>

      {/* Settings overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 65,
        transform: showSettings ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {showSettings && <SettingsScreen onBack={() => setShowSettings(false)} accentColor={accent}/>}
      </div>

      {/* Create post overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60,
        transform: showCreate ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {showCreate && <CreatePostScreen onBack={() => setShowCreate(false)} accentColor={accent} onSubmit={handleCreatePost}/>}
      </div>

      {/* Filter sheet */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFeedFilters}
        accentColor={accent}
      />

      {/* Hot list overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 55,
        transform: showHotList ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {showHotList && (
          <HotListScreen
            onBack={() => setShowHotList(false)}
            onPostClick={(post) => { setShowHotList(false); openPost(post); }}
            accentColor={accent}
          />
        )}
      </div>

      {/* Share card modal */}
      {sharePost && <ShareCardModal post={sharePost} onClose={() => setSharePost(null)}/>}

      {/* Tweaks panel */}
      <TweaksPanel tweaks={tweaks} setTweak={setTweak}>
        <TweakSection label="主题色">
          <TweakColor id="accentColor" tweaks={tweaks} setTweak={setTweak}
            options={['#C95B15', '#2B5CE6', '#1A7A4A', '#7C3AED']}/>
        </TweakSection>
        <TweakSection label="显示">
          <TweakToggle id="showHotList" label="首页热门榜单" tweaks={tweaks} setTweak={setTweak}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
