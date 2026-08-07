import type { AdConfiguration, AdType, InteractionType } from '@/types'

interface AdProvider {
  loadAd(config: AdConfiguration): Promise<void>
  showAd(config: AdConfiguration): Promise<boolean>
  hideAd(config: AdConfiguration): void
  isLoaded(config: AdConfiguration): boolean
  recordInteraction(
    adConfigId: string,
    userId: string,
    wallpaperId: string | null,
    type: InteractionType
  ): Promise<void>
}

class AbstractAdService implements AdProvider {
  private providers: Map<string, AdProvider> = new Map()
  private loadedAds: Set<string> = new Set()

  registerProvider(name: string, provider: AdProvider): void {
    this.providers.set(name, provider)
  }

  getProvider(name: string): AdProvider | undefined {
    return this.providers.get(name)
  }

  async loadAd(config: AdConfiguration): Promise<void> {
    const provider = this.providers.get(config.provider)
    if (!provider) {
      console.warn(`Ad provider "${config.provider}" not registered`)
      return
    }
    await provider.loadAd(config)
    this.loadedAds.add(config.id)
  }

  async showAd(config: AdConfiguration): Promise<boolean> {
    const provider = this.providers.get(config.provider)
    if (!provider || !this.loadedAds.has(config.id)) return false
    const result = await provider.showAd(config)
    if (result) {
      this.loadedAds.delete(config.id)
    }
    return result
  }

  hideAd(config: AdConfiguration): void {
    const provider = this.providers.get(config.provider)
    provider?.hideAd(config)
    this.loadedAds.delete(config.id)
  }

  isLoaded(config: AdConfiguration): boolean {
    return this.loadedAds.has(config.id)
  }

  async recordInteraction(
    adConfigId: string,
    userId: string,
    wallpaperId: string | null,
    type: InteractionType
  ): Promise<void> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { error } = await supabase.from('user_ad_interactions').insert({
      user_id: userId,
      ad_config_id: adConfigId,
      wallpaper_id: wallpaperId,
      interaction_type: type,
      reward_granted: type === 'completed',
    })

    if (error) {
      console.error('Failed to record ad interaction:', error)
    }
  }

  async getConfigs(): Promise<AdConfiguration[]> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('ad_configurations')
      .select('*')
      .eq('is_enabled', true)

    if (error) throw error
    return (data ?? []) as AdConfiguration[]
  }

  async getConfigsByType(type: AdType): Promise<AdConfiguration[]> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('ad_configurations')
      .select('*')
      .eq('ad_type', type)
      .eq('is_enabled', true)

    if (error) throw error
    return (data ?? []) as AdConfiguration[]
  }

  async getConfigsByProvider(providerName: string): Promise<AdConfiguration[]> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('ad_configurations')
      .select('*')
      .eq('provider', providerName)
      .eq('is_enabled', true)

    if (error) throw error
    return (data ?? []) as AdConfiguration[]
  }

  async checkCooldown(configId: string, userId: string): Promise<boolean> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: config } = await supabase
      .from('ad_configurations')
      .select('cooldown_seconds, frequency_cap')
      .eq('id', configId)
      .single()

    if (!config) return false

    const { data: recentInteractions, count } = await supabase
      .from('user_ad_interactions')
      .select('id', { count: 'exact' })
      .eq('ad_config_id', configId)
      .eq('user_id', userId)
      .gte(
        'created_at',
        new Date(Date.now() - (config.cooldown_seconds ?? 300) * 1000).toISOString()
      )

    if (config.frequency_cap && (count ?? 0) >= config.frequency_cap) {
      return false
    }

    return true
  }
}

export const adsService = new AbstractAdService()
