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
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase Config
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
const auth = getAuth();

let currentUID = null;
let currentSearch = "";

const subjects = ['Maths', 'Chemistry', 'Physics'];
const subjectContent = document.getElementById('subjectContent');
const toastContainer = document.getElementById('toast-container');
const searchInput = document.getElementById('searchInput');

// Auth
signInAnonymously(auth).catch(console.error);
onAuthStateChanged(auth, user => {
  if (user) {
    currentUID = user.uid;
    initUI();
  }
});

// Dark Mode
document.getElementById('darkToggle').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Toast
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Search Input
searchInput?.addEventListener("input", e => {
  currentSearch = e.target.value.toLowerCase();
  const activeTab = document.querySelector(".tab.active");
  if (activeTab) renderSubject(activeTab.dataset.subject);
});

// Tab Logic
function initUI() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSubject(tab.dataset.subject);
    };
  });
  renderSubject('Maths'); // default
}

// Render Subject
function renderSubject(subject) {
  subjectContent.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>${subject}</h2>`;
  subjectContent.appendChild(card);

  const chapterInput = document.createElement('input');
  chapterInput.placeholder = 'Enter Chapter Name';
  card.appendChild(chapterInput);

  const addBtn = document.createElement('button');
  addBtn.innerText = '➕ Add Chapter';
  addBtn.onclick = () => {
    if (chapterInput.value.trim()) {
      renderChapterUI(subject, chapterInput.value.trim(), card);
      chapterInput.value = '';
    }
  };
  card.appendChild(addBtn);

  const q = query(collection(db, 'homeworks'), where('subject', '==', subject));
  onSnapshot(q, snapshot => {
    const chapters = {};
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!chapters[data.chapter]) chapters[data.chapter] = [];
      chapters[data.chapter].push({ ...data, id: docSnap.id });
    });

    card.querySelectorAll('.chapter-section').forEach(el => el.remove());

    for (const chapter in chapters) {
      renderChapterUI(subject, chapter, card, chapters[chapter]);
    }
  });
}

// Render Chapter
function renderChapterUI(subject, chapter, container, homeworkList = []) {
  const section = document.createElement('div');
  section.className = 'chapter-section';

  const filteredList = homeworkList.filter(hw => {
    return (
      chapter.toLowerCase().includes(currentSearch) ||
      hw.text.toLowerCase().includes(currentSearch) ||
      (hw.date || '').toLowerCase().includes(currentSearch)
    );
  });

  if (filteredList.length === 0 && homeworkList.length > 0) return;

  section.innerHTML = `<h3>${chapter}</h3>`;
  container.appendChild(section);

  const hwInput = document.createElement('input');
  hwInput.placeholder = 'Homework...';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';

  const uploadBtn = document.createElement('label');
  uploadBtn.className = 'upload-btn';
  uploadBtn.innerText = '📷 Upload Image';
  uploadBtn.appendChild(fileInput);

  const addBtn = document.createElement('button');
  addBtn.innerText = '✅ Add Homework';

  const list = document.createElement('ul');
  list.className = 'homework-list';

  addBtn.onclick = async () => {
    const text = hwInput.value.trim();
    const date = dateInput.value;
    const file = fileInput.files[0];
    if (!text) return;

    const push = async (img = null) => {
      await addDoc(collection(db, 'homeworks'), {
        subject,
        chapter,
        text,
        date,
        image: img,
        uid: currentUID,
        created: Date.now()
      });
      showToast('Homework added ✅');
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => push(reader.result);
      reader.readAsDataURL(file);
    } else {
      push();
    }

    hwInput.value = '';
    dateInput.value = '';
    fileInput.value = '';
  };

  section.appendChild(hwInput);
  section.appendChild(dateInput);
  section.appendChild(uploadBtn);
  section.appendChild(addBtn);
  section.appendChild(list);

  filteredList.forEach(hw => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${hw.text}</strong>`;
    if (hw.date) li.innerHTML += `<br><small>📅 ${hw.date}</small>`;
    if (hw.image) {
      const img = document.createElement('img');
      img.src = hw.image;
      img.className = 'thumb';
      li.appendChild(img);
    }

    if (hw.uid === currentUID) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.innerText = '🗑 Delete';
      delBtn.onclick = async () => {
        await deleteDoc(doc(db, 'homeworks', hw.id));
        showToast('Homework deleted 🗑');
      };
      li.appendChild(delBtn);
    }

    list.appendChild(li);
  });
}
