//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"fmt"
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
		return fmt.Sprintf("Error parsing Templ code: %s\nTempl code was: %s", err.Error(), goTemplCode)
	}

	// Generate the Go code
	var buf bytes.Buffer
	_, _, err = generator.Generate(templateFile, &buf)
	if err != nil {
		return fmt.Sprintf("Error generating Go code: %s", err.Error())
	}

	// Return the Go code as a string
	return buf.String()
}

func FormatTempl(this js.Value, args []js.Value) interface{} {
	in := args[0].String()

	// Parse the Templ code
	templateFile, err := parser.ParseString(in)
	if err != nil {
		return fmt.Sprintf("Error parsing Templ code: %s\nTempl code was: %s", err.Error(), in)
	}

	var buf bytes.Buffer
	templateFile.Write(&buf)
	return buf.String()
}

func main() {
	// Expose the function to JavaScript
	js.Global().Set("ConvertTemplToGo", js.FuncOf(ConvertTemplToGo))
	js.Global().Set("FormatTempl", js.FuncOf(FormatTempl))

	// Prevent the Go program from exiting
	select {}
}
