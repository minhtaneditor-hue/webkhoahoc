/**
 * tVNDRM SecuritySDK (browser side, ported from DRM STACK/client/src/core/SecuritySDK.js).
 *
 * Client-side deterrents only. Real protection comes from the server (session-bound
 * playback tokens, key gating, risk engine); a determined screen recorder still needs
 * hardware DRM (Widevine L1 / FairPlay) to be blacked out.
 */
type Config = {
  blockRightClick: boolean;
  blockDevTools: boolean;
  onViolation: ((type: string) => void) | null;
};

export default class SecuritySDK {
  private config: Config;
  private cleanups: (() => void)[] = [];
  private lastViolation: Record<string, number> = {};

  constructor(config: Partial<Config> = {}) {
    this.config = { blockRightClick: true, blockDevTools: true, onViolation: null, ...config };
    this.init();
  }

  /** Stable per-browser id (canvas + WebGL + screen), used to count devices per account. */
  async getFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const txt = 'TANVA-SECURE-ID';
      ctx.textBaseline = 'alphabetic';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(txt, 4, 17);
    }
    let webgl = '';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      const info = gl?.getExtension('WEBGL_debug_renderer_info');
      if (gl && info) webgl = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    } catch { /* WebGL unavailable */ }

    const raw = [
      canvas.toDataURL(), webgl, navigator.userAgent, navigator.language,
      screen.width, screen.height, screen.colorDepth, navigator.hardwareConcurrency,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join('|');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return 'DP-' + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }

  private listen(target: EventTarget, event: string, handler: (e: any) => void, opts?: AddEventListenerOptions) {
    target.addEventListener(event, handler, opts);
    this.cleanups.push(() => target.removeEventListener(event, handler, opts));
  }

  private init() {
    if (this.config.blockRightClick) {
      this.listen(document, 'contextmenu', (e: Event) => e.preventDefault());
      this.listen(document, 'dragstart', (e: Event) => e.preventDefault());
    }

    if (this.config.blockDevTools) {
      // Debugger trap: only pauses when DevTools is open. Built with Function() so the
      // production minifier (which drops `debugger;`) keeps it.
      const pause = new Function('debugger');
      const trap = setInterval(() => {
        const start = performance.now();
        pause();
        if (performance.now() - start > 100) this.triggerViolation('devtools_detected');
        if (window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 200) {
          this.triggerViolation('devtools_docked');
        }
      }, 1000);
      this.cleanups.push(() => clearInterval(trap));
      this.listen(document, 'keydown', (e: KeyboardEvent) => this.handleShortcuts(e));
    }

    // PrintScreen cannot be blocked by browsers; clear the clipboard right after it
    this.listen(window, 'keyup', (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard?.writeText('').catch(() => {});
        this.triggerViolation('printscreen');
      }
    });

    // Same-page capture via getDisplayMedia (injected recorder scripts / extensions)
    const md = navigator.mediaDevices as (MediaDevices & { __tanvaWrapped?: boolean }) | undefined;
    if (md?.getDisplayMedia && !md.__tanvaWrapped) {
      const original = md.getDisplayMedia.bind(md);
      md.getDisplayMedia = (...args: Parameters<MediaDevices['getDisplayMedia']>) => {
        this.triggerViolation('display_capture_requested');
        return original(...args);
      };
      md.__tanvaWrapped = true;
    }
  }

  private handleShortcuts(e: KeyboardEvent) {
    const key = e.key?.toLowerCase();
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key)) ||
      ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(key))
    ) {
      e.preventDefault();
      this.triggerViolation('shortcut_violation');
    }
  }

  private triggerViolation(type: string) {
    // One report per type every 5 s
    const now = Date.now();
    if (now - (this.lastViolation[type] || 0) < 5000) return;
    this.lastViolation[type] = now;
    this.config.onViolation?.(type);
  }

  /** Focus / visibility changes (the player blacks out while the window is not in front). */
  onSecurityAlert(callback: (type: string) => void) {
    this.listen(window, 'blur', () => callback('focus_lost'));
    this.listen(window, 'focus', () => callback('focus_restored'));
    this.listen(document, 'visibilitychange', () => callback(document.visibilityState === 'hidden' ? 'tab_hidden' : 'tab_visible'));
  }

  lockElement(el: HTMLVideoElement | null) {
    if (!el) return;
    el.style.userSelect = 'none';
    el.style.setProperty('-webkit-touch-callout', 'none');
    el.setAttribute('controlsList', 'nodownload noremoteplayback');
    el.setAttribute('disablePictureInPicture', '');
    el.setAttribute('disableRemotePlayback', '');
    el.disablePictureInPicture = true;
    el.oncontextmenu = (e) => e.preventDefault();
  }

  destroy() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
