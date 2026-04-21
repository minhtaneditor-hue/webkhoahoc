/**
 * tVNDRM Security SDK [ENTERPRISE EDITION]
 * © 2026 tVNDRM Technology Labs. All rights reserved.
 */

interface SecurityConfig {
  blockRightClick?: boolean;
  blockDevTools?: boolean;
  alertOnViolation?: boolean;
  violationMessage?: string;
}

class SecuritySDK {
  private config: Required<SecurityConfig>;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      blockRightClick: true,
      blockDevTools: true,
      alertOnViolation: true,
      violationMessage: 'Security Alert: Recording or unauthorized access detected.',
      ...config,
    };
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  async getFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return '';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'DP-NO-CTX';

    const txt = 'DRM-PRO-SECURE-ID';
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);

    const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
    const bin = atob(b64);
    const crc = this.bin2hex(bin.slice(-16, -12));

    let webgl = '';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webgl = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {}

    return `DP-${crc}-${this.bin2hex(webgl.slice(0, 8))}`;
  }

  private bin2hex(s: string): string {
    let out = "";
    for (let i = 0, l = s.length; i < l; i++) {
      let c = s.charCodeAt(i).toString(16);
      if (c.length < 2) c = '0' + c;
      out += c;
    }
    return out;
  }

  init() {
    if (this.config.blockRightClick) {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    if (this.config.blockDevTools) {
      setInterval(() => {
        const startTime = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const endTime = performance.now();
        if (endTime - startTime > 100) {
          this.triggerViolation('devtools_detected');
        }
      }, 1000);

      document.addEventListener('keydown', (e) => this.handleShortcuts(e));
    }
  }

  private handleShortcuts(e: KeyboardEvent) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      this.triggerViolation('shortcut_violation');
    }
  }

  private triggerViolation(type: string) {
    if (this.config.alertOnViolation) {
      alert(this.config.violationMessage);
    }
  }

  onSecurityAlert(callback: (type: string) => void) {
    if (typeof window === 'undefined') return;
    window.addEventListener('blur', () => callback('focus_lost'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') callback('tab_hidden');
    });
  }

  lockElement(element: HTMLElement) {
    if (!element) return;
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    (element.style as any).webkitTouchCallout = 'none';

    if (element.parentElement) {
      const shield = document.createElement('div');
      shield.style.position = 'absolute';
      shield.style.inset = '0';
      shield.style.zIndex = '100';
      shield.style.backgroundColor = 'transparent';
      shield.oncontextmenu = (e) => e.preventDefault();
      element.parentElement.appendChild(shield);
    }
  }
}

export default SecuritySDK;
