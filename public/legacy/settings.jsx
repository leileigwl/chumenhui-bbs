// settings.jsx — 设置中心：资料 / 联系 / 安全 / 隐私 / 通知 / 关于
const { useState } = React;
const { Ico, Logo } = window;

/* ─── Primitives ──────────────────────────────────────────── */
function Toggle({ on, onChange, accent }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 46, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
      background: on ? (accent || '#C95B15') : '#D1CCC5',
      position: 'relative', transition: 'background 0.22s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)', transition: 'left 0.22s',
      }}/>
    </div>
  );
}

function SecHead({ label }) {
  return <div style={{ padding: '20px 16px 8px', fontSize: 11, color: '#A49E97', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</div>;
}

function Row({ label, value, note, onPress, danger, right }) {
  return (
    <div onClick={onPress} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#fff', padding: '14px 16px', borderBottom: '1px solid #F2EDE6',
      cursor: onPress ? 'pointer' : 'default',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: danger ? '#DC2626' : '#1C1815' }}>{label}</div>
        {note && <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{note}</div>}
      </div>
      {right || (
        <>
          {value && <span style={{ fontSize: 14, color: '#A49E97', marginRight: 4, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>}
          {onPress && <Ico name="back" size={16} color="#C8C0B8"/>}
        </>
      )}
    </div>
  );
}

function SubHeader({ title, onBack, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #EDE8E0', flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px 4px 0' }}>
        <Ico name="back" size={22} color="#1C1815"/>
      </button>
      <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#1C1815' }}>{title}</span>
      {action}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type, note, labelWidth = 72 }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #F2EDE6' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
        <span style={{ fontSize: 15, color: '#1C1815', width: labelWidth, flexShrink: 0 }}>{label}</span>
        <input
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder || `填写${label}`} type={type || 'text'}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#1C1815', fontFamily: 'inherit', textAlign: 'right' }}
        />
      </div>
      {note && <div style={{ fontSize: 12, color: '#A49E97', padding: '0 16px 10px', paddingLeft: 16 + labelWidth }}>{note}</div>}
    </div>
  );
}

function SaveBtn({ accent, onPress }) {
  return (
    <button onClick={onPress} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 20, padding: '7px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
      保存
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   1. 编辑基本资料
══════════════════════════════════════════════════════════ */
function EditBasicInfo({ onBack, accent }) {
  const user = window.APP_DATA.users[3];
  const palette = ['#C95B15','#2B5CE6','#1A7A4A','#7C3AED','#0891B2'];
  const bg = palette[user.id % palette.length];
  const [name,  setName]  = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [bio,   setBio]   = useState('专注 AI 落地与人才培养，帮助个人和企业用好 AI 工具。');
  const [city,  setCity]  = useState('上海');
  const [sheet, setSheet] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="编辑资料" onBack={onBack} action={<SaveBtn accent={accent}/>}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Avatar */}
        <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 20px', borderBottom: '6px solid #F8F5F0' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSheet(true)}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 700 }}>{user.name[0]}</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#1C1815', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="pencil" size={13} color="#fff"/>
            </div>
          </div>
          <span style={{ fontSize: 13, color: '#A49E97', marginTop: 10, cursor: 'pointer' }} onClick={() => setSheet(true)}>更换头像</span>
        </div>

        <SecHead label="基本信息"/>
        <TextInput label="昵称"  value={name}  onChange={setName}  placeholder="你的展示名称"/>
        <TextInput label="职位"  value={title} onChange={setTitle} placeholder="例：AI 工程师"/>
        <TextInput label="城市"  value={city}  onChange={setCity}  placeholder="例：上海"/>
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '1px solid #F2EDE6' }}>
          <div style={{ fontSize: 15, color: '#1C1815', marginBottom: 10 }}>个人简介</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="介绍一下你自己…" maxLength={120} rows={3}
            style={{ width: '100%', background: '#F8F5F0', border: 'none', outline: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#1C1815', lineHeight: 1.6, resize: 'none', fontFamily: 'inherit' }}/>
          <div style={{ fontSize: 11, color: '#A49E97', textAlign: 'right', marginTop: 4 }}>{bio.length}/120</div>
        </div>

        <SecHead label="账号等级"/>
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '1px solid #F2EDE6', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1815' }}>导师</div>
            <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>发帖 67 篇 · 获赞 21.8k</div>
          </div>
          <span style={{ fontSize: 12, color: accent, cursor: 'pointer' }}>查看升级条件 ›</span>
        </div>
      </div>

      {/* Avatar action sheet */}
      {sheet && <>
        <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}/>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 60, padding: '4px 0 30px' }}>
          {['拍照', '从相册选取', '删除头像'].map((opt, i) => (
            <div key={opt} onClick={() => setSheet(false)} style={{ padding: '16px', fontSize: 16, cursor: 'pointer', color: i === 2 ? '#DC2626' : '#1C1815', borderBottom: i < 2 ? '1px solid #F2EDE6' : 'none', textAlign: 'center' }}>{opt}</div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2. 联系方式
══════════════════════════════════════════════════════════ */
function EditContact({ onBack, accent }) {
  const [phone,   setPhone]   = useState('138****8888');
  const [email,   setEmail]   = useState('wangxiaofang@example.com');
  const [wechat,  setWechat]  = useState('wxf_ai');
  const [website, setWebsite] = useState('');
  const [pubPhone, setPubPhone] = useState(false);
  const [pubEmail, setPubEmail] = useState(true);
  const [pubWx,    setPubWx]    = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="联系方式" onBack={onBack} action={<SaveBtn accent={accent}/>}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SecHead label="联系信息"/>
        <TextInput label="手机号" value={phone}   onChange={setPhone}   note="用于账号登录与找回密码" labelWidth={64}/>
        <TextInput label="邮箱"   value={email}   onChange={setEmail}   type="email" note="接收通知邮件" labelWidth={64}/>
        <TextInput label="微信号" value={wechat}  onChange={setWechat}  note="方便社区成员联系你" labelWidth={64}/>
        <TextInput label="网站"   value={website} onChange={setWebsite} placeholder="https://yoursite.com" type="url" labelWidth={64}/>

        <SecHead label="公开展示"/>
        {[['公开手机号', pubPhone, setPubPhone], ['公开邮箱', pubEmail, setPubEmail], ['公开微信号', pubWx, setPubWx]].map(([label, on, set]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fff', borderBottom: '1px solid #F2EDE6' }}>
            <span style={{ flex: 1, fontSize: 15, color: '#1C1815' }}>{label}</span>
            <Toggle on={on} onChange={set} accent={accent}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. 账号安全
══════════════════════════════════════════════════════════ */
function AccountSecurity({ onBack, accent }) {
  const [view, setView] = useState('main'); // 'main' | 'pwd'
  const [twoFA, setTwoFA] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [cfmPwd, setCfmPwd] = useState('');

  if (view === 'pwd') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="修改密码" onBack={() => setView('main')}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          {[['当前密码', oldPwd, setOldPwd], ['新密码', newPwd, setNewPwd], ['确认新密码', cfmPwd, setCfmPwd]].map(([lbl, val, set], i, a) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < a.length - 1 ? '1px solid #F2EDE6' : 'none' }}>
              <span style={{ fontSize: 15, color: '#1C1815', width: 92, flexShrink: 0 }}>{lbl}</span>
              <input type="password" value={val} onChange={e => set(e.target.value)} placeholder="请输入"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, textAlign: 'right', fontFamily: 'inherit' }}/>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#A49E97', marginBottom: 24, lineHeight: 1.7 }}>密码长度 8–20 位，须包含字母和数字</div>
        <button style={{ width: '100%', background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>确认修改</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="账号安全" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SecHead label="登录安全"/>
        <div style={{ background: '#fff' }}>
          <Row label="修改密码"  value="上次修改：30天前"   onPress={() => setView('pwd')}/>
          <Row label="绑定手机"  value="138****8888"        onPress={() => {}}/>
          <Row label="绑定邮箱"  value="已绑定"             onPress={() => {}}/>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fff', borderBottom: '1px solid #F2EDE6' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#1C1815' }}>双重验证</div>
              <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>登录时需短信验证码</div>
            </div>
            <Toggle on={twoFA} onChange={setTwoFA} accent={accent}/>
          </div>
        </div>

        <SecHead label="登录设备"/>
        <div style={{ background: '#fff' }}>
          {[
            { device: 'iPhone 15 Pro', loc: '上海', time: '当前设备', cur: true },
            { device: 'MacBook Pro',   loc: '上海', time: '2天前',    cur: false },
            { device: 'Chrome · Win',  loc: '北京', time: '5天前',    cur: false },
          ].map(({ device, loc, time, cur }) => (
            <div key={device} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F2EDE6', background: '#fff' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, color: '#1C1815', fontWeight: 500 }}>{device}</span>
                  {cur && <span style={{ padding: '1px 7px', background: '#E6F5EE', color: '#1A7A4A', fontSize: 11, borderRadius: 100, fontWeight: 600 }}>当前</span>}
                </div>
                <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{loc} · {time}</div>
              </div>
              {!cur && <span style={{ fontSize: 13, color: '#DC2626', cursor: 'pointer' }}>下线</span>}
            </div>
          ))}
        </div>

        <SecHead label="危险操作"/>
        <div style={{ background: '#fff' }}>
          <Row label="注销账号" note="注销后数据无法恢复" danger onPress={() => {}}/>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. 隐私设置
══════════════════════════════════════════════════════════ */
function PrivacySettings({ onBack, accent }) {
  const [profVis, setProfVis] = useState('all');
  const [msgPerm, setMsgPerm] = useState('followers');
  const [searchable, setSearchable] = useState(true);
  const [activity, setActivity] = useState(true);

  const Picker = ({ value, onChange, opts }) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {opts.map(([val, lbl]) => (
        <span key={val} onClick={() => onChange(val)} style={{
          flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13,
          background: value === val ? '#FEF1E8' : '#F8F5F0',
          color: value === val ? accent : '#6B6560',
          border: `1.5px solid ${value === val ? accent : 'transparent'}`,
          fontWeight: value === val ? 600 : 400, transition: 'all 0.15s',
        }}>{lbl}</span>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="隐私设置" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SecHead label="可见范围"/>
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '1px solid #F2EDE6' }}>
          <div style={{ fontSize: 13, color: '#6B6560', marginBottom: 10 }}>谁可以看我的主页</div>
          <Picker value={profVis} onChange={setProfVis} opts={[['all','所有人'], ['followers','仅关注'], ['private','仅自己']]}/>
        </div>
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '6px solid #F8F5F0' }}>
          <div style={{ fontSize: 13, color: '#6B6560', marginBottom: 10 }}>谁可以给我发私信</div>
          <Picker value={msgPerm} onChange={setMsgPerm} opts={[['all','所有人'], ['followers','仅关注']]}/>
        </div>

        <SecHead label="其他"/>
        {[
          { label: '出现在搜索结果中',   note: '关闭后其他人无法搜索到你', on: searchable, set: setSearchable },
          { label: '公开我的互动记录', note: '包括点赞、收藏等操作', on: activity, set: setActivity },
        ].map(({ label, note, on, set }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fff', borderBottom: '1px solid #F2EDE6' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#1C1815' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{note}</div>
            </div>
            <Toggle on={on} onChange={set} accent={accent}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. 通知设置
══════════════════════════════════════════════════════════ */
function NotificationSettings({ onBack, accent }) {
  const [ns, setNs] = useState({ likes: true, comments: true, replies: true, followers: true, system: true, digest: false });
  const toggle = k => setNs(p => ({ ...p, [k]: !p[k] }));
  const rows = [
    ['likes',     '点赞提醒',     '有人点赞了你的帖子'],
    ['comments',  '评论提醒',     '有人评论了你的帖子'],
    ['replies',   '回复提醒',     '有人回复了你的评论'],
    ['followers', '关注提醒',     '有新粉丝关注了你'],
    ['system',    '系统通知',     '账号安全、公告等'],
    ['digest',    '每日精华推送', '早 9 点推送精华内容'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="通知设置" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SecHead label="通知类型"/>
        <div style={{ background: '#fff' }}>
          {rows.map(([key, label, note]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fff', borderBottom: '1px solid #F2EDE6' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: '#1C1815' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#A49E97', marginTop: 2 }}>{note}</div>
              </div>
              <Toggle on={ns[key]} onChange={() => toggle(key)} accent={accent}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   6. 关于
══════════════════════════════════════════════════════════ */
function AboutScreen({ onBack, accent }) {
  const [cacheSheet, setCacheSheet] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0' }}>
      <SubHeader title="关于楚门会" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 24px', borderBottom: '6px solid #F8F5F0' }}>
          <Logo size={60} color={accent}/>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1815', marginTop: 12 }}>楚门会</div>
          <div style={{ fontSize: 13, color: '#A49E97', marginTop: 4 }}>AI 实战社区 · v1.0.0</div>
        </div>

        <SecHead label="支持"/>
        <div style={{ background: '#fff' }}>
          {['用户协议', '隐私政策', '帮助中心'].map(lbl => <Row key={lbl} label={lbl} onPress={() => {}}/>)}
          <Row label="联系我们" value="feedback@chumenhui.com" onPress={() => {}}/>
        </div>

        <SecHead label="存储"/>
        <div style={{ background: '#fff' }}>
          <Row label="清除缓存" value="23.6 MB" onPress={() => setCacheSheet(true)}/>
        </div>
      </div>

      {cacheSheet && <>
        <div onClick={() => setCacheSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}/>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 60, padding: '20px 20px 30px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>清除缓存</div>
          <div style={{ fontSize: 14, color: '#6B6560', textAlign: 'center', marginBottom: 20 }}>确认清除 23.6 MB 缓存文件？</div>
          <button onClick={() => setCacheSheet(false)} style={{ width: '100%', background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>确认清除</button>
          <button onClick={() => setCacheSheet(false)} style={{ width: '100%', background: '#F8F5F0', color: '#6B6560', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, cursor: 'pointer' }}>取消</button>
        </div>
      </>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS HUB
══════════════════════════════════════════════════════════ */
function SettingsScreen({ onBack, accentColor }) {
  const accent = accentColor || '#C95B15';
  const [sub, setSub] = useState(null);
  const [logout, setLogout] = useState(false);

  const subs = {
    profile:       <EditBasicInfo         onBack={() => setSub(null)} accent={accent}/>,
    contact:       <EditContact           onBack={() => setSub(null)} accent={accent}/>,
    security:      <AccountSecurity       onBack={() => setSub(null)} accent={accent}/>,
    privacy:       <PrivacySettings       onBack={() => setSub(null)} accent={accent}/>,
    notifications: <NotificationSettings  onBack={() => setSub(null)} accent={accent}/>,
    about:         <AboutScreen           onBack={() => setSub(null)} accent={accent}/>,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F5F0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #EDE8E0', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px 4px 0' }}>
          <Ico name="back" size={22} color="#1C1815"/>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1815' }}>设置</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SecHead label="账号"/>
        <div style={{ background: '#fff' }}>
          <Row label="编辑资料"  note="昵称、头像、简介、城市" onPress={() => setSub('profile')}/>
          <Row label="联系方式"  note="手机、邮箱、微信、网站" onPress={() => setSub('contact')}/>
          <Row label="账号安全"  note="密码、双重验证、设备管理" onPress={() => setSub('security')}/>
        </div>

        <SecHead label="偏好"/>
        <div style={{ background: '#fff' }}>
          <Row label="隐私设置"  note="可见范围、私信权限" onPress={() => setSub('privacy')}/>
          <Row label="通知设置"  note="点赞、评论、关注提醒" onPress={() => setSub('notifications')}/>
        </div>

        <SecHead label="其他"/>
        <div style={{ background: '#fff' }}>
          <Row label="关于楚门会" note="版本 v1.0.0 · 用户协议" onPress={() => setSub('about')}/>
        </div>

        <div style={{ padding: '20px 16px 40px' }}>
          <button onClick={() => setLogout(true)} style={{
            width: '100%', background: '#fff', color: '#DC2626',
            border: '1px solid #FEE2E2', borderRadius: 14,
            padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>退出登录</button>
        </div>
      </div>

      {/* Sub-screen slide-in */}
      {Object.entries(subs).map(([key, el]) => (
        <div key={key} style={{
          position: 'absolute', inset: 0, zIndex: 10,
          transform: sub === key ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {sub === key && el}
        </div>
      ))}

      {/* Logout confirm */}
      {logout && <>
        <div onClick={() => setLogout(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}/>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 210, padding: '20px 20px 34px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>退出登录</div>
          <div style={{ fontSize: 14, color: '#6B6560', textAlign: 'center', marginBottom: 24 }}>确定要退出当前账号吗？</div>
          <button onClick={() => setLogout(false)} style={{ width: '100%', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>确认退出</button>
          <button onClick={() => setLogout(false)} style={{ width: '100%', background: '#F8F5F0', color: '#6B6560', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, cursor: 'pointer' }}>取消</button>
        </div>
      </>}
    </div>
  );
}

Object.assign(window, { SettingsScreen });
