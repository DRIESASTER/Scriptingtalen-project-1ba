#!/usr/bin/env python3
import cgi
import json

import requests
import re
from bs4 import BeautifulSoup

pad = []
parameters = cgi.FieldStorage()



def start(taal, startpagina, eindpagina):
    #text eruit halen
    link = "https://" + taal + ".wikipedia.org/wiki/" + startpagina
    response = requests.get(link)
    soup = BeautifulSoup(response.content, "html.parser")
    # div = soup.find('div', id="bodyContent")
    title = soup.find(id="firstHeading").text
    pad.append(title)
    next = ""

    changed = re.sub("\)", "</bracket>", re.sub("\(", "<bracket>", str(soup)))
    filtered_soup = BeautifulSoup(changed, 'html.parser')
    div = filtered_soup.find('div', id="bodyContent")
    lines = div.find_all("p")

    for line in lines:
        # voor elke line checken of er link in zit die niet tussen haakjes staat
        links = (line.find_all(lambda tag: tag.name == "a" and not tag.find_parent("bracket")))
        for link in links:
            #haakjes terug plaatsen
            link = str(link).replace("&lt;bracket&gt;", "(")
            link = link.replace("&lt;/bracket&gt;", ")")

            # kijken of het geen speciale link is
            if re.match(".*/wiki/[^ :/%#]*\".*", str(link)):
                next = (((str(link).split("href=\""))[1]).split("\"")[0]).split("/wiki/")[1]
                # voortzoeken
                if (not next.replace("_", " ") in pad) and (not next == eindpagina):
                    return start(taal, next, eindpagina)
                # stoppen als we aan de eindpagina zitten
                elif (next == eindpagina):
                    link = "https://" + taal + ".wikipedia.org/wiki/" + next
                    response = requests.get(link)
                    soup = BeautifulSoup(response.content, "html.parser")
                    title = soup.find(id="firstHeading").text
                    pad.append(title)
                    return {"pad": pad}
                # anders foutmelding geven
                else:
                    return {"error": "loop detected"}
    # alle lijntjes overlopen => geen link gevonden
    return {"error": "no further links detected after " + title}


lang = parameters.getvalue('lang')
bpunt = parameters.getvalue('start')
epunt = parameters.getvalue('end')


path_data = start(taal=lang, startpagina=bpunt, eindpagina=epunt)
print(path_data)

print("Content-Type: application/json")
print()  # Lege lijn na headers
print(json.dumps(path_data))