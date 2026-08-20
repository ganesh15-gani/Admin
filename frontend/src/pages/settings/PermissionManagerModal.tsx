import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Shield, ShieldAlert, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { type StaffMember, type StaffRole } from '../../services/staffService';

interface PermissionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: StaffMember;
  roles: StaffRole[];
  onSave: (staffId: string, roleId: string, customPermissions: Record<string, boolean> | null) => void;
}

const AVAILABLE_MODULES = [
  'Dashboard', 'Users', 'Properties', 'Bookings', 'Payments', 
  'Vendors', 'Support', 'Notifications', 'Reports', 'CMS', 'Settings', 'System'
];

export function PermissionManagerModal({ isOpen, onClose, staffMember, roles, onSave }: PermissionManagerModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(staffMember.roleId);
  
  // localPermissions tracks the exact state of checkboxes
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId(staffMember.roleId);
      
      const role = roles.find(r => r.id === staffMember.roleId);
      const initial: Record<string, boolean> = {};
      
      // Initialize with Role defaults
      AVAILABLE_MODULES.forEach(mod => {
        initial[mod] = role?.permissions.includes(mod) || false;
      });
      
      // Apply custom overrides if they exist
      if (staffMember.customPermissions) {
        Object.entries(staffMember.customPermissions).forEach(([mod, val]) => {
          initial[mod] = val;
        });
      }
      
      setLocalPermissions(initial);
    }
  }, [isOpen, staffMember, roles]);

  const handleRoleChange = (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    const role = roles.find(r => r.id === newRoleId);
    
    // Reset permissions to match the new role strictly (removes custom overrides)
    const resetPerms: Record<string, boolean> = {};
    AVAILABLE_MODULES.forEach(mod => {
      resetPerms[mod] = role?.permissions.includes(mod) || false;
    });
    setLocalPermissions(resetPerms);
  };

  const togglePermission = (module: string) => {
    setLocalPermissions(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    AVAILABLE_MODULES.forEach(m => all[m] = true);
    setLocalPermissions(all);
  };

  const deselectAll = () => {
    const none: Record<string, boolean> = {};
    AVAILABLE_MODULES.forEach(m => none[m] = false);
    setLocalPermissions(none);
  };

  const resetToRoleDefault = () => {
    handleRoleChange(selectedRoleId);
  };

  const handleSave = () => {
    const role = roles.find(r => r.id === selectedRoleId);
    let customOverrides: Record<string, boolean> | null = {};
    let hasOverrides = false;

    // Compare local permissions against base role to calculate overrides
    AVAILABLE_MODULES.forEach(mod => {
      const isRoleAllowed = role?.permissions.includes(mod) || false;
      if (localPermissions[mod] !== isRoleAllowed) {
        customOverrides![mod] = localPermissions[mod];
        hasOverrides = true;
      }
    });

    if (!hasOverrides) customOverrides = null;

    onSave(staffMember.id, selectedRoleId, customOverrides);
  };

  // Check if current configuration matches the role perfectly (no overrides)
  const role = roles.find(r => r.id === selectedRoleId);
  let hasOverrides = false;
  AVAILABLE_MODULES.forEach(mod => {
    const isRoleAllowed = role?.permissions.includes(mod) || false;
    if (localPermissions[mod] !== isRoleAllowed) hasOverrides = true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permissions: ${staffMember.name}`}>
      <div className="space-y-6">
        
        {/* Role Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Role / Department</label>
          <select 
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {hasOverrides && (
            <div className="mt-3 flex items-start text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs leading-relaxed">
              <ShieldAlert size={16} className="mr-2 flex-shrink-0 mt-0.5" />
              <p>This staff member has <strong>Custom Individual Permissions</strong> that override the default {role?.name} settings.</p>
            </div>
          )}
        </div>

        {/* Permission Toggles */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Available Windows & Modules</h3>
              <p className="text-xs text-slate-500">Select which sections this user can open.</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={selectAll} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Select All</button>
              <span className="text-slate-300">|</span>
              <button onClick={deselectAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Deselect All</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
            {AVAILABLE_MODULES.map(module => (
              <div 
                key={module}
                onClick={() => togglePermission(module)}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  localPermissions[module] 
                    ? 'border-brand-500 bg-brand-50' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {localPermissions[module] ? (
                  <CheckSquare size={18} className="text-brand-600 mr-3 flex-shrink-0" />
                ) : (
                  <Square size={18} className="text-slate-400 mr-3 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${localPermissions[module] ? 'text-brand-900' : 'text-slate-600'}`}>
                  {module}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={resetToRoleDefault} className="text-slate-600 border-slate-300 hover:bg-slate-100">
            <RotateCcw size={14} className="mr-2" /> Reset to Role Default
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20 shadow-lg">
              <Shield size={16} className="mr-2" /> Save Permissions
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
