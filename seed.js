import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { initialLeads, initialProjects } from './src/data/mockData.js';

// Parse .env.local manually so we don't need dotenv
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valParts] = line.split('=');
  const val = valParts.join('=');
  if (key && val) env[key.trim()] = val.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  console.log('Starting seed process...');
  
  for (const lead of initialLeads) {
    const { id: oldId, activity, nextFollowUp, eventDate, createdAt, followUpTime, bookedAt, ...leadData } = lead;
    
    // Insert the lead, mapping camelCase to snake_case
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        event_date: eventDate,
        next_follow_up: nextFollowUp,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Failed to insert lead:', lead.name, leadError);
      continue;
    }
    console.log(`✅ Inserted lead: ${newLead.name}`);

    // Insert activities for this lead
    if (activity && activity.length > 0) {
      for (const act of activity) {
        const { error: actError } = await supabase.from('lead_activities').insert({
          lead_id: newLead.id,
          note: act.note,
          date: act.date,
        });
        if (actError) console.error('Failed to insert activity for', newLead.name, actError);
      }
    }

    // Insert project if one exists for this lead
    const proj = initialProjects.find(p => p.leadId === oldId);
    if (proj) {
      const { error: projError } = await supabase.from('projects').insert({
        lead_id: newLead.id,
        name: proj.name,
        event: proj.event,
        event_date: proj.eventDate,
        location: proj.location,
        total: proj.total,
        paid: proj.paid,
        milestone_booking_confirmed: proj.milestones.bookingConfirmed,
        milestone_shoot_completed: proj.milestones.shootCompleted,
        milestone_editing: proj.milestones.editing,
        milestone_album: proj.milestones.album,
        milestone_final_delivery: proj.milestones.finalDelivery,
      });
      if (projError) console.error('Failed to insert project for', newLead.name, projError);
      else console.log(`✅ Inserted project for: ${newLead.name}`);
    }
  }
  
  console.log('Seeding complete! You can now check your Supabase dashboard.');
}

seed();
