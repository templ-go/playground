package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "index.html")
		} else {
			fs.ServeHTTP(w, r)
		}
	}))

	log.Println("Listening on :5757...")
	err := http.ListenAndServe(":5757", nil)
	if err != nil {
		log.Fatal(err)
	}
}
