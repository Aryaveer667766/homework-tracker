import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRwSrbSvrFAW5dTyQN0BoRHS3_6iLrV_E",
  authDomain: "homeworkbrothers-12345.firebaseapp.com",
  projectId: "homeworkbrothers-12345",
  storageBucket: "homeworkbrothers-12345.firebasestorage.app",
  messagingSenderId: "77683184454",
  appId: "1:77683184454:web:9b0bc1e8e5028943a3cb47",
  measurementId: "G-21XLQGRZJ0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const subjects = ['Maths', 'Chemistry', 'Physics'];
const container = document.getElementById('subjectsContainer');
const toastContainer = document.getElementById('toast-container');

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderSubject(subject) {
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
  addChapterBtn.onclick = () => renderChapter(subject, chapterInput.value.trim(), card);
  card.appendChild(addChapterBtn);

  container.appendChild(card);

  const q = query(collection(db, 'homeworks'), where('subject', '==', subject));
  onSnapshot(q, (snapshot) => {
    card.querySelectorAll('.chapter').forEach(c => c.remove());
    const chapters = {};
    snapshot.forEach(doc => {
      const hw = doc.data();
      if (!chapters[hw.chapter]) chapters[hw.chapter] = [];
      chapters[hw.chapter].push({ ...hw, id: doc.id });
    });
    for (const chName in chapters) {
      renderChapter(subject, chName, card, chapters[chName]);
    }
  });
}

async function renderChapter(subject, chapter, card, homeworkList = []) {
  if (!chapter) return;
  const chDiv = document.createElement('div');
  chDiv.className = 'chapter';

  const chHeader = document.createElement('div');
  chHeader.innerHTML = `<strong>${chapter}</strong>`;
  chDiv.appendChild(chHeader);

  const hwList = document.createElement('ul');
  hwList.className = 'homework';

  homeworkList.forEach(hw => {
    const li = document.createElement('li');
    li.innerHTML = `${hw.text}`;
    if (hw.date) li.innerHTML += `<br><small>📅 ${hw.date}</small>`;
    if (hw.image) {
      const img = document.createElement('img');
      img.src = hw.image;
      img.className = 'thumb';
      li.appendChild(img);
    }
    const dBtn = document.createElement('button');
    dBtn.innerText = '🗑';
    dBtn.className = 'delete-btn';
    dBtn.onclick = async () => {
      await deleteDoc(doc(db, 'homeworks', hw.id));
      showToast('🗑 Homework deleted');
    };
    li.appendChild(dBtn);
    hwList.appendChild(li);
  });

  chDiv.appendChild(hwList);

  const hwInput = document.createElement('input');
  hwInput.placeholder = 'Homework text';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
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
  hwBtn.onclick = async () => {
    const text = hwInput.value.trim();
    const date = dateInput.value;
    if (!text) return;
    const imgFile = hwImgInput.files[0];

    const pushToFirebase = async (imgData = null) => {
      await addDoc(collection(db, 'homeworks'), {
        subject,
        chapter,
        text,
        date,
        image: imgData,
        created: Date.now()
      });
      showToast('✅ Homework added');
    };

    if (imgFile) {
      const reader = new FileReader();
      reader.onloadend = () => pushToFirebase(reader.result);
      reader.readAsDataURL(imgFile);
    } else {
      pushToFirebase();
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
subjects.forEach(renderSubject);
