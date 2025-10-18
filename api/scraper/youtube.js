import fetch from "node-fetch"

export const yt = {
  get baseUrl() {
    return { origin: 'https://ssvid.net' }
  },

  get baseHeaders() {
    return {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': this.baseUrl.origin,
      'referer': this.baseUrl.origin + '/youtube-to-mp3'
    }
  },

  validateFormat(userFormat) {
    const validFormat = ['mp3', '360p', '720p', '1080p']
    if (!validFormat.includes(userFormat))
      throw Error(`invalid format!. available formats: ${validFormat.join(', ')}`)
  },

  handleFormat(userFormat, searchJson) {
    this.validateFormat(userFormat)
    let result
    if (userFormat == 'mp3') {
      result = searchJson.links?.mp3?.mp3128?.k
    } else {
      let selectedFormat
      const allFormats = Object.entries(searchJson.links.mp4)
      const quality = allFormats
        .map(v => v[1].q)
        .filter(v => /\d+p/.test(v))
        .map(v => parseInt(v))
        .sort((a, b) => b - a)
        .map(v => v + 'p')
      if (!quality.includes(userFormat)) {
        selectedFormat = quality[0]
        console.log(`format ${userFormat} gak ada. auto fallback ke ${selectedFormat}`)
      } else selectedFormat = userFormat
      const find = allFormats.find(v => v[1].q == selectedFormat)
      result = find?.[1]?.k
    }
    if (!result) throw Error(`${userFormat} gak ada cuy. aneh`)
    return result
  },

  async hit(path, payload) {
    const body = new URLSearchParams(payload)
    const opts = { headers: this.baseHeaders, body, method: 'post' }
    const r = await fetch(`${this.baseUrl.origin}${path}`, opts)
    if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
    return await r.json()
  },

  async download(queryOrYtUrl, userFormat = 'mp3') {
    this.validateFormat(userFormat)
    let search = await this.hit('/api/ajax/search', {
      query: queryOrYtUrl,
      cf_token: "",
      vt: "youtube"
    })

    if (search.p == 'search') {
      if (!search?.items?.length) throw Error(`hasil pencarian ${queryOrYtUrl} tidak ada`)
      const { v, t } = search.items[0]
      const videoUrl = 'https://www.youtube.com/watch?v=' + v
      console.log(`[found]\ntitle : ${t}\nurl   : ${videoUrl}`)

      search = await this.hit('/api/ajax/search', {
        query: videoUrl,
        cf_token: "",
        vt: "youtube"
      })
    }

    const vid = search.vid
    const k = this.handleFormat(userFormat, search)
    const convert = await this.hit('/api/ajax/convert', { k, vid })

    if (convert.c_status == 'CONVERTING') {
      let convert2
      let attempt = 0
      const limit = 5
      do {
        attempt++
        console.log(`cek convert ${attempt}/${limit}`)
        convert2 = await this.hit('/api/convert/check?hl=en', {
          vid,
          b_id: convert.b_id
        })
        if (convert2.c_status == 'CONVERTED') return convert2
        await new Promise(r => setTimeout(r, 5000))
      } while (attempt < limit && convert2.c_status == 'CONVERTING')
      throw Error('file belum siap / status belum diketahui')
    } else return convert
  }
}

// Export wrapper agar bisa dipanggil di API
export async function youtubeScraper(url, format = 'mp3') {
  try {
    const result = await yt.download(url, format)
    return { success: true, result }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
