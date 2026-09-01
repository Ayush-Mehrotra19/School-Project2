import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

export interface TimetableData {
  id?: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_favorite: boolean;
  metadata: Record<string, any>;
  schedule: Record<string, Array<{
    time: string;
    activity: string;
    type: string;
    location?: string;
    priority?: string;
  }>>;
  settings: Record<string, any>;
  shared_with?: string[];
  is_public?: boolean;
  share_token?: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimetableTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  template_data: any;
  is_public?: boolean;
  created_by?: string;
  usage_count?: number;
  rating?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TimetableHistory {
  id: string;
  timetable_id: string;
  change_type: 'created' | 'updated' | 'deleted' | 'shared' | 'duplicated';
  change_description: string;
  old_data?: any;
  new_data?: any;
  changed_fields?: string[];
  changed_at: string;
}

export interface TimetableAnalytics {
  id: string;
  timetable_id: string;
  event_type: 'viewed' | 'created' | 'updated' | 'shared' | 'exported' | 'duplicated';
  event_data: Record<string, any>;
  created_at: string;
}

class TimetableService {
  private async getSupabaseClient() {
    try {
      // Check if we're on the server side
      if (typeof window === 'undefined') {
        // Server-side - use server client with cookies
        const client = await createServerClient();
        if (!client) {
          throw new Error('Failed to initialize Supabase server client');
        }
        return client;
      } else {
        // Client-side - use browser client
        const client = createBrowserClient();
        if (!client) {
          throw new Error('Failed to initialize Supabase browser client');
        }
        return client;
      }
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw new Error('Supabase client initialization failed');
    }
  }

  // Create a new timetable
  async createTimetable(data: Partial<TimetableData>): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare the timetable data
      const timetableData = {
        user_id: user.id,
        title: data.title || 'My Timetable',
        description: data.description || '',
        is_active: data.is_active ?? true,
        is_favorite: data.is_favorite ?? false,
        metadata: data.metadata || {},
        schedule: data.schedule || {},
        settings: data.settings || {},
        shared_with: data.shared_with || [],
        is_public: data.is_public ?? false,
        version: 1
      };

      // Insert the timetable
      const { data: result, error } = await supabase
        .from('user_timetables')
        .insert(timetableData)
        .select()
        .single();

      if (error) {
        console.error('Error creating timetable:', error);
        return { data: null, error };
      }

      // Log analytics
      await this.logAnalytics(result.id, 'created', {
        title: result.title,
        source: 'manual'
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in createTimetable:', error);
      return { data: null, error };
    }
  }

  // Get all timetables for the current user
  async getTimetables(options: {
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: TimetableData[] | null; error: any; count?: number }> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('user_timetables')
        .select('*', { count: 'exact' });

      // Filter by active status if needed
      if (!options.includeInactive) {
        query = query.eq('is_active', true);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Order by favorite first, then updated_at
      query = query.order('is_favorite', { ascending: false })
                 .order('updated_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching timetables:', error);

        // Check if it's a "table not found" error
        if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          console.warn('Timetable tables do not exist. Please run the database migration.');
          return {
            data: null,
            error: {
              ...error,
              message: 'Database tables not found. Please run the migration script.',
              needsMigration: true
            }
          };
        }

        return { data: null, error };
      }

      return { data, error: null, count };
    } catch (error) {
      console.error('Error in getTimetables:', error);
      return { data: null, error };
    }
  }

  // Get a specific timetable by ID
  async getTimetableById(id: string): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching timetable:', error);
        return { data: null, error };
      }

      // Log view analytics
      await this.logAnalytics(id, 'viewed', {
        source: 'direct_access'
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error in getTimetableById:', error);
      return { data: null, error };
    }
  }

  // Get timetable by share token
  async getTimetableByShareToken(token: string): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('share_token', token)
        .or('is_public.eq.true,share_token.eq.' + token)
        .single();

      if (error) {
        console.error('Error fetching shared timetable:', error);
        return { data: null, error };
      }

      // Log view analytics
      await this.logAnalytics(data.id, 'viewed', {
        source: 'share_token',
        share_token: token
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error in getTimetableByShareToken:', error);
      return { data: null, error };
    }
  }

  // Update an existing timetable
  async updateTimetable(id: string, data: Partial<TimetableData>): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      // Increment version
      const updateData = {
        ...data,
        version: (data.version || 0) + 1,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('user_timetables')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating timetable:', error);
        return { data: null, error };
      }

      // Log analytics
      await this.logAnalytics(id, 'updated', {
        changed_fields: Object.keys(data)
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in updateTimetable:', error);
      return { data: null, error };
    }
  }

  // Delete a timetable
  async deleteTimetable(id: string): Promise<{ error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from('user_timetables')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting timetable:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteTimetable:', error);
      return { error };
    }
  }

  // Duplicate a timetable
  async duplicateTimetable(id: string, newTitle?: string): Promise<{ data: TimetableData | null; error: any }> {
    try {
      // First, get the original timetable
      const { data: original, error: fetchError } = await this.getTimetableById(id);

      if (fetchError || !original) {
        return { data: null, error: fetchError };
      }

      // Create a copy
      const { data: duplicated, error } = await this.createTimetable({
        title: newTitle || `${original.title} (Copy)`,
        description: original.description,
        metadata: original.metadata,
        schedule: original.schedule,
        settings: original.settings
      });

      if (error) {
        return { data: null, error };
      }

      // Log analytics for both original and new
      await this.logAnalytics(id, 'duplicated', {
        new_timetable_id: duplicated?.id
      });

      if (duplicated?.id) {
        await this.logAnalytics(duplicated.id, 'created', {
          source: 'duplicate',
          original_timetable_id: id
        });
      }

      return { data: duplicated, error: null };
    } catch (error) {
      console.error('Error in duplicateTimetable:', error);
      return { data: null, error };
    }
  }

  // Generate or regenerate share token
  async generateShareToken(id: string): Promise<{ data: { share_token: string } | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      // Call the database function to generate a unique token
      const { data, error } = await supabase
        .rpc('generate_share_token')
        .single();

      if (error) {
        console.error('Error generating share token:', error);
        return { data: null, error };
      }

      // Update the timetable with the new token
      const { data: updated, error: updateError } = await supabase
        .from('user_timetables')
        .update({ share_token: data, is_public: true })
        .eq('id', id)
        .select('share_token')
        .single();

      if (updateError) {
        return { data: null, error: updateError };
      }

      // Log analytics
      await this.logAnalytics(id, 'shared', {
        share_token: data
      });

      return { data: updated, error: null };
    } catch (error) {
      console.error('Error in generateShareToken:', error);
      return { data: null, error };
    }
  }

  // Get timetable history
  async getTimetableHistory(id: string, limit: number = 20): Promise<{ data: TimetableHistory[] | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('timetable_history')
        .select('*')
        .eq('timetable_id', id)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching timetable history:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getTimetableHistory:', error);
      return { data: null, error };
    }
  }

  // Get public templates
  async getPublicTemplates(category?: string, limit: number = 20): Promise<{ data: TimetableTemplate[] | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      let query = supabase
        .from('timetable_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getPublicTemplates:', error);
      return { data: null, error };
    }
  }

  // Create timetable from template
  async createFromTemplate(templateId: string, title?: string): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      // Get the template
      const { data: template, error: fetchError } = await supabase
        .from('timetable_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError || !template) {
        return { data: null, error: fetchError };
      }

      // Create timetable from template data
      const { data, error } = await this.createTimetable({
        title: title || template.name,
        description: `Created from template: ${template.name}`,
        metadata: template.template_data.metadata || {},
        schedule: template.template_data.schedule || {},
        settings: template.template_data.settings || {}
      });

      if (error) {
        return { data: null, error };
      }

      // Increment template usage count
      await supabase
        .from('timetable_templates')
        .update({
          usage_count: (template.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      // Log analytics
      if (data?.id) {
        await this.logAnalytics(data.id, 'created', {
          source: 'template',
          template_id: templateId
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createFromTemplate:', error);
      return { data: null, error };
    }
  }

  // Get analytics data
  async getAnalytics(id: string, days: number = 30): Promise<{ data: TimetableAnalytics[] | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('timetable_analytics')
        .select('*')
        .eq('timetable_id', id)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return { data: null, error };
    }
  }

  // Helper method to log analytics events
  private async logAnalytics(timetableId: string, eventType: string, eventData: Record<string, any> = {}) {
    try {
      const supabase = await this.getSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('timetable_analytics')
        .insert({
          timetable_id: timetableId,
          user_id: user?.id,
          event_type: eventType,
          event_data: eventData,
          ip_address: null, // Can be added later if needed
          user_agent: null  // Can be added later if needed
        });
    } catch (error) {
      console.error('Error logging analytics:', error);
      // Don't throw error, analytics should not break main flow
    }
  }

  // Export timetable to different formats
  async exportTimetable(id: string, format: 'json' | 'ical'): Promise<{ data: any; error: any }> {
    try {
      const { data: timetable, error } = await this.getTimetableById(id);

      if (error || !timetable) {
        return { data: null, error };
      }

      if (format === 'json') {
        return { data: timetable, error: null };
      } else if (format === 'ical') {
        // Convert to iCal format
        const icalData = this.convertToICal(timetable);
        return { data: icalData, error: null };
      }

      return { data: null, error: 'Unsupported format' };
    } catch (error) {
      console.error('Error in exportTimetable:', error);
      return { data: null, error };
    }
  }

  // Convert timetable data to iCal format
  private convertToICal(timetable: TimetableData): string {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayMap: { [key: string]: number } = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 7
    };

    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GrowMyIq//Timetable//EN\n';

    // Add events for each day
    days.forEach(day => {
      if (timetable.schedule[day]) {
        timetable.schedule[day].forEach((event: any) => {
          const [startTime, endTime] = event.time.split('-');
          const [startHour, startMin] = startTime.split(':');
          const [endHour, endMin] = endTime.split(':');

          // Get next occurrence of this day
          const today = new Date();
          const currentDay = today.getDay();
          const targetDay = dayMap[day];
          let daysUntilTarget = (targetDay - currentDay + 7) % 7;

          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + daysUntilTarget);
          eventDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

          const endDate = new Date(today);
          endDate.setDate(today.getDate() + daysUntilTarget);
          endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

          ical += 'BEGIN:VEVENT\n';
          ical += `DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
          ical += `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
          ical += `SUMMARY:${event.activity}\n`;
          if (event.location) {
            ical += `LOCATION:${event.location}\n`;
          }
          ical += `RRULE:FREQ=WEEKLY;BYDAY=${day.substring(0, 2).toUpperCase()}\n`;
          ical += 'END:VEVENT\n';
        });
      }
    });

    ical += 'END:VCALENDAR';
    return ical;
  }

  // Search timetables
  async searchTimetables(query: string, options: {
    includePublic?: boolean;
    limit?: number;
  } = {}): Promise<{ data: TimetableData[] | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      let dbQuery = supabase
        .from('user_timetables')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (options.includePublic) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,is_public.eq.true`);
      }

      if (options.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Error searching timetables:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in searchTimetables:', error);
      return { data: null, error };
    }
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<{ data: TimetableData | null; error: any }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from('user_timetables')
        .select('is_favorite')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      const result = await this.updateTimetable(id, {
        is_favorite: !data.is_favorite
      });

      return result;
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      return { data: null, error };
    }
  }

  // Archive/Unarchive timetable
  async archiveTimetable(id: string, archive: boolean = true): Promise<{ data: TimetableData | null; error: any }> {
    return this.updateTimetable(id, {
      is_active: !archive
    });
  }
}

// Create a singleton instance
const timetableService = new TimetableService();
export default timetableService;

// Export types
export type { TimetableService };
