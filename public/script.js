let go = new Go();
let editor;
let htmlCodeEditor;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(
  (result) => {
    go.run(result.instance);
  },
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
async function formatTempl() {
  const formatButton = document.getElementById("formatButton");

  formatButton.classList.toggle("loading");
  let templCode = editor.getValue().trim();

  let templFormattedCode = window.FormatTempl(templCode);
  if (templFormattedCode.error) {
    editor.setValue(templFormattedCode.code)
    editor.getSession().setAnnotations([{
      row: templFormattedCode.line,
      column: 0,
      text: templFormattedCode.error,
      type: "error" // also "warning" and "info"
    }])
    return;
  }
  editor.setValue(templFormattedCode.result);
}
async function convertTemplToGo() {
  const runButton = document.getElementById("runButton");

  runButton.classList.toggle("loading");
  let templCode = editor.getValue().trim();

  let goCode = window.ConvertTemplToGo(templCode);
  
  if (goCode.error) {
    editor.setValue(goCode.code)
    editor.getSession().setAnnotations([{
      row: goCode.line,
      column: 0,
      text: goCode.error,
      type: "error" // also "warning" and "info"
    }])
    return;
  }
  editor.setValue(templCode)
  fetch("https://play.golang.org/compile", {
    method: "POST",
    body: JSON.stringify({ version: 2, body: goCode.result }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Errors) {
        document.getElementById("output").textContent = data.Errors;
        return;
      }
      // Display the output
      const formattedHTML = html_beautify(data.Events[0].Message);
      htmlCodeEditor.setValue(formattedHTML);
      document.getElementById("render").innerHTML = formattedHTML;
      runButton.classList.toggle("loading");
    });

  // Display the output in the div with id 'output'
  // document.getElementById("output").textContent = goCode;

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
    isDarkMode ? "ace/theme/dracula" : "ace/theme/textmate",
  );
}

function toggleHTMLPanel() {
  document
    .getElementById("htmlToggle")
    .classList.toggle("html-toggle--toggled");
  document
    .getElementById("bottomPanelRow")
    .classList.toggle("child__panel--hidden");
  htmlOutput.classList.toggle("panel--hidden");
}
