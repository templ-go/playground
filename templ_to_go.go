//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"fmt"
	"syscall/js"

	"github.com/a-h/templ/generator"
	v2 "github.com/a-h/templ/parser/v2"
)

// ConvertTemplToGo is a function that can be called from JavaScript.
func ConvertTemplToGo(this js.Value, args []js.Value) interface{} {
	// Get the Templ code from the JavaScript arguments
	goTemplCode := args[0].String()

	// Parse the Templ code
	templateFile, err := v2.ParseString(goTemplCode)
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

func main() {
	// Expose the function to JavaScript
	js.Global().Set("ConvertTemplToGo", js.FuncOf(ConvertTemplToGo))

	// Prevent the Go program from exiting
	select {}
}
