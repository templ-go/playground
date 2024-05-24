let go = new Go();
let editor;
let htmlCodeEditor;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(
  (result) => {
    go.run(result.instance);
  }
);
window.onload = function () {
  editor = ace.edit("templ-code");
  editor.setTheme("ace/theme/dracula");
  editor.getSession().setMode("ace/mode/go");
  editor.setShowPrintMargin(false);

  htmlCodeEditor = ace.edit("output");
  htmlCodeEditor.setTheme("ace/theme/dracula");
  htmlCodeEditor.getSession().setMode("ace/mode/html");
  htmlCodeEditor.setReadOnly(true);
  htmlCodeEditor.setShowPrintMargin(false);
};

async function convertTemplToGo() {
  const runButton = document.getElementById("runButton");

  runButton.classList.toggle("loading");
  let templCode = editor.getValue().trim();

  let goCode = window.ConvertTemplToGo(templCode);

  fetch("https://play.golang.org/compile", {
    method: "POST",
    body: JSON.stringify({ version: 2, body: goCode }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("🚀 ~ .then ~ data:", data)
      if (data.Errors) {
        console.log("🚀 ~ .then ~ data.Errors:", data.Errors);
        document.getElementById("output").textContent = data.Errors;
        return;
      }
      // Display the output
      // console.log("🚀 ~ .then ~ data.Events[0].Message:", data.Events[0].Message)
      const formattedHTML = html_beautify(data.Events[0].Message);
      console.log("🚀 ~ .then ~ formattedHTML:", formattedHTML);
      htmlCodeEditor.setValue(formattedHTML);
      document.getElementById("render").innerHTML = formattedHTML;
      runButton.classList.toggle("loading");
    });

  // Display the output in the div with id 'output'
  // document.getElementById("output").textContent = goCode;

  // console.log("🚀 ~ goCode ~ goCode:", goCode)
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  document
    .getElementById("themeToggle")
    .classList.toggle("theme-toggle--toggled");
  const lightbulb = document.querySelector(".theme-toggle__lightbulb");
  lightbulb.style.stroke = isDarkMode ? "white" : "#dbbc30";
  lightbulb.style.fill = isDarkMode ? "white" : "#dbbc30";

  editor.setTheme(isDarkMode ? "ace/theme/dracula" : "ace/theme/textmate");
  htmlCodeEditor.setTheme(
    isDarkMode ? "ace/theme/dracula" : "ace/theme/textmate"
  );
}

function toggleHTMLPanel() {
  document
    .getElementById("htmlToggle")
    .classList.toggle("html-toggle--toggled");
  document.getElementById("bottomPanelRow").classList.toggle("child__panel--hidden");
  htmlOutput.classList.toggle("panel--hidden");
}
