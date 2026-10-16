"use strict";

const STORAGE_KEY = "campusly-students-v1";
const initialStudents = [
  { id: 2, name: "Salma", email: "ummey.salma1110", department: "CSE", cgpa: 3.9 },
  { id: 101, name: "Rahim Uddin", email: "rahim.uddin@example.com", department: "CSE", cgpa: 3.75 },
  { id: 103, name: "Tanvir Ahmed", email: "tanvir.ahmed@example.com", department: "EEE", cgpa: 3.4 },
  { id: 104, name: "Fatema Akter", email: "fatema.akter@example.com", department: "BBA", cgpa: 3.6 },
  { id: 105, name: "Sakib Hasan", email: "sakib.hasan@example.com", department: "CSE", cgpa: 3.18 },
  { id: 106, name: "Mim Chowdhury", email: "mim.chowdhury@example.com", department: "English", cgpa: 3.85 },
  { id: 107, name: "Rafiul Islam", email: "rafiul.islam@example.com", department: "EEE", cgpa: 2.95 },
  { id: 108, name: "Sumaiya Rahman", email: "sumaiya.rahman@example.com", department: "BBA", cgpa: 3.5 },
  { id: 109, name: "Imran Hossain", email: "imran.hossain@example.com", department: "CSE", cgpa: 3.67 },
  { id: 110, name: "Tasnim Sultana", email: "tasnim.sultana@example.com", department: "Law", cgpa: 3.3 }
];
const avatarColors = [
  ["#f0edff", "#7864ce"], ["#eaf6f1", "#4c9c78"], ["#fff0e9", "#ce8051"],
  ["#eaf2ff", "#6088c9"], ["#fcecf2", "#c36e90"], ["#eff1fb", "#6f78ab"]
];

const elements = {
  tableBody: document.getElementById("student-table-body"),
  emptyState: document.getElementById("empty-state"),
  search: document.getElementById("search-input"),
  departmentFilter: document.getElementById("department-filter"),
  modal: document.getElementById("student-modal"),
  form: document.getElementById("student-form"),
  formError: document.getElementById("form-error"),
  toast: document.getElementById("toast")
};

let students = loadStudents();
let editingId = null;
let sortBy = "id";
let sortDirection = 1;
let toastTimer;

function loadStudents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return [...initialStudents];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isValidStudent)) {
      throw new Error("Saved student data is invalid.");
    }
    return parsed;
  } catch (error) {
    console.error("Unable to load saved student data.", error);
    return [...initialStudents];
  }
}

function isValidStudent(student) {
  return student && Number.isInteger(student.id) && typeof student.name === "string" &&
    typeof student.email === "string" && typeof student.department === "string" &&
    Number.isFinite(student.cgpa) && student.cgpa >= 0 && student.cgpa <= 4;
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Unable to save student data in this browser.", error);
    showToast("Could not save changes in this browser.");
    return false;
  }
  return true;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
}

function render() {
  const query = elements.search.value.trim().toLowerCase();
  const department = elements.departmentFilter.value;
  const visibleStudents = students
    .filter(student => !department || student.department === department)
    .filter(student => [student.name, student.email, student.department, String(student.id)]
      .some(value => value.toLowerCase().includes(query)))
    .sort((a, b) => {
      const comparison = sortBy === "cgpa" ? a.cgpa - b.cgpa : a.id - b.id;
      return comparison * sortDirection;
    });

  elements.tableBody.replaceChildren(...visibleStudents.map(createStudentRow));
  elements.emptyState.hidden = visibleStudents.length > 0;
  document.getElementById("results-count").textContent =
    `Showing ${visibleStudents.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;
  document.getElementById("nav-count").textContent = students.length;
  renderStats();
  renderDepartments();
}

function createStudentRow(student) {
  const row = document.createElement("tr");
  const studentCell = document.createElement("td");
  const identity = createElement("div", "student-cell");
  const color = avatarColors[Math.abs(student.id) % avatarColors.length];
  const avatar = createElement("span", "student-avatar", initials(student.name));
  avatar.style.setProperty("--avatar-bg", color[0]);
  avatar.style.setProperty("--avatar-color", color[1]);
  const details = createElement("span", "student-details");
  details.append(createElement("span", "student-name", student.name),
    createElement("span", "student-id", `ID ${student.id}`));
  identity.append(avatar, details);
  studentCell.append(identity);

  const departmentCell = document.createElement("td");
  departmentCell.dataset.label = "Department";
  departmentCell.append(createElement("span", "dept-tag", student.department));
  const emailCell = createElement("td", "", student.email);
  emailCell.dataset.label = "Email";
  const cgpaCell = createElement("td");
  cgpaCell.className = "cgpa-cell";
  cgpaCell.dataset.label = "CGPA";
  cgpaCell.append(document.createTextNode(student.cgpa.toFixed(2)));
  const track = createElement("span", "cgpa-track");
  const progress = document.createElement("span");
  progress.style.width = `${(student.cgpa / 4) * 100}%`;
  track.append(progress);
  cgpaCell.append(track);

  const actionCell = document.createElement("td");
  actionCell.dataset.label = "Actions";
  const actions = createElement("div", "row-actions");
  const editButton = createElement("button", "row-action", "✎");
  editButton.type = "button";
  editButton.title = `Edit ${student.name}`;
  editButton.setAttribute("aria-label", `Edit ${student.name}`);
  editButton.addEventListener("click", () => openModal(student));
  const deleteButton = createElement("button", "row-action delete", "×");
  deleteButton.type = "button";
  deleteButton.title = `Delete ${student.name}`;
  deleteButton.setAttribute("aria-label", `Delete ${student.name}`);
  deleteButton.addEventListener("click", () => deleteStudent(student));
  actions.append(editButton, deleteButton);
  actionCell.append(actions);

  row.append(studentCell, departmentCell, emailCell, cgpaCell, actionCell);
  return row;
}

function renderStats() {
  const total = students.length;
  const average = total ? students.reduce((sum, student) => sum + student.cgpa, 0) / total : 0;
  const topStudent = students.reduce((top, student) => !top || student.cgpa > top.cgpa ? student : top, null);
  const departmentCount = new Set(students.map(student => student.department)).size;
  document.getElementById("total-students").textContent = total;
  document.getElementById("average-cgpa").textContent = average.toFixed(2);
  document.getElementById("department-count").textContent = departmentCount;
  document.getElementById("departments-total").textContent = departmentCount;
  document.getElementById("top-performer").textContent = topStudent ? topStudent.name : "—";
  document.getElementById("top-cgpa").textContent = topStudent ? `${topStudent.cgpa.toFixed(2)} CGPA` : "No records";
}

function renderDepartments() {
  const palette = ["#705bd8", "#e8a46d", "#75c3a2", "#6c9add", "#c0b3ef", "#e184a0", "#7f869f"];
  const counts = students.reduce((result, student) => {
    result.set(student.department, (result.get(student.department) || 0) + 1);
    return result;
  }, new Map());
  const sortedDepartments = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const selectedDepartment = elements.departmentFilter.value;
  const currentOptions = [...elements.departmentFilter.options].map(option => option.value).filter(Boolean);
  const departmentNames = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  if (currentOptions.join("|") !== departmentNames.join("|")) {
    elements.departmentFilter.replaceChildren(new Option("All departments", ""));
    departmentNames.forEach(name => elements.departmentFilter.add(new Option(name, name)));
    elements.departmentFilter.value = departmentNames.includes(selectedDepartment) ? selectedDepartment : "";
  }

  document.getElementById("donut-total").textContent = students.length;
  document.getElementById("largest-department").textContent = sortedDepartments[0]?.[0] || "No department";
  const legend = document.getElementById("department-legend");
  legend.replaceChildren(...sortedDepartments.slice(0, 6).map(([name, count], index) => {
    const item = createElement("div", "legend-row");
    const dot = createElement("span", "legend-dot");
    dot.style.backgroundColor = palette[index % palette.length];
    item.append(dot, createElement("span", "", name),
      createElement("span", "legend-count", count),
      createElement("span", "legend-percent", `${students.length ? Math.round(count / students.length * 100) : 0}%`));
    return item;
  }));

  let angle = 0;
  const segments = sortedDepartments.map(([name, count], index) => {
    const start = angle;
    angle += students.length ? count / students.length * 360 : 360;
    return `${palette[index % palette.length]} ${start}deg ${angle}deg`;
  });
  document.getElementById("donut-chart").style.background = students.length
    ? `conic-gradient(${segments.join(", ")})`
    : "#eeedf4";
}

function openModal(student = null) {
  editingId = student ? student.id : null;
  document.getElementById("modal-title").textContent = student ? "Edit student" : "Add a student";
  document.getElementById("save-student").textContent = student ? "Save changes" : "Save student";
  document.getElementById("student-id").disabled = Boolean(student);
  document.getElementById("student-id").value = student?.id ?? "";
  document.getElementById("student-name").value = student?.name ?? "";
  document.getElementById("student-email").value = student?.email ?? "";
  document.getElementById("student-department").value = student?.department ?? "";
  document.getElementById("student-cgpa").value = student?.cgpa ?? "";
  elements.formError.hidden = true;
  elements.modal.hidden = false;
  document.getElementById("student-name").focus();
}

function closeModal() {
  elements.modal.hidden = true;
  elements.form.reset();
  document.getElementById("student-id").disabled = false;
  editingId = null;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function deleteStudent(student) {
  if (!window.confirm(`Delete ${student.name} (ID ${student.id})?`)) return;
  const previousStudents = students;
  students = students.filter(item => item.id !== student.id);
  if (!saveStudents()) {
    students = previousStudents;
    return;
  }
  render();
  showToast(`${student.name} was removed.`);
}

function exportStudents() {
  const escapeCsv = value => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [["ID", "Name", "Email", "Department", "CGPA"],
    ...students.map(student => [student.id, student.name, student.email, student.department, student.cgpa.toFixed(2)])];
  const csv = rows.map(row => row.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "campusly-students.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Student directory exported.");
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();
  const student = {
    id: Number(document.getElementById("student-id").value),
    name: document.getElementById("student-name").value.trim(),
    email: document.getElementById("student-email").value.trim(),
    department: document.getElementById("student-department").value.trim(),
    cgpa: Number(document.getElementById("student-cgpa").value)
  };
  const duplicateId = students.some(item => item.id === student.id && item.id !== editingId);
  if (!Number.isInteger(student.id) || student.id < 1) {
    elements.formError.textContent = "Enter a valid positive student ID.";
  } else if (duplicateId) {
    elements.formError.textContent = "A student with this ID already exists.";
  } else if (!student.name || !student.email || !student.department) {
    elements.formError.textContent = "Please complete all student details.";
  } else if (!Number.isFinite(student.cgpa) || student.cgpa < 0 || student.cgpa > 4) {
    elements.formError.textContent = "CGPA must be between 0.00 and 4.00.";
  } else {
    const isEditing = editingId !== null;
    const previousStudents = students;
    students = editingId === null
      ? [...students, student]
      : students.map(item => item.id === editingId ? student : item);
    if (!saveStudents()) {
      students = previousStudents;
      return;
    }
    closeModal();
    render();
    showToast(isEditing ? "Student updated successfully." : "Student added successfully.");
  }
  elements.formError.hidden = false;
});

document.getElementById("add-student-button").addEventListener("click", () => openModal());
document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("cancel-modal").addEventListener("click", closeModal);
elements.modal.addEventListener("click", event => {
  if (event.target === elements.modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});
elements.search.addEventListener("input", render);
elements.departmentFilter.addEventListener("change", render);
document.querySelectorAll(".sort-button").forEach(button => {
  button.addEventListener("click", () => {
    const nextSort = button.dataset.sort;
    sortDirection = sortBy === nextSort ? -sortDirection : 1;
    sortBy = nextSort;
    render();
  });
});
document.getElementById("export-button").addEventListener("click", exportStudents);
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    document.getElementById("sidebar").classList.remove("open");
  });
});

render();
