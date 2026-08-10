import React, { useState } from 'react';
import { Users, ShieldAlert, Ban, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { UserPreviewModal } from './UserPreviewModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { delay } from '../../services/apiClient';
import { type User } from '../../types';

export default function RoommateMatching() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isPostDisabled, setIsPostDisabled] = useState(false);
  
  const { success, error } = useToast();

  // Mock flagged user data based on the hardcoded post
  const flaggedUser: User = {
    id: 'u-flagged-1',
    name: 'John Doe',
    email: 'johndoe@suspicious.com',
    phone: '+1 (555) 999-0000',
    status: 'Pending',
    verification: 'Unverified',
    joinedDate: '2024-05-10',
    lastLogin: '1 hour ago',
    bookingsCount: 0
  };

  const handleDisablePost = async () => {
    setIsDisabling(true);
    try {
      await delay(1000); // Simulate API call
      success('Post disabled and user warned successfully.');
      setIsPostDisabled(true);
    } catch (err) {
      error('Failed to disable post.');
    } finally {
      setIsDisabling(false);
      setIsDisableConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Users className="mr-2 text-brand-600" /> Roommate Matching
          </h1>
          <p className="text-sm text-slate-500 mt-1">Moderate user posts and monitor for abnormal behavior.</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm border-red-100 animate-fade-in-up">
        <CardHeader className="border-b border-gray-50 bg-red-50/30">
          <CardTitle className="text-red-800 flex items-center">
            <ShieldAlert size={18} className="mr-2" /> Flagged Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {/* Post 1 */}
            {!isPostDisabled ? (
              <div className="p-5 hover:bg-red-50/50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-white transition-colors">
                      JD
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-red-900 transition-colors">John Doe</h3>
                      <p className="text-xs text-slate-500">Posted 1 hour ago • 3 User Reports</p>
                    </div>
                  </div>
                  <Badge variant="danger">Abnormal Behavior</Badge>
                </div>
                <div className="ml-13 mb-3 p-3 bg-gray-50 rounded-lg text-sm text-slate-700 italic border border-gray-100 group-hover:bg-white group-hover:border-red-100 transition-colors">
                  "Looking for a roommate. Must wire $500 deposit upfront via untraceable methods before viewing the apartment."
                </div>
                <div className="ml-13 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                    <Eye size={14} className="mr-1" /> View Full Profile
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => setIsDisableConfirmOpen(true)}>
                    <Ban size={14} className="mr-1" /> Disable Post & Warn User
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-gray-50/50">
                <CheckCircle size={32} className="mx-auto mb-3 text-green-500 opacity-50" />
                <p>No more flagged posts to review.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UserPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        user={flaggedUser} 
      />

      <ConfirmDialog
        isOpen={isDisableConfirmOpen}
        onClose={() => !isDisabling && setIsDisableConfirmOpen(false)}
        onConfirm={handleDisablePost}
        isLoading={isDisabling}
        title="Disable Post & Warn User"
        message="Are you sure you want to disable this post and send an automated warning to John Doe for violating platform guidelines?"
        confirmText="Disable Post"
        isDestructive={true}
      />
    </div>
  );
}
