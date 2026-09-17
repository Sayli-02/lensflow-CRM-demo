import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useCrmStore = create((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  leads: [],
  projects: [],
  searchQuery: '',

  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchData: async () => {
    set({ isLoading: true });

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`*, lead_activities (*)`)
      .order('created_at', { ascending: false });

    if (leadsError) console.error('Error fetching leads:', leadsError);

    const formattedLeads = (leadsData || []).map((lead) => ({
      id: lead.id,
      name: lead.name,
      source: lead.source,
      handle: lead.handle,
      phone: lead.phone,
      email: lead.email,
      event: lead.event,
      eventDate: lead.event_date,
      location: lead.location,
      guests: lead.guests,
      requirements: lead.requirements || [],
      budget: Number(lead.budget) || 0,
      quotation: lead.quotation ? Number(lead.quotation) : null,
      advance: Number(lead.advance) || 0,
      status: lead.status,
      nextFollowUp: lead.next_follow_up,
      createdAt: lead.created_at,
      archived: lead.archived || false,
      activity: (lead.lead_activities || []).map((act) => ({
        date: act.date,
        note: act.note,
      })),
    }));

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) console.error('Error fetching projects:', projectsError);

    const formattedProjects = (projectsData || []).map((proj) => ({
      id: proj.id,
      leadId: proj.lead_id,
      name: proj.name,
      event: proj.event,
      eventDate: proj.event_date,
      location: proj.location,
      total: Number(proj.total) || 0,
      paid: Number(proj.paid) || 0,
      milestones: {
        bookingConfirmed: proj.milestone_booking_confirmed,
        shootCompleted: proj.milestone_shoot_completed,
        editing: proj.milestone_editing,
        album: proj.milestone_album,
        finalDelivery: proj.milestone_final_delivery,
      },
    }));

    set({ leads: formattedLeads, projects: formattedProjects, isLoading: false });
  },

  updateLeadStatus: async (id, newStatus) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, status: newStatus } : lead
      ),
    }));
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (newStatus === 'Booked') {
      const state = get();
      const lead = state.leads.find((l) => l.id === id);
      const projectExists = state.projects.some((p) => p.leadId === id);
      if (lead && !projectExists) {
        const { data: newProj } = await supabase
          .from('projects')
          .insert({
            lead_id: lead.id,
            name: lead.name,
            event: `${lead.event} Photography`,
            event_date: lead.eventDate,
            location: lead.location,
            total: lead.quotation || lead.budget || 0,
            paid: lead.advance || 0,
          })
          .select()
          .single();
        if (newProj) get().fetchData();
      }
    }
  },

  addLead: async (leadData) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: newLead } = await supabase
      .from('leads')
      .insert({
        name: leadData.name || '',
        source: leadData.source || 'Website',
        handle: leadData.handle || null,
        phone: leadData.phone || '',
        email: leadData.email || '',
        event: leadData.event || 'Wedding',
        event_date: leadData.eventDate || today,
        location: leadData.location || '',
        guests: leadData.guests || 100,
        requirements: leadData.requirements || ['Photography'],
        budget: Number(leadData.budget) || 0,
        quotation: leadData.quotation ? Number(leadData.quotation) : null,
        advance: Number(leadData.advance) || 0,
        status: leadData.status || 'New',
        next_follow_up: leadData.nextFollowUp || null,
        archived: false,
      })
      .select()
      .single();

    if (newLead) {
      await supabase.from('lead_activities').insert({
        lead_id: newLead.id,
        note: 'Lead created',
        date: today,
      });
      if (newLead.status === 'Booked') {
        await supabase.from('projects').insert({
          lead_id: newLead.id,
          name: newLead.name,
          event: `${newLead.event} Photography`,
          event_date: newLead.event_date,
          location: newLead.location,
          total: newLead.quotation || newLead.budget || 0,
          paid: newLead.advance || 0,
        });
      }
      get().fetchData();
    }
  },

  addActivity: async (leadId, note) => {
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('lead_activities').insert({ lead_id: leadId, note, date: today });
    get().fetchData();
  },

  setNextFollowUp: async (leadId, date) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, nextFollowUp: date } : lead
      ),
    }));
    await supabase.from('leads').update({ next_follow_up: date }).eq('id', leadId);
  },

  updateProjectMilestone: async (projectId, milestoneKey, isCompleted) => {
    const columnMap = {
      bookingConfirmed: 'milestone_booking_confirmed',
      shootCompleted: 'milestone_shoot_completed',
      editing: 'milestone_editing',
      album: 'milestone_album',
      finalDelivery: 'milestone_final_delivery',
    };
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === projectId
          ? { ...proj, milestones: { ...proj.milestones, [milestoneKey]: isCompleted } }
          : proj
      ),
    }));
    if (columnMap[milestoneKey]) {
      await supabase.from('projects').update({ [columnMap[milestoneKey]]: isCompleted }).eq('id', projectId);
    }
  },

  updateProjectPayment: async (projectId, paidAmount) => {
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === projectId ? { ...proj, paid: Number(paidAmount) || 0 } : proj
      ),
    }));
    await supabase.from('projects').update({ paid: Number(paidAmount) || 0 }).eq('id', projectId);
  },

  updateLead: async (id, updatedFields) => {
    const dbFields = {};
    if (updatedFields.name !== undefined) dbFields.name = updatedFields.name;
    if (updatedFields.phone !== undefined) dbFields.phone = updatedFields.phone;
    if (updatedFields.email !== undefined) dbFields.email = updatedFields.email;
    if (updatedFields.source !== undefined) dbFields.source = updatedFields.source;
    if (updatedFields.handle !== undefined) dbFields.handle = updatedFields.handle;
    if (updatedFields.event !== undefined) dbFields.event = updatedFields.event;
    if (updatedFields.eventDate !== undefined) dbFields.event_date = updatedFields.eventDate;
    if (updatedFields.location !== undefined) dbFields.location = updatedFields.location;
    if (updatedFields.guests !== undefined) dbFields.guests = Number(updatedFields.guests);
    if (updatedFields.requirements !== undefined) dbFields.requirements = updatedFields.requirements;
    if (updatedFields.budget !== undefined) dbFields.budget = Number(updatedFields.budget);
    if (updatedFields.quotation !== undefined) dbFields.quotation = updatedFields.quotation ? Number(updatedFields.quotation) : null;
    if (updatedFields.advance !== undefined) dbFields.advance = Number(updatedFields.advance);
    if (updatedFields.status !== undefined) dbFields.status = updatedFields.status;
    if (updatedFields.nextFollowUp !== undefined) dbFields.next_follow_up = updatedFields.nextFollowUp;

    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updatedFields } : lead
      ),
    }));
    await supabase.from('leads').update(dbFields).eq('id', id);
  },

  deleteLead: async (id) => {
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      projects: state.projects.filter((proj) => proj.leadId !== id),
    }));
    await supabase.from('leads').delete().eq('id', id);
  },

  // ── Archive / Restore ─────────────────────────────────────────────────────
  archiveLead: async (id) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, archived: true } : lead
      ),
    }));
    await supabase.from('leads').update({ archived: true }).eq('id', id);
  },

  restoreLead: async (id) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, archived: false } : lead
      ),
    }));
    await supabase.from('leads').update({ archived: false }).eq('id', id);
  },

  // ── Bulk Actions ──────────────────────────────────────────────────────────
  bulkArchive: async (ids) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        ids.includes(lead.id) ? { ...lead, archived: true } : lead
      ),
    }));
    await supabase.from('leads').update({ archived: true }).in('id', ids);
  },

  bulkRestore: async (ids) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        ids.includes(lead.id) ? { ...lead, archived: false } : lead
      ),
    }));
    await supabase.from('leads').update({ archived: false }).in('id', ids);
  },

  bulkUpdateStatus: async (ids, newStatus) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        ids.includes(lead.id) ? { ...lead, status: newStatus } : lead
      ),
    }));
    await supabase.from('leads').update({ status: newStatus }).in('id', ids);
  },
}));
