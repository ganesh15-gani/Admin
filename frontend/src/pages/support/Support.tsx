import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, CheckCircle, Clock, Sparkles, Send, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/ToastContext';
import { delay } from '../../services/apiClient';

interface Ticket {
  id: string;
  type: 'refund' | 'payout' | 'general';
  subject: string;
  sender: string;
  time: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  message: string;
  reply?: string;
}

const initialTickets: Ticket[] = [
  {
    id: '10294',
    type: 'refund',
    subject: 'Guest Refund Request #10294',
    sender: 'Sarah Jenkins',
    time: '2 hours ago',
    status: 'Open',
    message: "I had to cancel my trip due to a medical emergency. Can you please process the refund for my booking?"
  },
  {
    id: '10295',
    type: 'payout',
    subject: 'Host Payout Delay',
    sender: 'Global Stays',
    time: '1 day ago',
    status: 'In Progress',
    message: "We haven't received the payout for the booking that ended on Friday. Please advise."
  }
];

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeAiTicketId, setActiveAiTicketId] = useState<string | null>(null);
  const [aiReplyState, setAiReplyState] = useState<{ isGenerating: boolean; text: string | null }>({ isGenerating: false, text: null });
  const [replyText, setReplyText] = useState('');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ subject: '', message: '', sender: 'Admin User' });
  const { success } = useToast();

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.subject || !createForm.message) return;

    const newTicket: Ticket = {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      type: 'general',
      subject: createForm.subject,
      sender: createForm.sender,
      time: 'Just now',
      status: 'Open',
      message: createForm.message
    };

    setTickets([newTicket, ...tickets]);
    success('Ticket created successfully');
    setIsCreateOpen(false);
    setCreateForm({ subject: '', message: '', sender: 'Admin User' });
  };

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    success('Ticket marked as resolved');
  };

  const handleAiSuggest = async (ticket: Ticket) => {
    setActiveAiTicketId(ticket.id);
    setAiReplyState({ isGenerating: true, text: null });
    await delay(1500); 
    
    let suggestedText = "Thank you for reaching out. We are looking into this and will get back to you shortly.";
    if (ticket.type === 'refund') {
      suggestedText = `Hello ${ticket.sender.split(' ')[0]}, I have reviewed your request. I have successfully processed a full refund to your original payment method. Please allow 3-5 business days for the funds to appear. Wishing you the best!`;
    } else if (ticket.type === 'payout') {
      suggestedText = `Hello ${ticket.sender}, apologies for the delay. There was a slight banking delay on our end. Your payout has been expedited and should clear by tomorrow morning.`;
    }

    setAiReplyState({ isGenerating: false, text: suggestedText });
    setReplyText(suggestedText); // Pre-fill the reply box
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'In Progress', reply: replyText } : t));
    success('Reply sent successfully');
    setActiveAiTicketId(null);
    setAiReplyState({ isGenerating: false, text: null });
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <LifeBuoy className="mr-2 text-brand-600" /> Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer and host support requests.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>Create Ticket</Button>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-50">
          <CardTitle>Active Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ticket.type === 'refund' ? 'bg-orange-100 text-orange-600' :
                      ticket.type === 'payout' ? 'bg-blue-100 text-blue-600' : 'bg-brand-100 text-brand-600'
                    }`}>
                      {ticket.type === 'payout' ? <Clock size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{ticket.subject}</h3>
                      <p className="text-xs text-slate-500">From: {ticket.sender} • {ticket.time}</p>
                    </div>
                  </div>
                  <Badge variant={ticket.status === 'Resolved' ? 'success' : ticket.status === 'In Progress' ? 'info' : 'warning'}>
                    {ticket.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-600 ml-13 mb-3 border-l-2 border-gray-200 pl-3">
                  "{ticket.message}"
                </p>

                {/* Display Sent Reply */}
                {ticket.reply && (
                  <div className="ml-13 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center">
                      <CheckCircle size={12} className="mr-1 text-brand-500" /> Support Reply
                    </h4>
                    <p className="text-sm text-slate-600">{ticket.reply}</p>
                  </div>
                )}
                
                {/* AI Reply / Manual Reply Area */}
                {activeAiTicketId === ticket.id && !ticket.reply && (
                  <div className="ml-13 mb-3 p-4 bg-brand-50/50 border border-brand-100 rounded-xl relative animate-fade-in">
                    <div className="absolute -top-2 -left-2 bg-brand-600 text-white p-1 rounded-full shadow-sm">
                      <Sparkles size={12} />
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                        {aiReplyState.isGenerating ? 'AI is thinking...' : 'Suggested Reply'}
                      </h4>
                      <button onClick={() => { setActiveAiTicketId(null); setReplyText(''); }} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>

                    {!aiReplyState.isGenerating && (
                      <div className="space-y-3">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full text-sm p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[100px] resize-none bg-white"
                        />
                        <div className="flex space-x-2">
                          <Button variant="primary" size="sm" onClick={() => handleSendReply(ticket.id)}>
                            <Send size={14} className="mr-2" /> Send Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="ml-13 flex flex-wrap gap-2">
                  {!ticket.reply && activeAiTicketId !== ticket.id && ticket.status !== 'Resolved' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-brand-600 hover:bg-brand-50 hover:border-brand-200"
                      onClick={() => handleAiSuggest(ticket)}
                    >
                      <Sparkles size={14} className="mr-1" /> Auto-Reply with AI
                    </Button>
                  )}
                  {ticket.status !== 'Resolved' && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => handleResolve(ticket.id)}>
                      <CheckCircle size={14} className="mr-1" /> Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {tickets.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle size={32} className="mx-auto text-green-300 mb-3" />
                <p>No active support tickets! You're all caught up.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-4 pt-2 p-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. System Access Issue"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              value={createForm.subject}
              onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
              value={createForm.message}
              onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
