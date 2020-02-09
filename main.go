package main

import (
	"log"
	"net/http"
	"os"

	"github.com/kataras/neffos"
	"github.com/kataras/neffos/gobwas"
)

const defaultPort = "8080"

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	return port
}

func main() {
	connHandler := neffos.Namespaces{
		"chat": neffos.Events{
			"message": func(c *neffos.NSConn, msg neffos.Message) error {
				// Send the same namespace:event:message to the rest of the connected clients.
				c.Conn.Server().Broadcast(c, msg)
				return nil
			},
		},
	}

	ws := neffos.New(gobwas.DefaultUpgrader, connHandler)

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./public")))
	mux.Handle("/ws", ws)

	addr := ":" + getPort()
	log.Printf("Listening on %s\nPress CTRL/CMD+C to terminate the server.\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

/*

connHandler := neffos.NewStruct(new(conn)).
	SetNamespace("chat").
	SetEventMatcher(neffos.EventTrimPrefixMatcher("On"))

type conn struct {
	*neffos.NSConn
}

func (c *conn) OnMessage(msg neffos.Message) error {
	c.Conn.Server().Broadcast(c, msg)
	return nil
}

*/
