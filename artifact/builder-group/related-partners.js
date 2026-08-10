const relatedPartners = [
  { name: '\uB611\uB611\uD55C\uAC1C\uBC1C\uC790', url: 'https://brunch.co.kr/@@eexi/17', mark: 'DD', className: 'partner-dd' },
  { name: '\uD06C\uBABD', url: 'https://kmong.com/', mark: 'kmong', className: 'partner-kmong' }
];

document.querySelectorAll('.related a').forEach((link, index) => {
  const partner = relatedPartners[index];
  if (!partner) return;
  link.href = partner.url;
  link.querySelector('strong').textContent = partner.name;
  link.querySelector('.site-logo')?.remove();
  const mark = document.createElement('span');
  mark.className = `partner-mark ${partner.className}`;
  mark.textContent = partner.mark;
  mark.setAttribute('aria-hidden', 'true');
  link.prepend(mark);
});
