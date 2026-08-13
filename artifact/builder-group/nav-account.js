const accountRoles = {
  admin: {label: '관리자', avatar: '관'},
  builder: {label: '송인선 빌더', avatar: '송'},
};

const accountToggle = document.querySelector('.nav-account-toggle');
const accountMenu = document.querySelector('.nav-account-menu');
const accountAvatar = document.querySelector('.nav-account-avatar');
const accountLabel = document.querySelector('.nav-account-label');

function setAccountRole(role) {
  const data = accountRoles[role];
  if (!data) return;
  accountAvatar.textContent = data.avatar;
  accountLabel.textContent = data.label;
  accountToggle.dataset.role = role;
  accountMenu.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.role === role);
  });
}

function closeAccountMenu() {
  accountMenu.hidden = true;
  accountToggle.setAttribute('aria-expanded', 'false');
}

setAccountRole('admin');

accountToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  const willOpen = accountMenu.hidden;
  accountMenu.hidden = !willOpen;
  accountToggle.setAttribute('aria-expanded', String(willOpen));
});

accountMenu.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    setAccountRole(button.dataset.role);
    closeAccountMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!accountMenu.hidden && !event.target.closest('.nav-account')) closeAccountMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAccountMenu();
});
