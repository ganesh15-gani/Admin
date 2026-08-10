import React from 'react';
import { Mail, Phone, Calendar, Clock, MapPin, X, Shield, Activity, CalendarDays } from 'lucide-react';
import { type User } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

interface UserPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserPreviewModal({ isOpen, onClose, user }: UserPreviewModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center border-4 border-white shadow-lg shadow-brand-500/20 text-3xl shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Suspended' ? 'danger' : 'warning'}>
                {user.status}
              </Badge>
              <span className="flex items-center text-sm font-medium text-slate-500">
                <Shield size={14} className="mr-1 text-brand-500" /> {user.verification}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Info</h3>
            <div className="flex items-center space-x-3 text-slate-600">
              <Mail size={18} className="text-slate-400" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <Phone size={18} className="text-slate-400" />
              <span className="text-sm">{user.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <MapPin size={18} className="text-slate-400" />
              <span className="text-sm">Location not provided</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Account Activity</h3>
            <div className="flex items-center space-x-3 text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span className="text-sm">Joined: {user.joinedDate}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <Clock size={18} className="text-slate-400" />
              <span className="text-sm">Last Login: {user.lastLogin}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <CalendarDays size={18} className="text-slate-400" />
              <span className="text-sm font-medium">Total Bookings: {user.bookingsCount}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
}
