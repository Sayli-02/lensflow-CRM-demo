import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialLeads, initialProjects } from '../data/mockData';

export const useCrmStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      leads: initialLeads,
      projects: initialProjects,
      searchQuery: '',

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      updateLeadStatus: (id, newStatus) => {
        set((state) => {
          const updatedLeads = state.leads.map((lead) => {
            if (lead.id === id) {
              return { ...lead, status: newStatus };
            }
            return lead;
          });

          let updatedProjects = [...state.projects];

          // Auto-generate project if status is Booked and project doesn't exist
          if (newStatus === 'Booked') {
            const lead = state.leads.find((l) => l.id === id);
            const projectExists = updatedProjects.some((p) => p.leadId === id);

            if (lead && !projectExists) {
              const newProject = {
                id: `proj-${String(updatedProjects.length + 1).padStart(3, '0')}`,
                leadId: lead.id,
                name: lead.name,
                event: `${lead.event} Photography`,
                eventDate: lead.eventDate,
                location: lead.location,
                milestones: {
                  bookingConfirmed: true,
                  shootCompleted: false,
                  editing: false,
                  album: false,
                  finalDelivery: false,
                },
                total: lead.quotation || lead.budget || 0,
                paid: lead.advance || 0,
              };
              updatedProjects.push(newProject);
            }
          }

          return {
            leads: updatedLeads,
            projects: updatedProjects,
          };
        });
      },

      addLead: (leadData) => {
        set((state) => {
          const newId = `lead-${String(state.leads.length + 1).padStart(3, '0')}`;
          const today = new Date().toISOString().split('T')[0];
          const newLead = {
            id: leadData.id || newId,
            name: leadData.name || '',
            source: leadData.source || 'Website',
            handle: leadData.handle || null,
            phone: leadData.phone || '',
            email: leadData.email || '',
            event: leadData.event || 'Wedding',
            eventDate: leadData.eventDate || today,
            location: leadData.location || '',
            guests: leadData.guests || 100,
            requirements: leadData.requirements || ['Photography'],
            budget: Number(leadData.budget) || 0,
            quotation: leadData.quotation ? Number(leadData.quotation) : null,
            advance: Number(leadData.advance) || 0,
            status: leadData.status || 'New',
            nextFollowUp: leadData.nextFollowUp || null,
            activity: leadData.activity || [{ date: today, note: 'Lead created' }],
            createdAt: today,
          };

          let updatedProjects = [...state.projects];
          if (newLead.status === 'Booked') {
            updatedProjects.push({
              id: `proj-${String(updatedProjects.length + 1).padStart(3, '0')}`,
              leadId: newLead.id,
              name: newLead.name,
              event: `${newLead.event} Photography`,
              eventDate: newLead.eventDate,
              location: newLead.location,
              milestones: {
                bookingConfirmed: true,
                shootCompleted: false,
                editing: false,
                album: false,
                finalDelivery: false,
              },
              total: newLead.quotation || newLead.budget || 0,
              paid: newLead.advance || 0,
            });
          }

          return {
            leads: [newLead, ...state.leads],
            projects: updatedProjects,
          };
        });
      },

      addActivity: (leadId, note) => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          return {
            leads: state.leads.map((lead) => {
              if (lead.id === leadId) {
                const activity = lead.activity || [];
                return {
                  ...lead,
                  activity: [...activity, { date: today, note }],
                };
              }
              return lead;
            }),
          };
        });
      },

      setNextFollowUp: (leadId, date) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, nextFollowUp: date } : lead
          ),
        }));
      },

      updateProjectMilestone: (projectId, milestoneKey, isCompleted) => {
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id === projectId) {
              return {
                ...proj,
                milestones: {
                  ...proj.milestones,
                  [milestoneKey]: isCompleted,
                },
              };
            }
            return proj;
          }),
        }));
      },

      updateProjectPayment: (projectId, paidAmount) => {
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id === projectId) {
              return { ...proj, paid: Number(paidAmount) || 0 };
            }
            return proj;
          }),
        }));
      },
    }),
    {
      name: 'lensflow_crm_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
