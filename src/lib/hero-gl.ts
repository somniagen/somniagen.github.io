const vert = `
attribute vec2 pos;
varying vec2 vUv;
void main() {
  vUv = vec2(pos.x * 0.5 + 0.5, 0.5 - pos.y * 0.5);
  gl_Position = vec4(pos, 0.0, 1.0);
}`

const frag = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uImg;
uniform sampler2D uMask;
uniform vec4 uCover;
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uDpr;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.02 + 3.1;
    a *= 0.5;
  }
  return v;
}

vec3 hueRotate(vec3 c, float a) {
  vec3 k = vec3(0.57735);
  float co = cos(a);
  return c * co + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - co);
}

// violet -> cyan -> pink cosine palette
vec3 nebula(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.62, 0.42, 0.18)));
}

float starLayer(vec2 p, float cellPx, float density, float speed, float seed) {
  float unitPx = uRes.y / uCover.w;
  float scale = unitPx / (cellPx * uDpr);
  vec2 sp = (p + vec2(uTime * speed, uTime * speed * 0.18)) * scale + seed * 17.0;
  vec2 cell = floor(sp);
  vec2 f = fract(sp) - 0.5;
  float h = hash(cell + seed);
  if (h < 1.0 - density) return 0.0;
  vec2 o = (vec2(hash(cell + 1.3 + seed), hash(cell + 7.1 + seed)) - 0.5) * 0.6;
  float d = length(f - o) * cellPx;
  float tw = 0.5 + 0.5 * sin(uTime * (0.8 + h * 2.4) + h * 40.0);
  tw = tw * tw;
  float core = exp(-d * d / 0.8);
  float halo = exp(-d * d / 9.0) * 0.22;
  return (core + halo) * tw * (0.6 + 0.8 * fract(h * 13.7));
}

// 0 for white or grey hair strands, 1 for dark or colorful space
float galaxy(vec3 c) {
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  return 1.0 - smoothstep(0.5, 0.8, lum) * (1.0 - smoothstep(0.1, 0.3, sat));
}

void main() {
  vec2 uv = uCover.xy + vUv * uCover.zw;
  vec4 base = texture2D(uImg, uv);
  float m = texture2D(uMask, uv).r;
  if (m < 0.004) {
    gl_FragColor = base;
    return;
  }
  vec2 p = uv * vec2(uAspect, 1.0);
  float t = uTime;
  vec2 drift = vec2(t * 0.02, t * 0.005);

  // only the galaxy parts move, white strands inside the mask stay put
  float g = m * galaxy(base.rgb);

  // drifting domain warped cloud field, independent of the image so nothing gets dragged along
  vec2 q = vec2(fbm(p * 1.8 + drift), fbm(p * 1.8 + vec2(5.2, 1.3) - drift * 0.6));
  vec2 r = vec2(fbm(p * 1.8 + 2.6 * q + vec2(1.7, 9.2) + t * 0.035), fbm(p * 1.8 + 2.6 * q + vec2(8.3, 2.8) - t * 0.03));
  float n = fbm(p * 2.4 + 2.2 * r + drift * 1.5);

  // faint heat haze refraction, a few pixels at most and only between galaxy pixels
  vec2 sp = uv + (r - 0.5) * 0.007 * g;
  vec3 hz = texture2D(uImg, sp).rgb;
  vec3 col = mix(base.rgb, hz, g * galaxy(hz) * texture2D(uMask, sp).r);

  // clouds of light and shadow rolling through the existing galaxy
  col *= 1.0 + (n - 0.5) * 0.9 * g;
  vec3 neb = nebula(n * 0.9 + r.x * 0.4 + t * 0.012);
  col += neb * pow(smoothstep(0.35, 0.85, n), 2.0) * 0.45 * g;

  // slow hue drift on the colorful parts
  float sat = max(col.r, max(col.g, col.b)) - min(col.r, min(col.g, col.b));
  float ang = (r.y - 0.5) * 1.6 + sin(t * 0.07) * 0.35;
  col = mix(col, hueRotate(col, ang), smoothstep(0.05, 0.3, sat) * 0.7 * g);

  float s = starLayer(p, 26.0, 0.16, 0.010, 0.0) + starLayer(p, 40.0, 0.22, 0.016, 3.7) + starLayer(p, 64.0, 0.30, 0.024, 9.1);
  col += vec3(0.9, 0.95, 1.0) * s * (0.25 + 0.75 * g);

  gl_FragColor = vec4(mix(base.rgb, col, smoothstep(0.0, 0.6, m)), 1.0);
}`

export interface HeroOptions {
  // banner sizes, smallest first; the one covering the cropped canvas is used
  sources: { src: string; width: number }[]
  aspect: number
  mask: string
  // object-position style focus for the cover crop, 0..1
  focus: [number, number]
  reduced: () => boolean
  onready?: () => void
  onlost?: () => void
}

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const im = new Image()
    im.decoding = 'async'
    im.onload = () => ok(im)
    im.onerror = fail
    im.src = src
  })
}

export function startHero(canvas: HTMLCanvasElement, o: HeroOptions): () => void {
  const attrs = { alpha: false, antialias: false, premultipliedAlpha: false }
  const gl = (canvas.getContext('webgl2', attrs) ?? canvas.getContext('webgl', attrs)) as WebGLRenderingContext | null
  if (!gl) return () => {}
  // webgl2 can mipmap non power of two textures, which keeps the downscaled banner sharp instead of aliased
  const mips = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext

  function shader(type: number, src: string) {
    const s = gl!.createShader(type)!
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s) ?? 'shader')
    return s
  }
  const prog = gl.createProgram()!
  try {
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link')
  } catch (e) {
    console.warn('hero shader disabled', e)
    return () => {}
  }
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'pos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (n: string) => gl.getUniformLocation(prog, n)
  const uCover = u('uCover')
  const uRes = u('uRes')
  const uAspect = u('uAspect')
  const uTime = u('uTime')
  const uDpr = u('uDpr')
  gl.uniform1i(u('uImg'), 0)
  gl.uniform1i(u('uMask'), 1)

  function texture(unit: number, im: HTMLImageElement) {
    const t = gl!.createTexture()
    gl!.activeTexture(gl!.TEXTURE0 + unit)
    gl!.bindTexture(gl!.TEXTURE_2D, t)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, mips ? gl!.LINEAR_MIPMAP_LINEAR : gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, im)
    if (mips) gl!.generateMipmap(gl!.TEXTURE_2D)
  }

  let alive = true
  let ready = false
  let visible = true
  let raf = 0
  let aspect = o.aspect
  let elapsed = 0
  let last = 0

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl!.viewport(0, 0, w, h)
    const ar = w / h
    let sx = 1
    let sy = 1
    if (ar > aspect) sy = aspect / ar
    else sx = ar / aspect
    gl!.uniform4f(uCover, (1 - sx) * o.focus[0], (1 - sy) * o.focus[1], sx, sy)
    gl!.uniform2f(uRes, w, h)
    gl!.uniform1f(uDpr, dpr)
  }

  function draw() {
    gl!.uniform1f(uTime, elapsed)
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
  }

  function frame(now: number) {
    raf = 0
    if (!alive || !ready) return
    if (last) elapsed += Math.min(0.1, (now - last) / 1000)
    last = now
    draw()
    if (visible && !document.hidden && !o.reduced()) raf = requestAnimationFrame(frame)
  }

  function kick() {
    last = 0
    if (!ready || raf) return
    if (o.reduced()) {
      elapsed = 12
      draw()
      return
    }
    raf = requestAnimationFrame(frame)
  }

  const ro = new ResizeObserver(() => {
    if (!ready) return
    resize()
    draw()
  })
  ro.observe(canvas)
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) kick()
  })
  io.observe(canvas)
  const onVis = () => !document.hidden && kick()
  document.addEventListener('visibilitychange', onVis)
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', kick)
  const onLost = (e: Event) => {
    e.preventDefault()
    ready = false
    o.onlost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const dpr = Math.min(devicePixelRatio || 1, 2)
  const ar = canvas.clientWidth / Math.max(1, canvas.clientHeight)
  const need = (canvas.clientWidth * dpr) / (ar > aspect ? 1 : ar / aspect)
  const pick = o.sources.find((s) => s.width >= need * 0.9) ?? o.sources[o.sources.length - 1]

  Promise.all([load(pick.src), load(o.mask)])
    .then(([im, mk]) => {
      if (!alive) return
      aspect = im.naturalWidth / im.naturalHeight
      gl.uniform1f(uAspect, aspect)
      texture(0, im)
      texture(1, mk)
      ready = true
      resize()
      if (o.reduced()) elapsed = 12
      draw()
      o.onready?.()
      kick()
    })
    .catch((e) => console.warn('hero textures failed', e))

  return () => {
    alive = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    motion.removeEventListener('change', kick)
    canvas.removeEventListener('webglcontextlost', onLost)
  }
}
