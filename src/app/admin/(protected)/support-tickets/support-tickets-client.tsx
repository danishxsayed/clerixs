'use client';

import * as React from 'react';
import { 
  Search, 
  LifeBuoy, 
  Ticket, 
  Mail, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Send,
  Loader2,
  Phone,
  Building,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateTicketStatus, sendTicketReply } from './actions';

interface TicketRecord {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  phone: string | null;
  clinic_name: string | null;
  category: string;
  subject: string;
  message: string;
  priority: string;
  page_url: string | null;
  steps_to_reproduce: string | null;
  branches_count: string | null;
  patient_volume: string | null;
  attachment_url: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface SupportTicketsClientProps {
  initialTickets: TicketRecord[];
}

export function SupportTicketsClient({ initialTickets }: SupportTicketsClientProps) {
  const [tickets, setTickets] = React.useState<TicketRecord[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  );
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Reply compose state
  const [replyMessage, setReplyMessage] = React.useState('');
  const [sendingReply, setSendingReply] = React.useState(false);
  const [updatingStatusId, setUpdatingStatusId] = React.useState<string | null>(null);

  // Sync tickets prop when server changes
  React.useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Filtered tickets computation
  const filteredTickets = tickets.filter(ticket => {
    // 1. Search Query (name, ticket number, email)
    const matchesSearch = 
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.includes(searchQuery) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Category Filter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    // 3. Status Filter
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Analytics Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const closedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Helpers for styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': 
        return 'bg-red-50 text-red-600 border-red-200/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'Urgent': 
        return 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      default: 
        return 'bg-slate-50 text-slate-500 border-slate-200/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': 
        return 'bg-blue-50 text-blue-600 border-blue-200/50';
      case 'in_progress': 
        return 'bg-purple-50 text-purple-600 border-purple-200/50';
      case 'resolved': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/50';
      case 'closed': 
        return 'bg-slate-100 text-slate-500 border-slate-200/50';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  // Status Change Handler
  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    setUpdatingStatusId(ticketId);
    try {
      const res = await updateTicketStatus(ticketId, newStatus);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update status.');
      }
      
      // Update local state
      setTickets(prev => 
        prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t)
      );
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Reply submit handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!replyMessage.trim() || replyMessage.trim().length < 5) {
      toast.error('Reply message must be at least 5 characters long.');
      return;
    }

    setSendingReply(true);
    try {
      const res = await sendTicketReply(selectedTicket.id, replyMessage);
      if (!res.success) {
        throw new Error(res.error || 'Failed to send reply.');
      }

      toast.success('Reply email sent successfully!');
      
      // Automatically advance status to in_progress locally if it was open
      const updatedStatus = selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status;
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? { ...t, status: updatedStatus } : t)
      );

      setReplyMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-blue-600 shrink-0" />
            Support Tickets Queue
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Manage customer technical reports, billing questions, and high-value sales leads.
          </p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tickets</span>
            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Tickets</span>
            <div className="h-8 w-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900">{openCount}</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</span>
            <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900">{inProgressCount}</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved & Closed</span>
            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900">{closedCount}</span>
        </div>
      </div>

      {/* Main Split Layout: Table on left, selected details on right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Search, Filters & Tickets Table */}
        <div className="xl:col-span-7 space-y-6 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search ticket #, name, subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-50 border-slate-200/80 pl-10 pr-4 h-10 text-xs font-semibold rounded-xl focus-visible:ring-blue-600/20"
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'all')}>
                <SelectTrigger className="bg-slate-50 border-slate-200/80 text-xs rounded-xl h-10 font-semibold">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs font-semibold">All Categories</SelectItem>
                  <SelectItem value="Technical Support" className="text-xs font-medium">Technical Support</SelectItem>
                  <SelectItem value="Billing & Subscription" className="text-xs font-medium">Billing & Subscription</SelectItem>
                  <SelectItem value="Feature Request" className="text-xs font-medium">Feature Request</SelectItem>
                  <SelectItem value="Sales Inquiry" className="text-xs font-medium">Sales Inquiry</SelectItem>
                  <SelectItem value="Enterprise / Branches" className="text-xs font-medium">Enterprise / Branches</SelectItem>
                  <SelectItem value="Bug Report" className="text-xs font-medium">Bug Report</SelectItem>
                  <SelectItem value="Other" className="text-xs font-medium">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Tab Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-2xl w-fit">
            {[
              { key: 'all', label: 'All' },
              { key: 'open', label: 'Open' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'closed', label: 'Closed' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 text-xs font-black capitalize rounded-xl transition-all ${
                  statusFilter === tab.key 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tickets List Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                  <th className="py-4 px-5">Ticket #</th>
                  <th className="py-4 px-5">Customer Details</th>
                  <th className="py-4 px-5">Subject / Category</th>
                  <th className="py-4 px-5">Priority</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {filteredTickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`cursor-pointer hover:bg-slate-50/80 transition-all duration-200 ${
                      selectedTicketId === ticket.id 
                        ? 'bg-blue-50/30 shadow-[inset_4px_0_0_#2563eb]' 
                        : ''
                    }`}
                  >
                    {/* Ticket # */}
                    <td className="py-4 px-5 whitespace-nowrap font-mono font-black text-blue-600">
                      #{ticket.ticket_number}
                    </td>
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <span className="text-slate-900 font-extrabold block truncate max-w-[120px]">{ticket.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[120px]">{ticket.email}</span>
                    </td>
                    {/* Subject / Category */}
                    <td className="py-4 px-5">
                      <span className="text-slate-800 font-bold block truncate max-w-[180px]">{ticket.subject}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mt-0.5">{ticket.category}</span>
                    </td>
                    {/* Priority */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="py-4 px-5 whitespace-nowrap text-[10px] text-slate-400 font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium italic">
                      No support tickets found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Selected Ticket Detailed Inspector Panel */}
        <div className="xl:col-span-5">
          {selectedTicket ? (
            <div className="space-y-6 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
              {/* Header Inspector */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900 tracking-tight font-mono">
                      Ticket #{selectedTicket.ticket_number}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityStyle(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Opened on {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Status Dropdown selector */}
                <div className="w-32 shrink-0">
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(val: any) => handleStatusChange(selectedTicket.id, val)}
                    disabled={updatingStatusId === selectedTicket.id}
                  >
                    <SelectTrigger className={`text-[10px] font-black uppercase tracking-wider rounded-xl h-8 border ${getStatusColor(selectedTicket.status)}`}>
                      {updatingStatusId === selectedTicket.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open" className="text-xs font-semibold uppercase text-blue-600">Open</SelectItem>
                      <SelectItem value="in_progress" className="text-xs font-semibold uppercase text-purple-600">In Progress</SelectItem>
                      <SelectItem value="resolved" className="text-xs font-semibold uppercase text-emerald-600">Resolved</SelectItem>
                      <SelectItem value="closed" className="text-xs font-semibold uppercase text-slate-500">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submitter details panel */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-[11px]">
                <div className="space-y-2">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <User className="h-3 w-3" /> Submitter
                  </p>
                  <p className="font-extrabold text-slate-800">{selectedTicket.name}</p>
                  <p className="text-slate-500 truncate font-medium">{selectedTicket.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Topic / Group
                  </p>
                  <p className="font-extrabold text-slate-800">{selectedTicket.category}</p>
                  <p className="text-slate-500 font-medium">Type: Support Request</p>
                </div>

                {selectedTicket.phone && (
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-extrabold text-slate-800">{selectedTicket.phone}</p>
                  </div>
                )}

                {selectedTicket.clinic_name && (
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <Building className="h-3 w-3" /> Clinic
                    </p>
                    <p className="font-extrabold text-slate-800">{selectedTicket.clinic_name}</p>
                  </div>
                )}
              </div>

              {/* Category-dependent parameters */}
              {(selectedTicket.page_url || selectedTicket.branches_count) && (
                <div className="bg-blue-50/20 border border-blue-100/30 p-4 rounded-2xl text-[11px] space-y-3">
                  <h4 className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">
                    {selectedTicket.category === 'Bug Report' ? 'Bug Context Details' : 'Sales Context Details'}
                  </h4>
                  
                  {selectedTicket.page_url && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Feature Location:</span>
                      <p className="font-semibold text-slate-800">{selectedTicket.page_url}</p>
                    </div>
                  )}
                  {selectedTicket.steps_to_reproduce && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Steps to reproduce:</span>
                      <p className="text-slate-700 font-medium bg-white/70 p-2 rounded-lg border mt-1 border-slate-100 whitespace-pre-wrap leading-relaxed">
                        {selectedTicket.steps_to_reproduce}
                      </p>
                    </div>
                  )}
                  {selectedTicket.branches_count && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Branches:</span>
                        <p className="font-bold text-slate-800">{selectedTicket.branches_count}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Patient Volume:</span>
                        <p className="font-bold text-slate-800">{selectedTicket.patient_volume}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subject & Message block */}
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subject</span>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Original Message</span>
                  <div className="bg-slate-50 border p-4 rounded-2xl text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-wrap max-h-48 overflow-y-auto mt-1">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Attachment Url link if present */}
                {selectedTicket.attachment_url && (
                  <div className="flex items-center gap-2 border bg-slate-50/50 p-3 rounded-xl border-slate-100 mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Attachment:</span>
                    <a 
                      href={selectedTicket.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View screenshot / doc
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Compose Reply Interface */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                    Compose Direct Reply
                  </span>
                </div>

                <form onSubmit={handleSendReply} className="space-y-3">
                  <Textarea
                    placeholder={`Compose email response to ${selectedTicket.name}...`}
                    rows={3}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs font-medium rounded-2xl"
                    required
                  />

                  <Button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                        Sending Email Reply...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-3.5 w-3.5 shrink-0" />
                        Send Email Response
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 border border-dashed rounded-3xl">
              <Ticket className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-400 font-bold text-xs">No ticket selected</p>
              <p className="text-[10px] text-slate-400 mt-1">Select a row to see full client information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
