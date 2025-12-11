# To-Do App

A simple and clean To‑Do List application built using **HTML**, **CSS**, and **JavaScript**. The app allows users to add, delete, filter, and store tasks using **localStorage**, ensuring data persists even after refreshing the page.

---

## 🚀 Features

* **Add Tasks** — Create new tasks easily.
* **Delete Tasks** — Remove tasks individually.
* **Mark as Completed** — Toggle task completion.
* **LocalStorage Support** — Tasks are saved in the browser automatically.
* **Responsive UI** — Works on desktop and mobile.

---

## 📂 Project Structure

```
To-Do-App/
│
├── index.html
├── style.css
└── script.js
```

---

## 🧩 How It Works

### 1. **Add a Task**

* Type into the input field.
* Click the **Add** button or press **Enter**.
* The task is added to the list and saved to `localStorage`.

### 2. **Delete a Task**

* Click the trash icon 🗑️ next to the task.
* The task is removed from the UI and from `localStorage`.

### 3. **Complete a Task**

* Click the check button ✔️.
* The task toggles between completed and not completed.
* State is saved in `localStorage`.

### 4. **LocalStorage**

Tasks are stored in JSON format:

```
tasks = [
  { text: "Buy milk", completed: false },
  { text: "Finish homework", completed: true }
]
```

---

## 📦 Installation & Setup

1. Download or clone the project:

```
https://github.com/NIRVANA20-20/To-Do-App.git
```

2. Open the folder.

3. Run directly by opening:

```
index.html
```

No server needed.

---

## 🛠️ Technologies Used

* **HTML5** — App structure
* **CSS3** — Styling and layout
* **JavaScript (ES6)** — Logic, DOM manipulation, localStorage

---

## 📘 Example Code Snippet

```javascript
// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
```

---

## 🧪 Future Improvements

* Task filtering (All / Active / Completed)
* Drag‑and‑drop reordering
* Dark mode
* Category tags

---

## 📄 License

This project is free to use and modify.

---

If you want, I can also generate:

* `index.html`
* `style.css`
* `script.js` (clean and commented)
* A preview screenshot

Just tell me: **"give me the code"**.
