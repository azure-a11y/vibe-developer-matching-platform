const dialog = document.querySelector('#project-modal');
document.querySelectorAll('.project').forEach((project) => {
  project.addEventListener('click', () => {
    document.querySelector('#modal-meta').textContent = `${project.dataset.builder} 빌더 · ${project.dataset.date} · ${project.dataset.field}`;
    document.querySelector('#modal-title').textContent = project.dataset.project;
    document.querySelector('#modal-copy').textContent = project.dataset.summary;
    dialog.showModal();
  });
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelectorAll('.course-list button').forEach((button, index) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.course-list button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const title = button.dataset.title;
    document.querySelector('#video-title').textContent = title;
    document.querySelector('#pdf-title').textContent = `${String(index + 1).padStart(2, '0')} · ${title}`;
    document.querySelector('#pdf-no').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('#pdf-copy').textContent = button.dataset.copy;
  });
});
