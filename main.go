package main

import (
	"encoding/json"
	"fmt"
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

type nodeBase struct {
	Id        string
	MotherId  string
	Weight    float64
	MaxWeight string
	Rules     string //choice(max of available valeus),moyenne,mult
	Content   string
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
	Options    []option
}

type edge map[string]int

type treeDataModel struct {
	Nodes map[string]nodeJson
	Edges map[string]edge
}

func (n *nodeJson) exploreRules() {
	if n.Id == "314" {
		fmt.Printf("%v\n", n)
	}
	//fmt.Println(n.Rules)
	if n.Children != nil {
		for _, v := range n.Children {
			v.exploreRules()
		}
	}
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

	// for _, n := range modelMap {
	// 	if n.Id == "314" {
	//
	// 		fmt.Printf("%v\n", n)
	// 	}
	// }

	b, _ := json.Marshal(&modelMap)

	ioutil.WriteFile("model.json", b, 0666)
	// http.HandleFunc("/", handler)
	// http.ListenAndServe(":8888", nil)

}

// func handler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
// }
