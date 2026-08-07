import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { StudioApplication, PaginatedResponse } from '@/types'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export const studioService = {
  async getApplication(userId: string): Promise<StudioApplication | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('studio_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async apply(data: {
    user_id: string
    studio_name: string
    studio_description: string
    reason: string
  }): Promise<void> {
    const supabase = createClient()
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        studio_status: 'pending',
        studio_name: data.studio_name,
        studio_description: data.studio_description,
      })
      .eq('id', data.user_id)
    if (profileError) throw profileError

    const { error } = await supabase
      .from('studio_applications')
      .insert({
        user_id: data.user_id,
        studio_name: data.studio_name,
        studio_description: data.studio_description,
        reason: data.reason,
      })
    if (error) throw error
  },
}

export const studioAdminService = {
  async listApplications(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<StudioApplication & { user?: { id: string; username: string; full_name: string | null; avatar_url: string | null } }>> {
    const supabase = createAdminClient()
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('studio_applications')
      .select('*, user:profiles!studio_applications_user_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: (data ?? []) as (StudioApplication & { user?: { id: string; username: string; full_name: string | null; avatar_url: string | null } })[],
      count: count ?? 0,
      page,
      per_page: ITEMS_PER_PAGE,
      total_pages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
    }
  },

  async reviewApplication(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes: string,
    reviewedBy: string
  ): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('studio_applications')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) throw error

    const { data: app } = await supabase
      .from('studio_applications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (app) {
      const profileUpdate: Record<string, unknown> = {
        studio_status: status,
      }
      if (status === 'approved') {
        profileUpdate.approved_at = new Date().toISOString()
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', app.user_id)
      if (profileError) throw profileError
    }
  },
}
