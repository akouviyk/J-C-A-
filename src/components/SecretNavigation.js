import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretCommands } from '../hooks/useSecretCommands';
import './SecretNavigation.css';

const SecretNavigation = ({ onSectionUnlocked }) => {
    const { unlockedSections } = useSecretCommands();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const handleUnlock = (e) => {
            const section = e.detail;
            setNotification({
                section,
                message: getUnlockMessage(section)
            });

            setTimeout(() => setNotification(null), 4000);

            if (onSectionUnlocked) {
                onSectionUnlocked(section);
            }
        };

        document.addEventListener('sectionUnlocked', handleUnlock);
        return () => document.removeEventListener('sectionUnlocked', handleUnlock);
    }, [onSectionUnlocked]);

    const getUnlockMessage = (section) => {
        const messages = {
            'VAULT': 'Secret vault unlocked — Rare archives accessible',
            'ARCHIVE': '1968 AMERICAN PARADISE archives revealed',
            'INNER_CIRCLE': 'Inner circle access granted'
        };
        return messages[section] || 'New section unlocked';
    };

    return (
        <>
            {/* Secret Sections Indicator */}
            {unlockedSections.length > 0 && (
                <div className="secret-indicator">
                    <div className="indicator-icon">✦</div>
                    <div className="indicator-count">{unlockedSections.length}</div>
                </div>
            )}

            {/* Unlock Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className="unlock-notification"
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className="notification-icon">🔓</div>
                        <div className="notification-content">
                            <div className="notification-title">SECTION UNLOCKED</div>
                            <div className="notification-message">{notification.message}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Sections Menu */}
            {unlockedSections.length > 0 && (
                <div className="secret-menu">
                    <div className="secret-menu-header">UNLOCKED SECTIONS</div>
                    {unlockedSections.map((section) => (
                        <button key={section} className="secret-menu-item">
                            <span className="item-icon">✦</span>
                            <span className="item-label">{section.replace('_', ' ')}</span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default SecretNavigation;
