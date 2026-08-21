import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { CheckSquare, Square, ShieldPlus } from 'lucide-react';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, permissions: string[]) => void;
}

const AVAILABLE_MODULES = [
  'Dashboard', 'Users', 'Properties', 'Bookings', 'Payments', 
  'Vendors', 'Support', 'Notifications', 'Reports', 'CMS', 'Settings', 'System'
];

export function CreateRoleModal({ isOpen, onClose, onSave }: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRoleName('');
      const initial: Record<string, boolean> = {};
      AVAILABLE_MODULES.forEach(m => initial[m] = false);
      setPermissions(initial);
    }
  }, [isOpen]);

  const togglePermission = (module: string) => {
    setPermissions(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    AVAILABLE_MODULES.forEach(m => all[m] = true);
    setPermissions(all);
  };

  const deselectAll = () => {
    const none: Record<string, boolean> = {};
    AVAILABLE_MODULES.forEach(m => none[m] = false);
    setPermissions(none);
  };

  const handleSave = () => {
    if (!roleName.trim()) return;
    
    const selectedModules = Object.keys(permissions).filter(k => permissions[k]);
    onSave(roleName.trim(), selectedModules);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Role">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Role Name</label>
          <input
            type="text"
            placeholder="e.g. Marketing Manager"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Default Permissions</h3>
              <p className="text-xs text-slate-500">Select which windows this role can access.</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={selectAll} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Select All</button>
              <span className="text-slate-300">|</span>
              <button onClick={deselectAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Deselect All</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
            {AVAILABLE_MODULES.map(module => (
              <div 
                key={module}
                onClick={() => togglePermission(module)}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  permissions[module] 
                    ? 'border-brand-500 bg-brand-50' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {permissions[module] ? (
                  <CheckSquare size={18} className="text-brand-600 mr-3 flex-shrink-0" />
                ) : (
                  <Square size={18} className="text-slate-400 mr-3 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${permissions[module] ? 'text-brand-900' : 'text-slate-600'}`}>
                  {module}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!roleName.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20 shadow-lg"
          >
            <ShieldPlus size={16} className="mr-2" /> Create Role
          </Button>
        </div>
      </div>
    </Modal>
  );
}
