//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"syscall/js"

	"github.com/a-h/templ/generator"
	"github.com/a-h/templ/parser/v2"
)

// ConvertTemplToGo is a function that can be called from JavaScript.
func ConvertTemplToGo(_ js.Value, args []js.Value) interface{} {
	// Get the Templ code from the JavaScript arguments
	goTemplCode := args[0].String()

	// Parse the Templ code
	templateFile, err := parser.ParseString(goTemplCode)
	if err != nil {
		fmt.Println("parser convert errored ")
		return js.ValueOf(map[string]any{
        "error": err.Error(),
		"code": goTemplCode,
		"line": lineError(err.Error()),
    })
	}

	// Generate the Go code
	var buf bytes.Buffer
	_, _, err = generator.Generate(templateFile, &buf)
	if err != nil {
		return js.ValueOf(map[string]any{
        "error": err.Error(),
    }) 	
  }

	// Return the Go code as a string
	return js.ValueOf(map[string]any{
      "result": buf.String(),
  })
}

func lineError(errorLine string) int {
	re := regexp.MustCompile("line ([\\d]+)")
		line := re.FindString(errorLine)
		splitLine := strings.Split(line, " ")
		lineNumber, _ := strconv.Atoi(splitLine[1])

		return lineNumber
}

func FormatTempl(this js.Value, args []js.Value) interface{} {
	in := args[0].String()

	// Parse the Templ code
	templateFile, err := parser.ParseString(in)
	if err != nil {
		return js.ValueOf(map[string]any{
			"error": err.Error(),
			"code": in,
			"line": lineError(err.Error()),
		})
	}

	var buf bytes.Buffer
	templateFile.Write(&buf)
	return js.ValueOf(map[string]any{
      "result": buf.String(),
    })
}

func main() {
	// Expose the function to JavaScript
	js.Global().Set("ConvertTemplToGo", js.FuncOf(ConvertTemplToGo))
	js.Global().Set("FormatTempl", js.FuncOf(FormatTempl))

	// Prevent the Go program from exiting
	select {}
}
