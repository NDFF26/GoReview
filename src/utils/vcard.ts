import { BusinessUser } from '../types/user';

export function generateVCard(user: BusinessUser): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${user.businessName}`,
    `ORG:${user.businessName};${user.tagline || ''}`,
    `TITLE:${user.tagline || 'Business Contact'}`,
    `TEL;TYPE=CELL,VOICE:${user.phone}`,
    `TEL;TYPE=WORK,MSG:${user.whatsapp || user.phone}`,
    `EMAIL;TYPE=INTERNET,PREF:${user.email}`,
    `ADR;TYPE=WORK:;;${user.address.replace(/,/g, '\\,')};;;;`,
    user.website ? `URL:${user.website}` : '',
    `NOTE:${user.description.replace(/\n/g, ' ')}`,
    'END:VCARD'
  ]
    .filter(Boolean)
    .join('\n');

  return vcard;
}

export function downloadVCard(user: BusinessUser): void {
  const vcardString = generateVCard(user);
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${user.username}_contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
