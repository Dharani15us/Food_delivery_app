import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ChatAdmin() {
  const [conversations, setConversations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchMessages = () => {
    axios.get('/api/chat/admin/all').then(r => {
      // Group by user_id
      const grouped = {};
      r.data.forEach(msg => {
        if (!grouped[msg.user_id]) {
          grouped[msg.user_id] = { user_id: msg.user_id, name: msg.user_name, email: msg.user_email, messages: [] };
        }
        grouped[msg.user_id].messages.push(msg);
      });
      setConversations(grouped);
      if (!selectedUser && Object.keys(grouped).length > 0) {
        setSelectedUser(Object.keys(grouped)[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedUser, conversations]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedUser) return;
    await axios.post('/api/chat/admin/reply', { user_id: selectedUser, message: reply });
    setReply('');
    fetchMessages();
  };

  const users = Object.values(conversations);
  const activeConvo = selectedUser ? conversations[selectedUser] : null;

  return (
    <div>
      <h1 style={styles.title}>Chat Support</h1>
      <p style={styles.sub}>Respond to customer messages</p>

      {loading ? <div className="loading-spinner" /> : (
        <div style={styles.chatLayout}>
          {/* User list */}
          <div className="card" style={styles.userList}>
            <div style={styles.userListHeader}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Conversations</span>
              <span className="badge badge-gray">{users.length}</span>
            </div>
            {users.length === 0 ? (
              <p style={{ padding: '20px 16px', color: '#9CA3AF', fontSize: 14 }}>No messages yet.</p>
            ) : users.map(u => (
              <div
                key={u.user_id}
                style={{ ...styles.userItem, ...(selectedUser === String(u.user_id) ? styles.userItemActive : {}) }}
                onClick={() => setSelectedUser(String(u.user_id))}
              >
                <div style={styles.userAvatar}>{u.name?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1D2E' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.messages[u.messages.length - 1]?.message}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#D1D5DB', flexShrink: 0 }}>
                  {u.messages.length} msgs
                </div>
              </div>
            ))}
          </div>

          {/* Chat window */}
          <div className="card" style={styles.chatWindow}>
            {!activeConvo ? (
              <div style={styles.noChat}>
                <i className="fa-solid fa-comments" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', textAlign: 'center', marginBottom: 16 }} />
                <p style={{ textAlign: 'center', color: '#9CA3AF' }}>Select a conversation</p>
              </div>
            ) : (
              <>
                <div style={styles.chatHeader}>
                  <div style={styles.userAvatar}>{activeConvo.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{activeConvo.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{activeConvo.email}</div>
                  </div>
                </div>
                <div style={styles.messages}>
                  {activeConvo.messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      <div style={{ ...styles.bubble, ...(msg.sender === 'admin' ? styles.bubbleAdmin : styles.bubbleUser) }}>
                        <p style={{ fontSize: 14, margin: 0 }}>{msg.message}</p>
                        <p style={{ fontSize: 11, color: msg.sender === 'admin' ? 'rgba(255,255,255,0.6)' : '#9CA3AF', margin: '4px 0 0', textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div style={styles.replyBox}>
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    onKeyDown={e => e.key === 'Enter' && sendReply()}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
                  />
                  <button className="btn-primary" style={{ padding: '8px 18px', borderRadius: 50, fontSize: 13 }} onClick={sendReply}>
                    <i className="fa-solid fa-paper-plane" /> Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, color: '#1A1D2E', marginBottom: 4 },
  sub: { fontSize: 14, color: '#9CA3AF', marginBottom: 24 },
  chatLayout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 560 },
  userList: { overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  userListHeader: { padding: '16px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  userItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid #F9FAFB' },
  userItemActive: { background: '#F0FDF4' },
  userAvatar: { width: 38, height: 38, borderRadius: '50%', background: '#1A1D2E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  chatWindow: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noChat: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #F3F4F6' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' },
  bubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 14 },
  bubbleUser: { background: '#F3F4F6', borderBottomLeftRadius: 4 },
  bubbleAdmin: { background: '#1A1D2E', color: 'white', borderBottomRightRadius: 4 },
  replyBox: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA', borderRadius: '0 0 12px 12px' }
};
