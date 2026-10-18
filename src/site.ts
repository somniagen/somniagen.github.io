export const REPO = 'https://github.com/somniagen/somnia'

export interface Feature {
  icon: string
  title: string
  text: string
}

export const features: Feature[] = [
  { icon: 'tune', title: 'Tuned defaults', text: 'WAI-Illustrious v17 and Anima-2.9B look right on the first try.' },
  { icon: 'devices', title: 'Watch from any device', text: 'Queue on the desktop, follow the render on your phone. Nothing gets interrupted.' },
  { icon: 'face_retouching_natural', title: 'Detailers', text: 'YOLO finds faces and hands and repaints them automatically.' },
  { icon: 'zoom_out_map', title: 'Hires + upscale', text: 'Latent second pass, upscale models and tiled refine.' },
  { icon: 'brush', title: 'Smart inpainter', text: 'A brush that snaps to edges, YOLO auto select and a live preview.' },
  { icon: 'sell', title: 'Danbooru tags', text: 'Autocomplete, category colors, wiki on hover and related tags.' },
  { icon: 'lock', title: 'Boilerplate locking', text: 'Lock quality tags and negatives so they stay out of your way.' },
  { icon: 'cloud_download', title: 'Civitai + Hugging Face', text: 'Browse and download models and LoRAs, with example prompts.' },
  { icon: 'grid_view', title: 'X/Y/Z grid', text: 'Compare samplers, CFG or LoRA weights side by side.' },
  { icon: 'photo_library', title: 'Gallery', text: 'Search, stacks, albums, favorites and a compare slider.' },
  { icon: 'content_cut', title: 'Background removal', text: 'One click transparent cutouts, tuned for anime art.' },
  { icon: 'edit', title: 'External editors', text: 'Round trip through Photoshop, Krita or Paint.NET.' },
  { icon: 'lan', title: 'LAN access', text: 'Use it from anywhere on your network, with an optional password.' },
  { icon: 'notifications_active', title: 'App + notifications', text: 'Install to your home screen and get pinged when the queue is done.' },
  { icon: 'extension', title: 'Plugins', text: 'Add pages, image actions and job hooks, hot reloaded.' },
  { icon: 'auto_awesome', title: 'Illustrious and Anima', text: 'SDXL and Anima engines, LoRAs, embeddings and PAG.' },
]
