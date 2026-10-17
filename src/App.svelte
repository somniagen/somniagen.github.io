<script lang="ts">
  import { Toaster } from '$lib/ui'
  import Hero from './components/Hero.svelte'
  import Features from './components/Features.svelte'
  import QuickStart from './components/QuickStart.svelte'
  import Footer from './components/Footer.svelte'
</script>

<main>
  <Hero />
  <Features />
  <QuickStart />
</main>
<Footer />
<Toaster />

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }
  }
</style>
