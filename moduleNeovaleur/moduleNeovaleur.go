package moduleneovaleur

import (
	"log"

	"github.com/GoogleCloudPlatform/go-endpoints/endpoints"
	"github.com/dbenque/neovaleur/greeting"
)

func init() {
	greetService := &greeting.GreetingService{}
	api, err := endpoints.RegisterService(greetService,
		"greeting", "v1", "Greetings API", true)
	if err != nil {
		log.Fatalf("Register service: %v", err)
	}

	register := func(orig, name, method, path, desc string) {
		m := api.MethodByName(orig)
		if m == nil {
			log.Fatalf("Missing method %s", orig)
		}
		i := m.Info()
		i.Name, i.HTTPMethod, i.Path, i.Desc = name, method, path, desc
	}

	register("List", "greets.list", "GET", "greetings", "List most recent greetings.")
	register("Add", "greets.add", "PUT", "greetings", "Add a greeting.")
	register("Count", "greets.count", "GET", "greetings/count", "Count all greetings.")
	endpoints.HandleHTTP()

}
