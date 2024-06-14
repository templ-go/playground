let go = new Go();
let editor;
let htmlCodeEditor;

WebAssembly.instantiateStreaming(
  fetch("/assembly/main.wasm"),
  go.importObject
).then((result) => {
  go.run(result.instance);
});
window.onload = function () {
  let timeoutId = null;
  const delay = 500;

  editor = ace.edit("templ-code");
  editor.setTheme("ace/theme/dracula");
  editor.getSession().setMode("ace/mode/go");
  editor.setShowPrintMargin(false);
  editor.on("change", function () {
    console.log("Code Changed");
    const hotReloadChecked = document.getElementById("hotReloadToggle").checked
    console.log(hotReloadChecked)
    if (hotReloadChecked) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(compileAndRunCode, delay);
    }
  });

  htmlCodeEditor = ace.edit("output");
  htmlCodeEditor.setTheme("ace/theme/dracula");
  htmlCodeEditor.getSession().setMode("ace/mode/html");
  htmlCodeEditor.setReadOnly(true);
  htmlCodeEditor.setShowPrintMargin(false);
  var source = new EventSource("/events");
  source.onmessage = function (e) {
    if (e.data === "refresh") {
      console.log("%cPage Hot Reloaded", "font-weight: bold; color: cyan;");
      location.reload();
    }
  };
};
async function formatTempl() {
  editor.getSession().setAnnotations();
  const formatButton = document.getElementById("formatButton");

  formatButton.classList.toggle("loading");
  try {
    let templCode = editor.getValue().trim();

    let templFormattedCode = window.FormatTempl(templCode);
    if (templFormattedCode.error) {
      editor.setValue(templFormattedCode.code);
      editor.getSession().setAnnotations([
        {
          row: templFormattedCode.line,
          column: 0,
          text: templFormattedCode.error,
          type: "error", // also "warning" and "info"
        },
      ]);
      return;
    }
    editor.setValue(templFormattedCode.result);
  } catch (e) {
    setError(e);
  } finally {
    formatButton.classList.toggle("loading");
  }
}
function compileGo() {
  editor.getSession().setAnnotations();
  let templCode = editor.getValue().trim();

  let goCode = window.ConvertTemplToGo(templCode);

  if (goCode.error) {
    editor.getSession().setAnnotations([
      {
        row: goCode.line,
        column: 0,
        text: goCode.error,
        type: "error", // also "warning" and "info"
      },
    ]);
    return;
  }
  return goCode;
}
function setError(err) {
  document.getElementById("render").innerHTML = `
	<p class="error">${err}</p>
	`;
}
async function compileAndRunCode() {
  const runButton = document.getElementById("runButton");
  runButton.classList.toggle("loading");
  try {
    const goCode = compileGo();
    if (!goCode) {
      return;
    }
    const resp = await fetch("https://play.golang.org/compile", {
      method: "POST",
      body: JSON.stringify({ version: 2, body: goCode.result }),
    });
    const data = await resp.json();
    if (data.Errors) {
      htmlCodeEditor.setValue(data.Errors);
      return;
    }
    // Display the output
    const formattedHTML = html_beautify(data.Events[0].Message);
    htmlCodeEditor.setValue(formattedHTML);
    document.getElementById("render").innerHTML = formattedHTML;
  } catch (e) {
    setError(e);
  } finally {
    runButton.classList.toggle("loading");
  }
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
  let currentHtmlCode = htmlCodeEditor.session.getValue();
  htmlCodeEditor.session.setValue(currentHtmlCode);

  document
    .getElementById("htmlToggle")
    .classList.toggle("html-toggle--toggled");

  document
    .getElementById("bottomPanelRow")
    .classList.toggle("child__panel--hidden");
  htmlOutput.classList.toggle("panel--hidden");
}
