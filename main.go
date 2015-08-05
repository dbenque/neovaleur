package main

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

type PathAndId struct {
	Ciid    string
	Section string
}

type nodeBase struct {
	Id        string
	MotherId  string
	Weight    float64
	MaxWeight string
	Rules     string //choice(max of available valeus),moyenne,mult
	Content   string
	Options   []option
	Ciid      string
	Path      []PathAndId
	OptCount  int
}

type nodeJson struct {
	nodeBase
	Lft      string
	Rgt      string
	Children []nodeJson
}

type option struct {
	Text  string
	Value float64
}

type node struct {
	nodeBase
	ChildrenId []string
}

type edge map[string]int

type treeDataModel struct {
	Nodes map[string]nodeJson
	Edges map[string]edge
}

func (n *nodeJson) exploreRules() {
	//fmt.Println(n.Rules)
	if n.Children != nil {
		for _, v := range n.Children {
			v.exploreRules()
		}
	}
}

func (n *nodeJson) setOptionsAndCiid(model *map[string]node, currentCiid string) {
	n.Options = (*model)[n.Id].Options
	if len(currentCiid) > 0 {
		n.Ciid = currentCiid + "_" + n.Id
	} else {
		n.Ciid = n.Id
	}
	if n.Children != nil {
		for i := 0; i < len(n.Children); i++ {
			(&(n.Children[i])).setOptionsAndCiid(model, n.Ciid)
		}
	}
}

func (n *nodeJson) leavesOnly() []*nodeJson {

	l := make([]*nodeJson, 0, 0)

	if n.Children != nil {
		for i := 0; i < len(n.Children); i++ {
			l = append(l, (&(n.Children[i])).leavesOnly()...)
		}
	} else {
		l = append(l, n)
	}

	return l

}

func (n *nodeJson) setParentPath(path []PathAndId) {
	if path == nil {
		path = make([]PathAndId, 0, 0)
	}

	n.Path = path

	if n.Children != nil {
		path = append(path, PathAndId{n.Ciid, n.Content})
		for i := 0; i < len(n.Children); i++ {
			(&(n.Children[i])).setParentPath(path)
		}
	}
}

func (n *nodeJson) setSubCount() int {

	count := 0

	if n.Children != nil {
		for i := 0; i < len(n.Children); i++ {
			count = count + (&(n.Children[i])).setSubCount()
		}
	} else {
		count = 1
	}

	n.OptCount = count
	return count

}

func buildModel(t *treeDataModel) map[string]node {
	m := make(map[string]node)
	for k, v := range t.Nodes {
		var n node
		n.nodeBase = v.nodeBase
		m[k] = n

	}

	// build child relation
	for k, v := range t.Nodes {
		n := m[k]
		if v.Children != nil {
			var childrenId []string
			for _, nv := range v.Children {
				childrenId = append(childrenId, nv.Id)
			}
			n.ChildrenId = childrenId
		}
		m[k] = n
	}

	doc := loadDoc()

	doc.Find("select").Each(func(i int, s *goquery.Selection) {
		if name, ok := s.Attr("name"); ok {

			n := m[name]
			var options []option
			s.Find("option").Each(func(j int, o *goquery.Selection) {

				if val, ok := o.Attr("value"); ok {
					w := strings.Split(val, ",")[1]
					fl, _ := strconv.ParseFloat(w, 64)
					options = append(options, option{o.Text(), fl})
				}
			})
			n.Options = options
			m[name] = n
		}
	})

	return m
}

func loadDoc() *goquery.Document {
	var f *os.File
	var e error

	if f, e = os.Open("web.html"); e != nil {
		panic(e.Error())
	}
	defer f.Close()

	var node *html.Node
	if node, e = html.Parse(f); e != nil {
		panic(e.Error())
	}
	return goquery.NewDocumentFromNode(node)
}

func main() {
	dat, err := ioutil.ReadFile("treedata.json")
	check(err)

	var treeData treeDataModel
	err = json.Unmarshal(dat, &treeData)
	check(err)

	modelMap := buildModel(&treeData)

	r := treeData.Nodes["1"]
	r.setOptionsAndCiid(&modelMap, "")
	r.setParentPath(nil)
	r.setSubCount()

	// for _, n := range modelMap {
	// 	if n.Id == "314" {
	//
	// 		fmt.Printf("%v\n", n)
	// 	}
	// }

	b, _ := json.Marshal(&modelMap)

	ioutil.WriteFile("moduleNeovaleur/static/model.json", b, 0666)

	bb, _ := json.Marshal(r)

	ioutil.WriteFile("moduleNeovaleur/static/rootmodel.json", bb, 0666)

	l, _ := json.Marshal(r.leavesOnly())

	ioutil.WriteFile("moduleNeovaleur/static/leaves.json", l, 0666)

	// http.HandleFunc("/", handler)
	// http.ListenAndServe(":8888", nil)

}

// func handler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
// }
