export const fileNames=['index.html','styles.css','app.js'] as const;
export type ProjectFile=typeof fileNames[number];
export type ProjectFiles=Record<ProjectFile,string>;
export type LabProgress={files:ProjectFiles;lesson:number;completed:number[];storage:Record<string,string>};
export const projectId='taskboard-basics';
const html=`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Taskboard</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body>
  <main>
    <h1>Taskboard</h1>
    <p>A small place for your next steps.</p>
    <form id="task-form">
      <label for="task-title">New task</label>
      <div class="add-row">
        <input id="task-title" maxlength="120" placeholder="What needs doing?">
        <button type="submit">Add task</button>
      </div>
    </form>
    <p id="task-count" aria-live="polite"></p>
    <ul id="task-list" aria-label="Tasks"></ul>
  </main>
</body>
</html>`;
const css=`* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #f3f5f4;
  color: #172a25;
}
main { max-width: 640px; margin: 24px auto; }
h1 { font-size: 32px; margin-bottom: 8px; }
form { margin: 24px 0; }
label { display: block; margin-bottom: 8px; }
.add-row { display: flex; gap: 8px; }
input, button { font: inherit; }
input[type="text"], #task-title {
  min-width: 0; flex: 1; padding: 10px;
  border: 1px solid #b4c4bd; border-radius: 4px;
}
button {
  padding: 10px 14px; border: 1px solid #245b49;
  border-radius: 4px; background: #245b49;
  color: white; cursor: pointer;
}
button:hover { background: #163d30; }
#task-list { list-style: none; padding: 0; }
.task {
  display: flex; gap: 10px; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #cad4cf;
}
.task.done input[type="text"] { text-decoration: line-through; color: #57665f; }
.task input[type="checkbox"] { width: 18px; height: 18px; }
.task button { background: transparent; color: #245b49; }
#task-count { color: #57665f; font-size: 14px; }
@media (max-width: 420px) {
  body { padding: 16px; }
  .task { flex-wrap: wrap; }
}
`;
const render=`function render() {
  list.replaceChildren();
  for (const task of tasks) {
    const row = document.createElement('li');
    row.className = task.done ? 'task done' : 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Complete ' + task.title);
    checkbox.addEventListener('change', () => {
      updateTask(task.id, { done: checkbox.checked });
    });

    const title = document.createElement('input');
    title.type = 'text';
    title.value = task.title;
    title.maxLength = 120;
    title.setAttribute('aria-label', 'Edit task');
    title.addEventListener('change', () => {
      const nextTitle = title.value.trim();
      if (nextTitle) updateTask(task.id, { title: nextTitle });
      else render(); // Keep the original title when an edit is blank.
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', 'Delete ' + task.title);
    remove.addEventListener('click', () => deleteTask(task.id));

    row.append(checkbox, title, remove);
    list.append(row);
  }
  const remaining = tasks.filter(task => !task.done).length;
  count.textContent = remaining + ' remaining / ' + tasks.length + ' total';
}
`;
const create=`form.addEventListener('submit', event => {
  event.preventDefault(); // Handle the form here instead of navigating away.
  const title = input.value.trim();
  if (!title) return;
  tasks.push({ id: crypto.randomUUID(), title, done: false });
  input.value = '';
  commit();
});`;
const update=`function updateTask(id, changes) {
  tasks = tasks.map(task => task.id === id ? { ...task, ...changes } : task);
  commit();
}`;
const remove=`function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  commit();
}`;
const storage=`function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem('taskboard') || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(task =>
      task && typeof task.id === 'string' &&
      typeof task.title === 'string' && typeof task.done === 'boolean'
    );
  } catch {
    return []; // A damaged storage value should not break the page.
  }
}`;
function script(stage:number){
 if(stage<2)return '// Your JavaScript will go here in lesson 3.\n';
 return `// State is the source of truth. render() turns it into elements.\n${stage>=6?storage+'\nlet tasks = loadTasks();':"let tasks = [{ id: 'first-task', title: 'Learn CRUD', done: false }];"}
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');

function commit() {
${stage>=6?"  localStorage.setItem('taskboard', JSON.stringify(tasks));":"  // Lesson 7: save tasks here before rendering."}
  render();
}

${render}
${stage>=3?create:"form.addEventListener('submit', event => {\n  event.preventDefault();\n  // TODO: read, validate and add a task, then call commit().\n});"}

${stage>=4?update:'function updateTask(id, changes) {\n  // TODO: replace the matching task, then call commit().\n}'}

${stage>=5?remove:'function deleteTask(id) {\n  // TODO: remove the matching task, then call commit().\n}'}

render();
`;
}
export function checkpoint(stage:number):ProjectFiles{
 return {'index.html':stage>=0?html:html.replace(/  <main>[\s\S]*?  <\/main>/,'  <main>\n    <!-- Build your task form and list here. -->\n  </main>'),'styles.css':stage>=1?css:'/* Style your taskboard in lesson 2. */\n','app.js':script(stage)};
}
export const lessons:{title:string;file:ProjectFile;goal:string;explain:string[];steps:string[];hint:string;snippet:string;verify:string;source:string}[]=[
 {title:'Build the page',file:'index.html',goal:'Give your app a form, a list, and a place to show progress.',explain:['HTML describes the structure of a page. A form groups inputs, a label names an input, and a list holds the tasks you will create later.','This project has three files. index.html loads styles.css for appearance and app.js for behavior. The defer attribute runs JavaScript after the HTML has been parsed.'],steps:['Inside <main>, add an <h1> with the text Taskboard.','Add a form with id="task-form", a label, an input with id="task-title", and a submit button labeled Add task.','Below the form add <p id="task-count" aria-live="polite"></p> and <ul id="task-list" aria-label="Tasks"></ul>.','Run the page. The form is visible; adding tasks comes in lesson 4.'],hint:'A label’s for attribute must match its input’s id. Keep the IDs shown here: your JavaScript and lesson checks use them.',snippet:html,verify:'The preview has a heading, a labeled input, a submit button, and a task list.',source:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_forms'},
 {title:'Style the interface',file:'styles.css',goal:'Make a readable layout that works on a small screen.',explain:['CSS rules select elements and describe how to display them. #task-list selects one ID, while .task selects every row with that class.','Use a maximum width instead of a fixed page width. Flexbox puts related controls next to each other; min-width: 0 lets inputs shrink inside the row.'],steps:['Set body to a system font, add padding and a background color.','Give main max-width: 640px and automatic horizontal margins.','Use display: flex and gap on .add-row. Style inputs and buttons so they are easy to use.','Add .task row styles for the elements you will create next. Resize the preview by opening the page on a narrower screen.'],hint:'Start with layout and spacing. border-box makes padding part of an element’s width.',snippet:css,verify:'The main column has a maximum width, the form row uses flex, and the page has padding.',source:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox'},
 {title:'Read: render your data',file:'app.js',goal:'Turn an array of task objects into a visible list.',explain:['CRUD means Create, Read, Update, Delete. Start with Read: show the data already in memory. Each task has a stable id, a title, and a done boolean.','render() rebuilds the list from the array. The array is the source of truth; changing a DOM element alone will not change your data. Assign user text through .value or .textContent, not innerHTML.'],steps:['Create tasks with one object: { id: "first-task", title: "Learn CRUD", done: false }.','Select the form, title input, list, and count elements using querySelector.','Write render() to clear the list and create one <li class="task"> per task. Each row needs a checkbox, a text input, and a Delete button.','Add the updateTask/deleteTask placeholders and commit() helper from the example, then call render(). The controls will work in later lessons.'],hint:'replaceChildren() empties the list before rendering. Otherwise every call would duplicate all the rows.',snippet:script(2),verify:'A task row contains a title field, checkbox and delete button, with a visible count.',source:'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement'},
 {title:'Create: add a task',file:'app.js',goal:'Handle form submissions and reject blank tasks.',explain:['The submit event fires when someone clicks the button or presses Enter. preventDefault() keeps the browser on the current page.','Trim whitespace, validate the title, create a unique ID, and push a new object into tasks. Then call commit() to update the display.'],steps:['Replace the submit handler’s TODO with the code below.','Read input.value.trim() and return early if it is empty.','Append a new task with crypto.randomUUID() and done: false. Clear the input and call commit().','Run. Add two tasks with the same title. They should remain separate records because their IDs differ. Try a whitespace-only title too.'],hint:'Do not use a title as the ID. Two records may have the same title, and titles can change.',snippet:create,verify:'Submitting adds a task, clears the input, and rejects whitespace-only submissions.',source:'https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event'},
 {title:'Update: edit and complete',file:'app.js',goal:'Change one record without changing its identity.',explain:['Array.map() returns a new array. For the task whose id matches, merge the changes with the old object; return every other task unchanged.','The checkbox sends { done: true/false }. The text field sends { title: newTitle } when you finish editing and move focus away. Both use the same updateTask function.'],steps:['Replace the empty updateTask function with the example.','Use map() to compare each task.id with the id argument.','Call commit() after assigning the new array.','Run. Check a task, rename it, then uncheck it. Try clearing a title: the render handler should restore the original name.'],hint:'The spread order matters: { ...task, ...changes } lets new values replace old ones while keeping id.',snippet:update,verify:'A checkbox changes completion, a title edit survives re-rendering, and other tasks stay unchanged.',source:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map'},
 {title:'Delete: remove one record',file:'app.js',goal:'Delete the selected task and keep the rest.',explain:['Array.filter() keeps the records that satisfy a condition. To delete one record, keep every task whose id is different from the requested id.','After changing data, call the same commit() helper used by Create and Update. A single path keeps the UI and saved data consistent.'],steps:['Replace the empty deleteTask function with the example.','Filter tasks by task.id !== id, then call commit().','Run. Add duplicate titles and delete only one of them.','Delete the final task. The empty list should still show 0 remaining / 0 total.'],hint:'Filter by ID, not by title or array position. Indices change when items are removed.',snippet:remove,verify:'Deleting removes exactly one task, including when titles are duplicated.',source:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter'},
 {title:'Persist: keep your tasks',file:'app.js',goal:'Save after every change and restore on startup.',explain:['JavaScript variables disappear when a page reloads. localStorage stores strings, so JSON.stringify converts your array to text and JSON.parse reads it back.','This is a frontend CRUD app: its data stays in browser storage, without a server or database. The lab gives each project isolated preview storage. Save progress also saves that preview data with your workspace.'],steps:['Add loadTasks() before the tasks declaration and replace the initial array with let tasks = loadTasks().','In commit(), write localStorage.setItem("taskboard", JSON.stringify(tasks)) before render().','Run, add a task, then click Run again. The task should still be there.','Save progress. You can also download each file and serve the folder locally to continue outside the lab.'],hint:'JSON.parse can throw when stored text is damaged. Catch that error and validate the array before using it.',snippet:storage+'\n\nlet tasks = loadTasks();\n\nfunction commit() {\n  localStorage.setItem(\'taskboard\', JSON.stringify(tasks));\n  render();\n}',verify:'Stored tasks load on startup, and create/update/delete operations write back to storage.',source:'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage'}
];
export const freshLab=():LabProgress=>({files:checkpoint(-1),lesson:0,completed:[],storage:{}});
