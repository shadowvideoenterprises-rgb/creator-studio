import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { query, type = 'photos' } = await req.json()
    const results: any[] = []
    const promises = []

    // Check availability
    const hasPexels = !!process.env.PEXELS_API_KEY
    const hasPixabay = !!process.env.PIXABAY_API_KEY
    const hasGiphy = !!process.env.GIPHY_API_KEY
    const hasUnsplash = !!process.env.UNSPLASH_ACCESS_KEY

    // Fallback if no keys exist
    if (!hasPexels && !hasPixabay && !hasGiphy && !hasUnsplash) {
        return NextResponse.json({ results: [{
            id: 'demo-1',
            provider: 'System (No API Keys)',
            type: 'image',
            thumbnail: 'https://via.placeholder.com/640x360?text=Add+API+Keys+in+.env',
            url: 'https://via.placeholder.com/1280x720?text=Add+API+Keys+in+.env',
            author: 'System'
        }]})
    }

    // --- 1. PEXELS SEARCH ---
    if (hasPexels) {
      const endpoint = type === 'videos' ? 'videos/search' : 'v1/search'
      promises.push(
        fetch(`https://api.pexels.com/${endpoint}?query=${query}&per_page=10`, {
          headers: { Authorization: process.env.PEXELS_API_KEY! }
        }).then(async res => {
          const data = await res.json()
          if (type === 'videos') {
            return data.videos?.map((v: any) => ({
              id: `pex-${v.id}`,
              provider: 'Pexels',
              type: 'video',
              thumbnail: v.image,
              url: v.video_files[0].link,
              author: v.user.name
            })) || []
          } else {
            return data.photos?.map((p: any) => ({
              id: `pex-${p.id}`,
              provider: 'Pexels',
              type: 'image',
              thumbnail: p.src.medium,
              url: p.src.original,
              author: p.photographer
            })) || []
          }
        })
      )
    }

    // --- 2. PIXABAY SEARCH ---
    if (hasPixabay) {
      const category = type === 'videos' ? 'video' : 'photo'
      promises.push(
        fetch(`https://pixabay.com/api/${type === 'videos' ? 'videos/' : ''}?key=${process.env.PIXABAY_API_KEY}&q=${query}&image_type=${category}&per_page=10`)
          .then(async res => {
            const data = await res.json()
            if (type === 'videos') {
               return data.hits?.map((v: any) => ({
                id: `pix-${v.id}`,
                provider: 'Pixabay',
                type: 'video',
                thumbnail: v.userImageURL || `https://i.vimeocdn.com/video/${v.picture_id}_295x166.jpg`,
                url: v.videos?.medium?.url || v.videos?.small?.url,
                author: v.user
              })) || []
            } else {
              return data.hits?.map((p: any) => ({
                id: `pix-${p.id}`,
                provider: 'Pixabay',
                type: 'image',
                thumbnail: p.webformatURL,
                url: p.largeImageURL,
                author: p.user
              })) || []
            }
          })
      )
    }

    // --- 3. GIPHY SEARCH (Images Only) ---
    // GIPHY doesn't do "stock video" in the same way, so we only search it if user asks for photos/gifs
    if (hasGiphy && type !== 'videos') {
        promises.push(
          fetch(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${query}&limit=10&rating=pg`)
            .then(async res => {
              const data = await res.json()
              return data.data?.map((g: any) => ({
                id: `gip-${g.id}`,
                provider: 'GIPHY',
                type: 'image', // We treat GIFs as images for the UI
                thumbnail: g.images.fixed_height.url,
                url: g.images.original.url,
                author: g.username || 'Giphy'
              })) || []
            })
        )
    }

    // --- 4. UNSPLASH SEARCH ---
    if (hasUnsplash && type !== 'videos') {
      promises.push(
        fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=${process.env.UNSPLASH_ACCESS_KEY}`)
          .then(async res => {
            const data = await res.json()
            return data.results?.map((u: any) => ({
              id: `uns-${u.id}`,
              provider: 'Unsplash',
              type: 'image',
              thumbnail: u.urls.small,
              url: u.urls.regular,
              author: u.user.name
            })) || []
          })
      )
    }

    // Execute all
    const settled = await Promise.allSettled(promises)
    settled.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      }
    })

    // Shuffle and return
    return NextResponse.json({ results: results.sort(() => Math.random() - 0.5) })

  } catch (error) {
    console.error('Asset Search Error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}