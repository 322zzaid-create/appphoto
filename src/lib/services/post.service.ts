import { createClient } from '@/lib/supabase/client'
import { uploadService } from '@/lib/services/upload.service'
import type { Post, PostImage } from '@/types'

export const POSTS_PAGE_SIZE = 5

export interface PostDraftImage {
  file: File
  title: string
  description: string
  categories: string[]
  tags: string[]
  device_type: string
}

export interface CreatePostInput {
  userId: string
  caption: string
  images: PostDraftImage[]
  autoApprove: boolean
}

export interface PostFeedPage {
  data: Post[]
  count: number
}

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

/**
 * Publishes a post. Every image is uploaded as its OWN wallpaper record
 * (with its own category/tags/device type) so it appears across the app,
 * and all of them are linked into a single post.
 */
export const postService = {
  async createPost(
    input: CreatePostInput,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    const supabase = createClient()

    if (input.images.length === 0) {
      return { success: false, error: 'No images selected' }
    }
    const untitled = input.images.filter((i) => !i.title.trim())
    if (untitled.length > 0) {
      return { success: false, error: 'Every image needs a title' }
    }
    const uncategorized = input.images.filter((i) => i.categories.length === 0)
    if (uncategorized.length > 0) {
      return { success: false, error: 'Every image needs at least one category' }
    }

    const wallpaperIds: string[] = []

    try {
      for (const image of input.images) {
        const { url: previewUrl, error: uploadError } =
          await uploadService.uploadWallpaper(image.file, input.userId)
        if (uploadError) throw new Error(uploadError)

        const dims = await uploadService.getImageDimensions(image.file)

        const { url: thumbUrl } = await uploadService.uploadThumbnail(
          image.file,
          input.userId,
        )

        const { url: originalUrl, error: originalError } =
          await uploadService.uploadOriginal(image.file, input.userId)
        if (originalError) throw new Error(originalError)

        const result = await uploadService.createWallpaperRecord({
          title: image.title,
          description: image.description,
          categories: image.categories,
          tags: image.tags,
          device_type: image.device_type,
          preview_url: previewUrl,
          thumbnail_url: thumbUrl || previewUrl,
          original_url: originalUrl,
          file_size: image.file.size,
          width: dims.width,
          height: dims.height,
          uploader_id: input.userId,
          status: input.autoApprove ? 'published' : 'draft',
        })

        if (!result.success || !result.wallpaperId) {
          throw new Error(result.error || 'Failed to save wallpaper')
        }
        wallpaperIds.push(result.wallpaperId)
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: input.userId,
          caption: input.caption.trim(),
        })
        .select('id')
        .single()
      if (postError || !post) {
        throw new Error(postError?.message || 'Failed to create post')
      }

      const { error: linkError } = await supabase.from('post_images').insert(
        wallpaperIds.map((wallpaperId, index) => ({
          post_id: post.id,
          wallpaper_id: wallpaperId,
          position: index,
        })),
      )
      if (linkError) throw new Error(linkError.message)

      return { success: true, postId: post.id }
    } catch (err) {
      // Best-effort cleanup of wallpapers created so far.
      if (wallpaperIds.length > 0) {
        await supabase.from('wallpapers').delete().in('id', wallpaperIds)
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create post',
      }
    }
  },

  async fetchPosts({
    from,
    to,
  }: {
    from: number
    to: number
  }): Promise<PostFeedPage> {
    const supabase = createClient()
    const { data, error, count } = await supabase
      .from('posts')
      .select(
        `
        *,
        user:profiles!posts_user_id_fkey(
          username, full_name, avatar_url,
          studio_name, studio_avatar_url
        ),
        images:post_images(
          position,
          wallpaper:wallpapers(*)
        )
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const posts = (data ?? []) as Post[]

    // Sort images by position and drop posts whose images are hidden by RLS
    // (e.g. draft wallpapers invisible to the current user).
    const visible: Post[] = []
    for (const post of posts) {
      const images = [...(post.images ?? [])]
        .sort((a, b) => toNumber(a.position) - toNumber(b.position))
        .filter((img: PostImage) => img.wallpaper) as PostImage[]
      if (images.length === 0) continue
      visible.push({ ...post, images })
    }

    return { data: visible, count: count ?? 0 }
  },

  async fetchMyPosts(userId: string): Promise<Post[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        user:profiles!posts_user_id_fkey(
          username, full_name, avatar_url,
          studio_name, studio_avatar_url
        ),
        images:post_images(
          position,
          wallpaper:wallpapers(*)
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return ((data ?? []) as Post[]).map((post) => ({
      ...post,
      images: [...(post.images ?? [])]
        .sort((a, b) => toNumber(a.position) - toNumber(b.position))
        .filter((img: PostImage) => img.wallpaper) as PostImage[],
    }))
  },

  async updatePostCaption(
    postId: string,
    caption: string,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .update({ caption: caption.trim() })
      .eq('id', postId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  },

  async deletePost(
    postId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  },
}
