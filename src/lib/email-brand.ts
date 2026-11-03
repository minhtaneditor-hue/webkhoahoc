// Logo + wordmark that opens every email the site sends. Absolute URL: email clients cannot load relative images.
const LOGO = 'https://www.minhtanacademy.com/brand/tan-va-mark.png';

export const emailBrand = (dark = false) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px;">
    <tr>
      <td style="vertical-align: middle; padding-right: 12px;"><img src="${LOGO}" alt="TẤN VA" width="48" height="44" style="display: block; border: 0;"></td>
      <td style="vertical-align: middle; font-family: Arial, sans-serif;">
        <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.1;"><span style="color: ${dark ? '#f5f5f5' : '#242321'};">TẤN</span> <span style="color: #A84E3C;">VA</span></div>
        <div style="font-size: 11px; font-weight: 700; color: ${dark ? '#999' : '#78716C'}; letter-spacing: 0.08em;">MINH TẤN VIDEO ADVISOR</div>
      </td>
    </tr>
  </table>`;
