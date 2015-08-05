package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	mx := mux.NewRouter()

	mx.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))
	http.ListenAndServe("localhost:8080", mx)
}
