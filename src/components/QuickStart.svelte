<script lang="ts">
  import { IconButton, Segmented, Surface, toast } from '$lib/ui'

  type Os = 'windows' | 'linux' | 'mac'

  const tabs = [
    { value: 'windows' as Os, label: 'Windows', icon: 'desktop_windows' },
    { value: 'linux' as Os, label: 'Linux', icon: 'terminal' },
    { value: 'mac' as Os, label: 'macOS', icon: 'laptop_mac' },
  ]

  const clone = ['git clone https://github.com/somniagen/somnia/', 'cd somnia']
  const commands: Record<Os, string[]> = {
    windows: [...clone, './install.bat', './run.bat'],
    linux: [...clone, './install.sh', './run.sh'],
    mac: [...clone, './install.sh', './run.sh'],
  }
  const shells: Record<Os, string> = { windows: 'PowerShell', linux: 'Terminal', mac: 'Terminal' }

  function detect(): Os {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
    const p = (nav.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase()
    if (p.includes('win')) return 'windows'
    if (p.includes('mac') || /iphone|ipad/.test(navigator.userAgent.toLowerCase())) return 'mac'
    return 'linux'
  }

  let os = $state<Os>(detect())
  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  // execCommand covers insecure origins and browsers that deny the async clipboard
  function legacyCopy(text: string) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    if (!ok) throw new Error('copy failed')
  }

  async function copy() {
    const text = commands[os].join('\n')
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text).catch(() => legacyCopy(text))
      else legacyCopy(text)
      copied = true
      clearTimeout(timer)
      timer = setTimeout(() => (copied = false), 1600)
      toast.success('Commands copied')
    } catch {
      toast.error('Could not copy', { description: 'Select the commands and copy them by hand.' })
    }
  }
</script>

<section id="start" class="start" aria-labelledby="start-title">
  <h2 id="start-title">Quick start</h2>
  <p class="lead">Needs git and an NVIDIA GPU with about 12 GB of VRAM.</p>

  <Segmented items={tabs} bind:value={os} label="Operating system" class="os" />

  <Surface class="term" padding="0">
    <div class="bar">
      <span class="icon" aria-hidden="true">terminal</span>
      <span>{shells[os]}</span>
      <IconButton
        icon={copied ? 'check' : 'content_copy'}
        label={copied ? 'Copied' : 'Copy commands'}
        size="sm"
        class={copied ? 'ok' : ''}
        onclick={copy}
      />
    </div>
    <pre><code>{#each commands[os] as line (line)}<span class="line">{line}</span>{'\n'}{/each}</code></pre>
  </Surface>

  {#if os === 'mac'}
    <p class="note"><span class="icon" aria-hidden="true">warning</span><span>macOS is not officially supported yet. Somnia is built for NVIDIA GPUs.</span></p>
  {/if}
  <p class="after">
    <span class="icon" aria-hidden="true">open_in_browser</span>
    <span>Opens at <code>http://127.0.0.1:7865</code>. Put checkpoints in <code>./models</code> or point it at your ComfyUI models folder.</span>
  </p>
</section>

<style>
  .start {
    max-width: 1120px;
    margin: 0 auto;
    padding: var(--sp-6) var(--sp-5);
    scroll-margin-top: var(--sp-5);
  }
  h2 {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-xl);
    font-weight: 600;
  }
  .lead {
    margin: 0 0 var(--sp-4);
    color: var(--text-muted);
  }
  .start :global(.os) {
    margin-bottom: var(--sp-3);
  }
  .start :global(.term) {
    max-width: 720px;
    overflow: hidden;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    padding: var(--sp-1) var(--sp-1) var(--sp-1) var(--sp-3);
    border-bottom: 1px solid var(--hairline);
    background: var(--grad-2);
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  .bar .icon {
    font-size: 18px;
  }
  .bar :global(.ib) {
    margin-left: auto;
  }
  .bar :global(.ok),
  .bar :global(.ok:hover) {
    color: var(--success);
  }
  pre {
    margin: 0;
    padding: var(--sp-4);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--fs-sm);
    line-height: 1.8;
  }
  .line::before {
    content: '>';
    margin-right: var(--sp-3);
    color: var(--text-faint);
    user-select: none;
  }
  .note,
  .after {
    display: flex;
    align-items: flex-start;
    gap: var(--sp-2);
    max-width: 720px;
    margin: var(--sp-3) 0 0;
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  .note .icon,
  .after .icon {
    flex: none;
    font-size: 18px;
  }
  .note .icon {
    color: var(--warning);
  }
  .after code {
    padding: 1px 5px;
    border-radius: var(--r-sm);
    background: var(--surface-3);
    font-family: var(--font-mono);
    font-size: 0.95em;
    color: var(--text);
  }
  @media (max-width: 720px) {
    .start {
      padding: var(--sp-5) var(--sp-4);
    }
    .start :global(.os) {
      display: flex;
    }
    .start :global(.os button) {
      flex: 1;
    }
  }
</style>
