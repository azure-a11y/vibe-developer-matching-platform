const accountRoles = {
  admin: {chip: '관리자', avatar: '관'},
  builder: {chip: '송인선 빌더', avatar: '송'},
};

const accountToggle = document.querySelector('.nav-account-toggle');
const accountAvatar = document.querySelector('.nav-account-avatar');
const accountLabel = document.querySelector('.nav-account-label');

const loginDialog = document.createElement('dialog');
loginDialog.className = 'login-dialog';
loginDialog.innerHTML = `
  <div class="login-wrap">
    <button class="login-close" type="button" aria-label="로그인 닫기">×</button>
    <small>ACCOUNT LOGIN</small>
    <h2>로그인</h2>
    <div class="login-role" role="radiogroup" aria-label="로그인 유형">
      <button type="button" class="login-role-option is-active" data-role="admin" role="radio" aria-checked="true">관리자</button>
      <button type="button" class="login-role-option" data-role="builder" role="radio" aria-checked="false">빌더</button>
    </div>
    <form class="login-form">
      <div class="login-field"><label for="login-id">ID</label><input id="login-id" name="id" required placeholder="아이디" autocomplete="username" /></div>
      <div class="login-field"><label for="login-pw">PASSWORD</label><input id="login-pw" name="pw" type="password" required placeholder="비밀번호" autocomplete="current-password" /></div>
      <button type="submit">로그인</button>
    </form>
  </div>`;
document.body.append(loginDialog);

let selectedRole = 'admin';

function setAccountChip(role) {
  const data = accountRoles[role];
  if (!data) return;
  accountAvatar.textContent = data.avatar;
  accountLabel.textContent = data.chip;
  accountToggle.dataset.role = role;
}

setAccountChip('admin');

accountToggle.addEventListener('click', () => {
  loginDialog.querySelector('#login-id').value = '';
  loginDialog.querySelector('#login-pw').value = '';
  loginDialog.showModal();
});

loginDialog.querySelectorAll('.login-role-option').forEach((option) => {
  option.addEventListener('click', () => {
    selectedRole = option.dataset.role;
    loginDialog.querySelectorAll('.login-role-option').forEach((item) => {
      item.classList.toggle('is-active', item === option);
      item.setAttribute('aria-checked', String(item === option));
    });
  });
});

loginDialog.querySelector('.login-close').addEventListener('click', () => loginDialog.close());
loginDialog.addEventListener('click', (event) => { if (event.target === loginDialog) loginDialog.close(); });

loginDialog.querySelector('.login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  // Front-end only demo: any non-empty ID/password "logs in" as the selected role.
  setAccountChip(selectedRole);
  loginDialog.close();
});
