<script lang="ts">
  import Logo from './Logo.svelte'
  import GitHubMark from './GitHubMark.svelte'
  import { REPO } from '../site'
</script>

<footer>
  <div class="inner">
    <Logo size={24} wordmark />
    <a href={REPO} target="_blank" rel="noopener"><GitHubMark size={16} /> somniagen/somnia</a>
  </div>
</footer>

<style>
  footer {
    margin-top: var(--sp-6);
    border-top: 1px solid var(--hairline);
    background: var(--grad-1);
  }
  .inner {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    max-width: 1120px;
    margin: 0 auto;
    padding: var(--sp-5) var(--sp-5) calc(var(--sp-5) + env(safe-area-inset-bottom));
  }
  a {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    margin-left: auto;
    padding: 6px 10px;
    border-radius: var(--r-md);
    color: var(--text-muted);
    font-size: var(--fs-sm);
    text-decoration: none;
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  a:hover {
    background: var(--hover);
    color: var(--text);
  }
  @media (max-width: 480px) {
    .inner {
      flex-wrap: wrap;
      padding-left: var(--sp-4);
      padding-right: var(--sp-4);
    }
  }
</style>
