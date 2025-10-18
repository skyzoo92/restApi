import { tiktokScraper } from './scraper/tiktok.js'
import { youtubeScraper } from './scraper/youtube.js'
import { instagramScraper } from './scraper/instagram.js'

export default async function handler(req, res) {
  try {
    const { tiktok, youtube, instagram } = req.query

    if (tiktok) {
      const result = await tiktokScraper(tiktok)
      return res.status(200).json({ success: true, source: 'tiktok', result })
    }

    if (youtube) {
      const result = await youtubeScraper(youtube)
      return res.status(200).json({ success: true, source: 'youtube', result })
    }

    if (instagram) {
      const result = await instagramScraper(instagram)
      return res.status(200).json({ success: true, source: 'instagram', result })
    }

    res.status(400).json({
      success: false,
      error: 'Masukkan parameter ?tiktok= / ?youtube= / ?instagram='
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}