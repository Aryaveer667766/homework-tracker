const subjects = ["Maths", "Chemistry", "Physics"];
const data = JSON.parse(localStorage.getItem("homeworkData")) || {};
const subjectsContainer = document.getElementById("subjectsContainer");

function saveData() {
  localStorage.setItem("homeworkData", JSON.stringify(data));
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
    chapterDiv.appendChild(chapterTitle);

    const ul = document.createElement("ul");
    ul.className = "homework";
    chapters[chapter].forEach(hw => {
      const li = document.createElement("li");
      li.innerHTML = hw.text;
      if (hw.image) {
        const img = document.createElement("img");
        img.src = hw.image;
        img.className = "thumb";
        li.appendChild(img);
      }
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
      };
      const file = imgInput.files[0];
      if (file) {
        reader.readAsDataURL(file);
      } else {
        data[subject][chapter].push({ text: hwText });
        saveData();
        renderChapters(subject);
      }
    };

    chapterDiv.appendChild(hwInput);
    chapterDiv.appendChild(imgInput);
    chapterDiv.appendChild(addHwBtn);

    chapterList.appendChild(chapterDiv);
  }
}

subjects.forEach(createSubjectCard);

// Dark Mode Toggle
const toggle = document.getElementById("darkToggle");
toggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
