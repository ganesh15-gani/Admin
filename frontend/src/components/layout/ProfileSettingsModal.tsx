import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { authService, type AuthUser } from '../../services/authService';
import { useToast } from '../../components/ui/ToastContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (user: AuthUser) => void;
}

export function ProfileSettingsModal({ isOpen, onClose, onProfileUpdated }: ProfileSettingsModalProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.name);
        setAvatarPreview(currentUser.avatar || null);
      }
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      error('Image must be less than 2MB');
      return;
    }

    // Convert to Base64 for Local Storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      error('Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(
        name, 
        avatarPreview !== user?.avatar ? avatarPreview! : undefined
      );
      
      success('Profile updated successfully');
      onProfileUpdated(updatedUser);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="p-6 space-y-8">
        
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-bold border-4 border-gray-50 shadow-md transition-transform group-hover:scale-105">
                {name ? name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
            
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 text-gray-500">
              <Camera size={14} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Click to change profile picture (Max 2MB)</p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Name Edit Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-start space-x-3">
            <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={16} />
            <p className="text-xs text-blue-700 leading-relaxed">
              Your name and profile picture will be updated across the entire dashboard immediately.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex space-x-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
            <Check size={16} className="mr-2" /> Save Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
