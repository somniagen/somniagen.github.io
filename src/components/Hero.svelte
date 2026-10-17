<script lang="ts">
  import { Button } from '$lib/ui'
  import { startHero } from '$lib/hero-gl'
  import banner from '../assets/banner.webp'
  import bannerSmall from '../assets/banner-1600.webp'
  import mask from '../assets/mask.png'
  import Logo from './Logo.svelte'
  import GitHubMark from './GitHubMark.svelte'
  import { REPO } from '../site'

  let canvas: HTMLCanvasElement
  let live = $state(false)

  $effect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    return startHero(canvas, {
      sources: [
        { src: bannerSmall, width: 1600 },
        { src: banner, width: 2915 },
      ],
      aspect: 2915 / 1536,
      mask,
      focus: [0.62, 0.3],
      reduced: () => motion.matches,
      onready: () => (live = true),
      onlost: () => (live = false),
    })
  })
</script>

<section class="hero">
  <div class="art">
    <img
      src={bannerSmall}
      srcset="{bannerSmall} 1600w, {banner} 2915w"
      sizes="(max-width: 720px) 135vw, 106vw"
      alt="A girl with long white hair that dissolves into a galaxy"
      fetchpriority="high"
    />
    <canvas bind:this={canvas} class:live aria-hidden="true"></canvas>
    <div class="fade"></div>
  </div>
  <div class="copy">
    <h1><Logo size={44} /> Somnia</h1>
    <p>A local image generation studio for Illustrious and Anima. Great results with the default settings, a smart inpainter, and a UI that works just as well on your phone.</p>
    <div class="cta">
      <Button variant="primary" icon="download" href="#start">Get started</Button>
      <Button href={REPO} target="_blank" rel="noopener">
        <span class="gh"><GitHubMark /> GitHub</span>
      </Button>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    height: min(100svh, 56vw);
    min-height: 520px;
    overflow: hidden;
  }
  .art,
  img,
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  img {
    object-fit: cover;
    object-position: 62% 30%;
  }
  canvas {
    display: block;
    opacity: 0;
    transition: opacity 400ms var(--ease);
  }
  canvas.live {
    opacity: 1;
  }
  .fade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(0deg, var(--bg) 0%, var(--overlay) 30%, transparent 55%),
      linear-gradient(90deg, var(--scrim) 0%, transparent 50%);
    pointer-events: none;
  }
  .copy {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 var(--sp-5) clamp(var(--sp-6), 6vw, 72px);
  }
  h1 {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    margin: 0 0 var(--sp-3);
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  p {
    max-width: 30em;
    margin: 0 0 var(--sp-5);
    color: var(--text-muted);
    font-size: var(--fs-lg);
    line-height: 1.5;
    text-shadow: 0 1px 12px var(--bg);
  }
  h1 {
    text-shadow: 0 2px 24px var(--bg);
  }
  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
  }
  .cta :global(.btn) {
    --h: 42px;
    padding: 0 18px;
  }
  .gh {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
  }

  @media (max-width: 720px) {
    .hero {
      height: auto;
      min-height: 0;
    }
    .art {
      position: relative;
      height: 68vw;
      min-height: 260px;
    }
    .fade {
      background: linear-gradient(0deg, var(--bg) 0%, transparent 30%);
    }
    .copy {
      position: relative;
      margin-top: calc(-1 * var(--sp-5));
      padding: 0 var(--sp-4) var(--sp-6);
    }
    p {
      font-size: var(--fs-md);
    }
    .cta :global(.btn) {
      flex: 1;
    }
  }
</style>
