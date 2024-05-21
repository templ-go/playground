let go = new Go();
let editor;
let htmlCodeEditor;
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(
  (result) => {
    go.run(result.instance);
    // Call the Go function with the string
    // let goCode = window.ConvertTemplToGo(goTemplCode);
    // console.log(goCode);

    // fetch("https://play.golang.org/compile", {
    //   method: "POST",
    //   body: JSON.stringify({ version: 2, body: goCode }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("🚀 ~ .then ~ data:", data)
    //     // Display the output
    //     console.log("🚀 ~ .then ~ data.Events[0].Message:", data.Events[0].Message)
    //     // document.getElementById("output").textContent = data.Events[0].Message;
    //   });
  }
);
window.onload = function () {
  editor = CodeMirror.fromTextArea(document.getElementById("templ-code"), {
    lineNumbers: true,
    mode: "go",
    theme: "dracula",
  });

  htmlCodeEditor = CodeMirror.fromTextArea(document.getElementById("output"), {
    lineNumbers: true,
    mode: "htmlmixed",
    theme: "dracula",
    readonly: "nocursor",
  });
};

async function convertTemplToGo() {
  // Get the Templ code from the textarea
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
        document.getElementById("output").textContent = data.Errors;
        return;
      }
      // Display the output
      // console.log("🚀 ~ .then ~ data.Events[0].Message:", data.Events[0].Message)
      const formattedHTML = html_beautify(data.Events[0].Message);
      console.log("🚀 ~ .then ~ formattedHTML:", formattedHTML)
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

  editor.setOption("theme", isDarkMode ? "dracula" : "default");
  htmlCodeEditor.setOption("theme", isDarkMode ? "dracula" : "default");
}
