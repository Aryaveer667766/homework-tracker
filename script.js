const subjects = ["Maths", "Chemistry", "Physics"];
const data = JSON.parse(localStorage.getItem("homeworkData")) || {};
const subjectsContainer = document.getElementById("subjectsContainer");

function saveData() {
  localStorage.setItem("homeworkData", JSON.stringify(data));
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createSubjectCard(subject) {
  const container = document.createElement("div");
  container.className = "subject";

  const title = document.createElement("h2");
  title.textContent = subject;
  container.appendChild(title);

  const chapterList = document.createElement("div");
  chapterList.id = `chapter-list-${subject}`;
  container.appendChild(chapterList);

  const chapterInput = document.createElement("input");
  chapterInput.placeholder = "Chapter Name";

  const addChapterBtn = document.createElement("button");
  addChapterBtn.textContent = "Add Chapter";
  addChapterBtn.onclick = () => {
    const chapterName = chapterInput.value.trim();
    if (!chapterName) return;
    if (!data[subject]) data[subject] = {};
    if (!data[subject][chapterName]) {
      data[subject][chapterName] = [];
      saveData();
      renderChapters(subject);
      showToast(`📘 Chapter "${chapterName}" added`);
    }
    chapterInput.value = "";
  };

  container.appendChild(chapterInput);
  container.appendChild(addChapterBtn);

  subjectsContainer.appendChild(container);
  renderChapters(subject);
}

function renderChapters(subject) {
  const chapterList = document.getElementById(`chapter-list-${subject}`);
  chapterList.innerHTML = "";

  const chapters = data[subject] || {};
  for (let chapter in chapters) {
    const chapterDiv = document.createElement("div");
    chapterDiv.className = "chapter";

    const chapterTitle = document.createElement("strong");
    chapterTitle.textContent = chapter;

    const delChapterBtn = document.createElement("button");
    delChapterBtn.className = "delete-btn";
    delChapterBtn.textContent = "🗑️ Delete Chapter";
    delChapterBtn.onclick = () => {
      if (confirm(`Delete chapter "${chapter}"?`)) {
        delete data[subject][chapter];
        saveData();
        renderChapters(subject);
        showToast(`❌ Chapter "${chapter}" deleted`);
      }
    };

    chapterDiv.appendChild(chapterTitle);
    chapterDiv.appendChild(delChapterBtn);

    const ul = document.createElement("ul");
    ul.className = "homework";
    chapters[chapter].forEach((hw, idx) => {
      const li = document.createElement("li");
      li.innerHTML = hw.text;
      if (hw.image) {
        const img = document.createElement("img");
        img.src = hw.image;
        img.className = "thumb";
        li.appendChild(img);
      }

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => {
        data[subject][chapter].splice(idx, 1);
        saveData();
        renderChapters(subject);
        showToast(`🗑️ Homework deleted`);
      };

      li.appendChild(delBtn);
      ul.appendChild(li);
    });
    chapterDiv.appendChild(ul);

    const hwInput = document.createElement("input");
    hwInput.placeholder = "Homework";

    const imgInput = document.createElement("input");
    imgInput.type = "file";
    imgInput.accept = "image/*";

    const addHwBtn = document.createElement("button");
    addHwBtn.textContent = "Add";
    addHwBtn.onclick = () => {
      const hwText = hwInput.value.trim();
      if (!hwText) return;
      const reader = new FileReader();
      reader.onload = () => {
        const hwObj = { text: hwText, image: reader.result };
        data[subject][chapter].push(hwObj);
        saveData();
        renderChapters(subject);
        showToast(`✅ Homework added`);
      };
      const file = imgInput.files[0];
      if (file) {
        reader.readAsDataURL(file);
      } else {
        data[subject][chapter].push({ text: hwText });
        saveData();
        renderChapters(subject);
        showToast(`✅ Homework added`);
      }
      hwInput.value = "";
      imgInput.value = "";
    };

    chapterDiv.appendChild(hwInput);
    chapterDiv.appendChild(imgInput);
    chapterDiv.appendChild(addHwBtn);

    chapterList.appendChild(chapterDiv);
  }
}

subjects.forEach(createSubjectCard);

// 🌙 Dark Mode
const toggle = document.getElementById("darkToggle");
toggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  document.body.classList.toggle("dark", storedTheme === "dark");
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark");
}
