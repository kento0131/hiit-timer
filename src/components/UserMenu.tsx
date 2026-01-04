import React, { useState } from 'react';
import { User, LogOut, CalendarDays } from 'lucide-react';

interface UserMenuProps {
    onLogout: () => void;
    onEditSchedule: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLogout, onEditSchedule }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all active:scale-95 border border-white/10"
            >
                <User className="w-5 h-5 text-gray-300" />
            </button>

            {/* Dropdown Overlay */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-48 bg-[#1A1A1E] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onEditSchedule();
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5"
                        >
                            <CalendarDays className="w-4 h-4 text-teal-400" />
                            Edit Schedule
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onLogout();
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
