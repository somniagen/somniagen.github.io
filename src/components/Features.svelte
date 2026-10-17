<script lang="ts">
  import { Surface } from '$lib/ui'
  import { features } from '../site'
</script>

<section class="features" aria-labelledby="features-title">
  <h2 id="features-title">Everything built in</h2>
  <p class="lead">No extensions to hunt down. It all ships in the box and runs on your own GPU.</p>
  <div class="grid">
    {#each features as f (f.title)}
      <Surface class="feature" padding="var(--sp-4)">
        <span class="icon" aria-hidden="true">{f.icon}</span>
        <h3>{f.title}</h3>
        <p>{f.text}</p>
      </Surface>
    {/each}
  </div>
</section>

<style>
  .features {
    max-width: 1120px;
    margin: 0 auto;
    padding: var(--sp-6) var(--sp-5);
  }
  h2 {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-xl);
    font-weight: 600;
  }
  .lead {
    margin: 0 0 var(--sp-5);
    color: var(--text-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--sp-3);
  }
  .grid :global(.feature) {
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease);
  }
  .grid :global(.feature:hover) {
    background: var(--grad-2);
    border-color: var(--focus-line);
  }
  .icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    margin-bottom: var(--sp-3);
    border-radius: var(--r-md);
    background: var(--grad-3);
    box-shadow: var(--sheen), var(--shadow-1);
    color: var(--text);
  }
  h3 {
    margin: 0 0 var(--sp-1);
    font-size: var(--fs-md);
    font-weight: 600;
  }
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  @media (max-width: 720px) {
    .features {
      padding: var(--sp-5) var(--sp-4);
    }
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--sp-2);
    }
  }
</style>
