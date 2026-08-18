import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { type BankAccount } from '../../services/bankApprovalService';

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | null;
  onApprove: () => void;
  onReject: () => void;
}

export function DocumentViewModal({ isOpen, onClose, account, onApprove, onReject }: DocumentViewModalProps) {
  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Verification">
      <div className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Bank Statement / Voided Check</h3>
              <p className="text-xs text-slate-500">Uploaded {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'recently'}</p>
            </div>
          </div>
          
          <div className="relative h-48 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center group">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
            <div className="relative z-10 flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
              <FileText size={48} className="text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-600">Simulated Document View</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-slate-500">File: {account.bankName.toLowerCase().replace(/\s+/g, '_')}_statement.pdf</span>
            <Button variant="outline" className="h-8 text-xs py-0">
              <Download size={14} className="mr-1.5" /> Download
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Verification Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500 text-xs">Account Holder Name</span>
              <span className="font-medium text-slate-800">{account.accountHolder}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs">Bank Name</span>
              <span className="font-medium text-slate-800">{account.bankName}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs">Account Number</span>
              <span className="font-medium text-slate-800">{account.accountNumber}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs">SWIFT/Routing Code</span>
              <span className="font-medium text-slate-800">{account.swiftCode || 'N/A'}</span>
            </div>
          </div>
        </div>

        {account.status === 'Pending' && (
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <Button variant="outline" onClick={onReject} className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
              <XCircle size={16} className="mr-2" /> Reject
            </Button>
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 shadow-lg">
              <CheckCircle size={16} className="mr-2" /> Approve & Link
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
