console.save = function(data, filename) {
    if (!data) {
        console.error('Console.save: No data');
        return;
    }

    if (!filename) {
        filename = 'console.json';
    }

    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
    }

    var blob = new Blob([data],{
        type: 'text/json'
    });
    var a = document.createElement('a');

    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    a.click();
}

function randomnumber(){
    const ll = 20;
    const ul = 27;
    const d = Math.random();
    return Math.floor(d*(ul - ll)) *1000;
}
function scrolldown(){
  setTimeout(window.scrollTo(0, document.body.scrollHeight 
|| document.documentElement.scrollHeight),5)
}
function scrollup(){
  setTimeout(window.scrollTo(0, 0 
|| document.documentElement.scrollHeight),5)
}
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const options = { 'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36" };
const fetchData = async (url) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const text = await response.text();
    const dom = new DOMParser();
    const htmldom = dom.parseFromString(text, 'text/html'); // Specify the MIME type

    const scriptTag = htmldom.getElementById("__NEXT_DATA__");
    if (scriptTag) {
      const jsonStr = scriptTag.textContent;
      const jsonData = JSON.parse(jsonStr);
      // console.log(jsonData);
      return jsonData; // Return the parsed JSON data
    } else {
      console.error("Script tag with ID '__NEXT_DATA__' not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
// ref : https://blog.hubspot.com/website/javascript-fetch-api
async function timeSensativeAction(code){
    const t = fetchData(`https://www.bloomberg.com/quote/${code}`);
    t.then(jsonData => {
      if (jsonData) {
          let dataObjtimeSeries =jsonData['props']['pageProps']['quote'];
          for (const o of Object.keys(dataObjtimeSeries)){
            if (!mydata[o]){
              mydata[o] = {};
            }
            mydata[o] = dataObjtimeSeries[o];
          }
          console.log("Extracted JSON data:", jsonData);
        mydata['all'] = jsonData;
        mydata['slope_1d']  = calculateSlope(mydata['priceMovements1Month']);
        if (!runResult[code]) {
            runResult[code] = {};     
        } 
        runResult[code] = mydata;  
        
      } else {
        console.error("Script tag not found or error fetching data.")
      }
    });
  scrolldown();
  await sleep(randomnumber()) //wait 5 seconds
  scrollup();
}
function calculateSlope(myarr){
  // const myarr = [{'dateTime':'2024-08-02','value':535.77},{'dateTime':'2024-08-01','value':546.05},{'dateTime':'2024-07-31','value':553.32}]
  // myarr.sort().reverse();
  myarr.sort((a,b)=> new Date(b['dateTime']) - new Date(a['dateTime']))
  console.log(myarr.slice(0,3));
  const slope = parseFloat(myarr[0]['value'])/parseFloat(myarr[1]['value']);
  console.log(slope);
  return slope;
}
// program main
// target : https://www.bloomberg.com/quote/IVVD:US
let runResult = {};
let mydata ={} ;
let codeList = ["GOOGL:US","DAPP:US","IUIT:LN","ALORIAA:LX","ALACSRT:LX","TRGBTEQ:LX","JPHLUCA:LX","BGWTD2U:LX","BGWNBAU:ID","มีเยอะเลย","MERENER:LX","ALGAATU:LX","ARKF:US","JPAGAAU:LX","MSAIOPI:LX","2828:HK","GLD:SP","QQQ:US","IWM:US","IVV:US"];
for (const code of codeList){
  timeSensativeAction(code);
}
function savejson(){
  const tday = new Date().toJSON().slice(0,19);
  console.save(runResult, tday+".json");
}

