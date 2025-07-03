// script.js
const subjects = ['Maths', 'Chemistry', 'Physics'];
const container = document.getElementById('subjectsContainer');
const toastContainer = document.getElementById('toast-container');

const data = JSON.parse(localStorage.getItem('homeworkData')) || {};

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function saveData() {
  localStorage.setItem('homeworkData', JSON.stringify(data));
}

function createSubjectCard(subject) {
  const card = document.createElement('div');
  card.className = 'subject';

  const title = document.createElement('h2');
  title.innerText = subject;
  card.appendChild(title);

  const chapterInput = document.createElement('input');
  chapterInput.placeholder = 'Enter chapter name';
  card.appendChild(chapterInput);

  const addChapterBtn = document.createElement('button');
  addChapterBtn.innerText = 'Add Chapter';
  addChapterBtn.onclick = () => {
    const name = chapterInput.value.trim();
    if (!name) return;
    if (!data[subject]) data[subject] = {};
    if (!data[subject][name]) data[subject][name] = [];
    chapterInput.value = '';
    saveData();
    render();
    showToast(`📘 Chapter added to ${subject}`);
  };
  card.appendChild(addChapterBtn);

  const chapters = data[subject] || {};
  Object.keys(chapters).forEach((chapter) => {
    const chDiv = document.createElement('div');
    chDiv.className = 'chapter';

    const chHeader = document.createElement('div');
    chHeader.innerHTML = `<strong>${chapter}</strong>`;

    const delBtn = document.createElement('button');
    delBtn.innerText = '🗑';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => {
      delete data[subject][chapter];
      saveData();
      render();
      showToast(`❌ Chapter deleted`);
    };
    chHeader.appendChild(delBtn);
    chDiv.appendChild(chHeader);

    const hwList = document.createElement('ul');
    hwList.className = 'homework';

    data[subject][chapter].forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `${item.text}<br>${item.date ? `<small>📅 ${item.date}</small>` : ''}`;
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.className = 'thumb';
        li.appendChild(img);
      }

      const dBtn = document.createElement('button');
      dBtn.innerText = '🗑';
      dBtn.className = 'delete-btn';
      dBtn.onclick = () => {
        data[subject][chapter].splice(i, 1);
        saveData();
        render();
        showToast(`📝 Homework deleted`);
      };
      li.appendChild(dBtn);

      hwList.appendChild(li);
    });

    chDiv.appendChild(hwList);

    const hwInput = document.createElement('input');
    hwInput.placeholder = 'Homework text';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'date-picker';

    const hwImgInput = document.createElement('input');
    hwImgInput.type = 'file';
    hwImgInput.accept = 'image/*';
    hwImgInput.style.display = 'none';

    const imageLabel = document.createElement('label');
    imageLabel.className = 'upload-btn';
    imageLabel.innerText = '📷 Upload Image';
    imageLabel.appendChild(hwImgInput);

    const hwBtn = document.createElement('button');
    hwBtn.innerText = 'Add Homework';
    hwBtn.onclick = () => {
      const text = hwInput.value.trim();
      const date = dateInput.value;
      if (!text) return;

      const reader = new FileReader();
      const imgFile = hwImgInput.files[0];

      const pushAndRender = (imgData = null) => {
        data[subject][chapter].push({ text, image: imgData, date });
        saveData();
        render();
        showToast(`✅ Homework added`);
      };

      if (imgFile) {
        reader.onloadend = () => pushAndRender(reader.result);
        reader.readAsDataURL(imgFile);
      } else {
        pushAndRender();
      }

      hwInput.value = '';
      hwImgInput.value = '';
      dateInput.value = '';
    };

    chDiv.appendChild(hwInput);
    chDiv.appendChild(dateInput);
    chDiv.appendChild(imageLabel);
    chDiv.appendChild(hwBtn);

    card.appendChild(chDiv);
  });

  container.appendChild(card);
}

function render() {
  container.innerHTML = '';
  subjects.forEach(createSubjectCard);
}

function initDarkMode() {
  const prefersDark = localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark', prefersDark);
}

document.getElementById('darkToggle').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

initDarkMode();
render();
