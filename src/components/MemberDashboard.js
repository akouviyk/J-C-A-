import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MemberDashboard.css';

const MemberDashboard = ({ user, onNavigate }) => {
    const [memberData, setMemberData] = useState({
        name: user?.email?.split('@')[0] || 'Anonymous',
        joinDate: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        inviteCode: 'FACTORY-2025',
        tier: 'Explorer', // Explorer, Contributor, Inner Circle
        discoveries: 4,
        contributions: 7,
        likes: 23,
        streak: 12,
    });

    const [achievements, setAchievements] = useState([
        { id: 1, name: 'First Contact', icon: '🎯', unlocked: true, date: Date.now() - 2500000000 },
        { id: 2, name: 'Secret Seeker', icon: '🔍', unlocked: true, date: Date.now() - 2000000000 },
        { id: 3, name: 'Contributor', icon: '✍️', unlocked: true, date: Date.now() - 1500000000 },
        { id: 4, name: 'Night Owl', icon: '🦉', unlocked: true, date: Date.now() - 1000000000 },
        { id: 5, name: 'Curator\'s Pick', icon: '⭐', unlocked: false },
        { id: 6, name: 'Inner Circle', icon: '👁️', unlocked: false },
        { id: 7, name: 'Factory Legend', icon: '🏆', unlocked: false },
    ]);

    const [activityLog, setActivityLog] = useState([
        { id: 1, type: 'discovery', text: 'Unlocked THE VAULT', time: Date.now() - 86400000 },
        { id: 2, type: 'contribution', text: 'Added sketch to canvas', time: Date.now() - 172800000 },
        { id: 3, type: 'like', text: 'Anna liked your contribution', time: Date.now() - 259200000 },
        { id: 4, type: 'discovery', text: 'Found Easter Egg: Midnight', time: Date.now() - 345600000 },
    ]);

    const [showSettings, setShowSettings] = useState(false);
    const [notifications, setNotifications] = useState(3);

    const tierColors = {
        'Explorer': { bg: 'rgba(0, 191, 255, 0.1)', border: '#00bfff', glow: 'rgba(0, 191, 255, 0.3)' },
        'Contributor': { bg: 'rgba(0, 255, 136, 0.1)', border: '#00ff88', glow: 'rgba(0, 255, 136, 0.3)' },
        'Inner Circle': { bg: 'rgba(255, 51, 102, 0.1)', border: '#ff3366', glow: 'rgba(255, 51, 102, 0.3)' },
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getJoinDuration = (timestamp) => {
        const days = Math.floor((Date.now() - timestamp) / 86400000);
        if (days < 30) return `${days} days`;
        if (days < 365) return `${Math.floor(days / 30)} months`;
        return `${Math.floor(days / 365)} years`;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(memberData.inviteCode);
        // Could add toast notification here
    };

    return (
        <div className="member-dashboard">
            {/* Atmospheric background effects */}
            <div className="film-grain" />
            <div className="safelight-glow" />

            {/* Top navigation bar */}
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <div className="logo">J/C[+A]</div>
                    <div className="nav-label">MEMBER PORTAL</div>
                </div>
                <div className="nav-right">
                    <button className="nav-btn" onClick={() => onNavigate && onNavigate('home')} title="Back to Home">
                        <span className="btn-icon">🏠</span>
                    </button>
                    <button className="nav-btn" onClick={() => setNotifications(0)}>
                        <span className="btn-icon">🔔</span>
                        {notifications > 0 && <span className="notification-badge">{notifications}</span>}
                    </button>
                    <button className="nav-btn" onClick={() => setShowSettings(!showSettings)}>
                        <span className="btn-icon">⚙️</span>
                    </button>
                </div>
            </nav>

            {/* Main content grid */}
            <div className="dashboard-grid">

                {/* Profile Card */}
                <motion.div
                    className="card profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">PROFILE</h2>
                    </div>

                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            <span className="avatar-initial">{memberData.name[0].toUpperCase()}</span>
                        </div>
                        <div
                            className="tier-badge"
                            style={{
                                background: tierColors[memberData.tier].bg,
                                borderColor: tierColors[memberData.tier].border,
                                boxShadow: `0 0 20px ${tierColors[memberData.tier].glow}`
                            }}
                        >
                            {memberData.tier}
                        </div>
                    </div>

                    <div className="profile-name">{memberData.name}</div>
                    <div className="profile-meta">
                        <span>Member for {getJoinDuration(memberData.joinDate)}</span>
                    </div>

                    <div className="profile-stats">
                        <div className="stat">
                            <div className="stat-value">{memberData.discoveries}</div>
                            <div className="stat-label">Discoveries</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">{memberData.contributions}</div>
                            <div className="stat-label">Contributions</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">{memberData.likes}</div>
                            <div className="stat-label">Likes</div>
                        </div>
                    </div>

                    <div className="invite-code-section">
                        <div className="code-label">YOUR INVITE CODE</div>
                        <div className="invite-code">{memberData.inviteCode}</div>
                        <button className="copy-btn" onClick={handleCopyCode}>COPY</button>
                    </div>
                </motion.div>

                {/* Achievements Card */}
                <motion.div
                    className="card achievements-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">ACHIEVEMENTS</h2>
                        <span className="achievement-progress">
                            {achievements.filter(a => a.unlocked).length}/{achievements.length}
                        </span>
                    </div>

                    <div className="achievements-grid">
                        {achievements.map((achievement, i) => (
                            <motion.div
                                key={achievement.id}
                                className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                            >
                                <div className="achievement-icon">
                                    {achievement.unlocked ? achievement.icon : '🔒'}
                                </div>
                                <div className="achievement-name">
                                    {achievement.unlocked ? achievement.name : '???'}
                                </div>
                                {achievement.unlocked && (
                                    <div className="achievement-date">
                                        {getTimeAgo(achievement.date)}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Streak Card */}
                <motion.div
                    className="card streak-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">STREAK</h2>
                    </div>

                    <div className="streak-display">
                        <div className="streak-icon">🔥</div>
                        <div className="streak-number">{memberData.streak}</div>
                        <div className="streak-label">DAYS</div>
                    </div>

                    <div className="streak-calendar">
                        {[...Array(14)].map((_, i) => {
                            const active = i < memberData.streak;
                            return (
                                <motion.div
                                    key={i}
                                    className={`calendar-day ${active ? 'active' : ''}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.03 }}
                                >
                                    {active ? '✓' : '○'}
                                </motion.div>
                            );
                        })}
                    </div>

                    <p className="streak-motivation">
                        Keep the fire alive! Visit daily to maintain your streak.
                    </p>
                </motion.div>

                {/* Activity Feed Card */}
                <motion.div
                    className="card activity-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">RECENT ACTIVITY</h2>
                    </div>

                    <div className="activity-feed">
                        {activityLog.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                className="activity-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <div className={`activity-icon ${activity.type}`}>
                                    {activity.type === 'discovery' && '🔍'}
                                    {activity.type === 'contribution' && '✍️'}
                                    {activity.type === 'like' && '❤️'}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">{activity.text}</div>
                                    <div className="activity-time">{getTimeAgo(activity.time)}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions Card */}
                <motion.div
                    className="card actions-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">QUICK ACTIONS</h2>
                    </div>

                    <div className="actions-grid">
                        <button className="action-btn" onClick={() => onNavigate && onNavigate('playground')}>
                            <span className="action-icon">🎨</span>
                            <span className="action-label">Add to Canvas</span>
                        </button>
                        <button className="action-btn" onClick={() => onNavigate && onNavigate('my-contributions')}>
                            <span className="action-icon">📸</span>
                            <span className="action-label">My Work</span>
                        </button>
                        <button className="action-btn" onClick={() => onNavigate && onNavigate('art')}>
                            <span className="action-icon">🖼️</span>
                            <span className="action-label">Browse Art</span>
                        </button>
                        <button className="action-btn" onClick={() => onNavigate && onNavigate('home')}>
                            <span className="action-icon">🏠</span>
                            <span className="action-label">Home</span>
                        </button>
                    </div>
                </motion.div>

                {/* Progress Card */}
                <motion.div
                    className="card progress-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="card-header">
                        <h2 className="card-title">TIER PROGRESS</h2>
                    </div>

                    <div className="tier-progress">
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: '65%' }}
                                transition={{ delay: 0.7, duration: 1 }}
                                style={{ background: tierColors[memberData.tier].border }}
                            />
                        </div>
                        <div className="progress-label">65% to Contributor</div>
                    </div>

                    <div className="requirements">
                        <div className="requirement completed">
                            <span className="req-icon">✓</span>
                            <span className="req-text">10 contributions</span>
                        </div>
                        <div className="requirement completed">
                            <span className="req-icon">✓</span>
                            <span className="req-text">5 discoveries</span>
                        </div>
                        <div className="requirement">
                            <span className="req-icon">○</span>
                            <span className="req-text">Get 3 curator picks</span>
                        </div>
                        <div className="requirement">
                            <span className="req-icon">○</span>
                            <span className="req-text">30 day streak</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="settings-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            className="settings-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">SETTINGS</h2>

                            <div className="settings-section">
                                <h3>Profile</h3>
                                <input type="text" placeholder="Display Name" className="settings-input" defaultValue={memberData.name} />
                                <textarea placeholder="Bio" className="settings-input" rows={3} />
                            </div>

                            <div className="settings-section">
                                <h3>Notifications</h3>
                                <label className="settings-toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span>New contributions</span>
                                </label>
                                <label className="settings-toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span>Achievement unlocks</span>
                                </label>
                                <label className="settings-toggle">
                                    <input type="checkbox" />
                                    <span>Daily streak reminders</span>
                                </label>
                            </div>

                            <div className="settings-actions">
                                <button className="settings-btn cancel" onClick={() => setShowSettings(false)}>
                                    CANCEL
                                </button>
                                <button className="settings-btn save">
                                    SAVE CHANGES
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemberDashboard;
