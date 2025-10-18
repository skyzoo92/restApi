export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: '🚀 REST API aktif dan siap digunakan',
        routes: {
          tiktok: '/api/example?tiktok=url',
          youtube: '/api/example?youtube=url',
          instagram: '/api/example?instagram=url'
        }
      })
    }
    res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}