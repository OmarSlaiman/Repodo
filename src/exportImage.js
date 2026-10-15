// Exporting the timeline. A nice-to-have: if it fails, nothing else breaks.

function serialize(svg) {
  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadSvg(svg, filename = 'onboarding-timeline.svg') {
  if (!svg) return false
  triggerDownload(new Blob([serialize(svg)], { type: 'image/svg+xml;charset=utf-8' }), filename)
  return true
}

export function downloadPng(svg, filename = 'onboarding-timeline.png', scale = 2) {
  if (!svg) return Promise.resolve(false)
  const source = serialize(svg)
  const width = Number(svg.getAttribute('width')) || svg.clientWidth
  const height = Number(svg.getAttribute('height')) || svg.clientHeight
  const bytes = new TextEncoder().encode(source)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(binary)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, filename)
        resolve(!!blob)
      }, 'image/png')
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}
