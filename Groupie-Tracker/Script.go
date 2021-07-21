package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	textTemplate "text/template"
)

type templateData struct { // Structure de données transmise au template
	Groupes []artists
}

type artists struct { // Structure de données pour recenser les artistes
	Id           int
	Image        string
	Name         string
	Members      []string
	CreationDate int
	FirstAlbum   string
	DatesLoc     map[string]map[int]string
}

type indexDate struct {
	Index []dates
}

type dates struct {
	Id    int
	Dates []string
}

type indexLoc struct {
	Index []loc
}

type loc struct {
	Id        int
	Locations []string
}

var artist []artists  // variable pour les artistes
var date indexDate    // variable pour les dates
var location indexLoc // variable pour les locations
// =====================================================================================
func main() {
	// Charger les fichiers du dossier 'static' sur le serveur :
	fs := http.FileServer(http.Dir("./static/"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		tmpl, err := textTemplate.ParseFiles("./static/index.html")
		if err != nil {
			http.Error(w, "Error 400 - Bad Request!", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case "POST":
			if err != nil {
				http.Error(w, "Error 500 - Internal Server Error", http.StatusInternalServerError)
				return
			}

		}

		if r.URL.Path != "/" {
			http.Error(w, "404 - Page not found", http.StatusNotFound)
		} else {
			if err := tmpl.Execute(w, templateData{
				Groupes: artist,
			}); err != nil {
				http.Error(w, "Error 400 - Bad Request!", http.StatusBadRequest)

			}
		}

	})

	err := Init()
	if err != nil {
		fmt.Println(err)
		log.Fatal(err)
	}
	Merge()
	fmt.Println("Listening server at port 8000.")
	http.ListenAndServe("localhost:8000", nil)

}

func Init() error {

	urlartist := "https://groupietrackers.herokuapp.com/api/artists"
	artistFile, err := http.Get(urlartist)
	if err != nil {
		fmt.Println("Get Error Artist")
		// fmt.Println(err)
		return err
	} else {
		artistData, err := ioutil.ReadAll(artistFile.Body)
		if err != nil {
			fmt.Println("ReadAll Error Artist")
			// fmt.Println(err)
			return err
		} else {
			err = json.Unmarshal(artistData, &artist)
			if err != nil {
				fmt.Println("Unmarshal Error Artist")
				//fmt.Println(err)
				return err
			} else {
				fmt.Println("OK pour les Artistes")
			}
		}
	}

	// ===============================================================================================
	urllocation := "https://groupietrackers.herokuapp.com/api/locations"
	locationFile, err := http.Get(urllocation)
	if err != nil {
		fmt.Println("Get Error Location")
		// fmt.Println(err)
		return err
	} else {
		locationData, err := ioutil.ReadAll(locationFile.Body)
		if err != nil {
			fmt.Println("ReadAll Error Location")
			// fmt.Println(err)
			return err
		} else {
			err = json.Unmarshal(locationData, &location)
			if err != nil {
				fmt.Println("Unmarshal Error Location")
				// fmt.Println(err)
				return err
			} else {
				fmt.Println("OK pour les Localisations")
			}
		}
	}

	// ===============================================================================================
	urldate := "https://groupietrackers.herokuapp.com/api/dates"
	dateFile, err := http.Get(urldate)
	if err != nil {
		fmt.Println("Get Error Date")
		//fmt.Println(err)
		return err
	} else {
		dateData, err := ioutil.ReadAll(dateFile.Body)
		if err != nil {
			fmt.Println("ReadAll Error Date")
			//fmt.Println(err)
			return err
		} else {
			err = json.Unmarshal(dateData, &date)
			if err != nil {
				fmt.Println("Unmarshal Error Date")
				// fmt.Println(err)
				return err
			} else {
				fmt.Println("OK pour les Dates")
			}
		}
	}
	return nil
}

func Merge() {
	locs := location.Index
	dt := date.Index

	for i := 0; i < len(locs); i++ {
		artist[i].DatesLoc = map[string]map[int]string{}
		city := 0
		count := 0
		for j := 0; j < len(dt[i].Dates); j++ {
			val := dt[i].Dates[j]
			if j != 0 && val[0] == '*' {
				city++
				count = 0
			}
			if j == 0 || (j != 0 && val[0] == '*') {
				artist[i].DatesLoc[locs[i].Locations[city]] = map[int]string{}
				artist[i].DatesLoc[locs[i].Locations[city]][count] = val[1:]
			} else {
				artist[i].DatesLoc[locs[i].Locations[city]][count] = val
			}
			count++
		}
	}
}