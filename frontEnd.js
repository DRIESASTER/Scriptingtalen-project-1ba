
var nodeToParent = {}
var network;

function voegToe(taal, bpunt , epunt) {
    const items = document.querySelectorAll("#items li");
    const huidigeLijst = [];
    for (let item of items) {
        huidigeLijst.push(item.innerText);
    }
    let data = {lijst: huidigeLijst};
    fetch(`cgi-bin/backEnd.py?lang=${taal}&start=${bpunt}&end=${epunt}`)
        .then(text => text.json())
        .then(data2 => {
            //als er een pad is:
            if(data2["pad"] !== undefined){
                //voor elk pad checken of ze der al in zitten, zoja -> aansluiten op elkaar
                for (let i=0 ; i<data2["pad"].length ; i++) {
                    let item = data2["pad"][i]
                    if (!(item in nodeToParent)) {
                        nodeToParent[item] = []
                    }
                    let parent = data2["pad"][i + 1]
                    if (parent!==null && !nodeToParent[item].includes(parent)){
                        nodeToParent[item].push(parent)
                    }
                }
                makeTree();
            }
            //anders gooi popup error
            else {
                alert(data2["error"])
            }
            document.querySelector('#addButton').disabled = false;
        });
}

function makeTree() {
    //maak boom met alle nodes/webpagins die we momenteel zijn tegengekomen
    let edgesArr = []
    let nodeArr = []
    for(let i in Object.keys(nodeToParent)){
        let node = Object.keys(nodeToParent)[i]
        nodeArr.push({id: node, label: node})
        edgesArr.push({from: node, to: nodeToParent[node][0]})
    }

    var edges = new vis.DataSet(edgesArr);
    var nodes = new vis.DataSet(nodeArr);

    var container = document.getElementById("mynetwork");
    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {};
    network = new vis.Network(container, data, options);
}


document.querySelector("#addButton").addEventListener("click", () => {
    document.querySelector('#addButton').disabled = true;
    const taal = document.querySelector("#taal").value === "" ? "en" : document.querySelector("#taal").value;
    const bpunt = document.querySelector("#bpunt").value === "" ? "Special:Random" : document.querySelector("#bpunt").value.replaceAll(" ","_");
    const epunt = document.querySelector("#epunt").value === "" ? "Philosophy" : document.querySelector("#epunt").value.replaceAll(" ","_");
    voegToe(taal, bpunt, epunt);
});

document.querySelector('#taal').addEventListener('input', () => emptyScreen())
document.querySelector('#epunt').addEventListener('input', () => emptyScreen())
//maakt boom leeg
function emptyScreen(){
    nodeToParent = {}
    network = new vis.Network(document.getElementById("mynetwork"), {}, {})
}