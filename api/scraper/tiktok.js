import axios from "axios"
import qs from "qs"

// Fungsi helper untuk format tanggal
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

// Fungsi helper untuk format angka
function formatNumber(num) {
  if (!num) return "0"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export async function tiktokScraper(url) {
  try {
    const postData = qs.stringify({
      url,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1,
    })

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
    }

    const res = await axios.post("https://www.tikwm.com/api/", postData, { headers })
    const data = res.data.data
    const videoId = data.id
    const isSlide = Array.isArray(data.images) && data.images.length > 0

    const result = {
      status: true,
      creator: "@kelvdra/scraper",
      result: {
        title: data.title,
        taken_at: formatDate(data.create_time),
        region: data.region,
        id: videoId,
        durations: data.duration || 0,
        duration: data.duration ? `${data.duration} Seconds` : "Photo Slide",
        cover: `https://www.tikwm.com/video/cover/${videoId}.webp`,
        size_nowm: data.size || 0,
        size_nowm_hd: data.hd_size || 0,
        data: isSlide
          ? data.images.map((url, i) => ({
              type: `slide_${i + 1}`,
              url,
            }))
          : [
              {
                type: "nowatermark",
                url: `https://www.tikwm.com/video/media/play/${videoId}.mp4`,
              },
              {
                type: "nowatermark_hd",
                url: `https://www.tikwm.com/video/media/hdplay/${videoId}.mp4`,
              },
            ],
        music_info: {
          id: data.music_info?.id || "",
          title: data.music_info?.title || "-",
          author: data.music_info?.author || "-",
          album: data.music_info?.album || "Unknown",
          url: `https://www.tikwm.com/video/music/${videoId}.mp3`,
        },
        stats: {
          views: formatNumber(data.play_count),
          likes: formatNumber(data.digg_count),
          comment: formatNumber(data.comment_count),
          share: formatNumber(data.share_count),
          download: formatNumber(data.download_count),
        },
        author: {
          id: data.author?.id || "",
          fullname: data.author?.nickname || "",
          nickname: data.author?.unique_id || "",
          avatar: `https://www.tikwm.com/video/avatar/${videoId}.jpeg`,
        },
      },
    }

    return result
  } catch (err) {
    return { status: false, message: err.message }
  }
}