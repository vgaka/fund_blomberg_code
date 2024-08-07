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

function randomNumber() {
  const ll = 20;
  const ul = 27;
  const d = Math.random();
  return Math.floor(d * (ul - ll)) * 1000;
}

function scrolldown() {
  setTimeout(window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight), 5);
}

function scrollup() {
  setTimeout(window.scrollTo(0, 0 || document.documentElement.scrollHeight), 5);
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const options = {
  'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
};

async function fetchData(url) {
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
      return jsonData; // Return the parsed JSON data
    } else {
      console.error("Script tag with ID '__NEXT_DATA__' not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function timeSensativeAction(code) {
  const jsonData = await fetchData(`https://www.bloomberg.com/quote/${code}`);

  if (jsonData) {
    const tday = new Date().toJSON().slice(0, 19);
    console.log("Extracted JSON data for", code, ":", jsonData); // Log for tracking

    // Process the extracted data here (example):
    const dataObjtimeSeries = jsonData['props']['pageProps']['quote'];
    let mydata = {};

    for (const o of Object.keys(dataObjtimeSeries)) {
      if (!mydata[o]) {
        mydata[o] = {};
      }
      mydata[o] = dataObjtimeSeries[o];
    }

    mydata['all'] = jsonData;
    const arr = jsonData['props']['pageProps']['quote']['priceMovements1Month'].sort().reverse().slice(0, 5);
    mydata['Three_Commandments'] = Three_Commandments(arr);
    console.log("Processed data for", code, ":", mydata); // Log for tracking

    // Update runResult only if data is successfully fetched
    runResult[code] = mydata;
  } else {
    console.error("Script tag not found or error fetching data for", code);
  }

  // Scroll and wait actions can be performed after data has been processed
  scrolldown();
  await sleep(5000); // Wait 5 seconds
  scrollup();
}

function Three_Commandments(myarr){
  // const myarr = [{'dateTime':'2024-08-02','value':535.77},{'dateTime':'2024-08-01','value':546.05},{'dateTime':'2024-07-31','value':553.32}]
  console.log(myarr);
  myarr.sort((a,b)=> new Date(b['dateTime']) - new Date(a['dateTime']))
  console.log(myarr.slice(0,3));
  const priceIndex = parseFloat(myarr[0]['value'])/parseFloat(myarr[1]['value']);
  console.log(priceIndex);
  return priceIndex;
}

// Program main
let runResult = {};
let mydata = {}; // Removed unnecessary declaration within the loop

const codeList = [
  "DAPP:US","PIMINIA:ID","IVV:US","IUIT:LN","ALORIAA:LX","ALACSRT:LX","TRGBTEQ:LX","JPHLUCA:LX",
  "BGWTD2U:LX","BGWNBAU:ID","มีเยอะเลย","MERENER:LX","ALGAATU:LX","POTX:US","not found","ARKF:US","EPCWDEI:LX",
  "JPAGAAU:LX","MSGOPPA:LX","MSAIOPI:LX","2828:HK","GLD:SP","QQQ:US","IWM:US","SMH:LN","UOBCAIJ:SP"
];
function main(){
  for (const code of codeList){
    timeSensativeAction(code);
  }
}

main();
// localStorage.setItem('runResult', JSON.stringify(runResult));
// localStorage.getItem('runResult');
function extractrunResult(){
    for (const [key, value] of Object.entries(runResult)) {
    // console.log(value);
      const priceMovementIndex = value.Three_Commandments;
      const pricequote = value.priceMovements1Month;
      const prevprice =value.prevClose;
      const price = value.price;
      const name = value.longName;
      const tradingdayclose = value.tradingDayClose; // ราคาปิดวันที่
      const tradingDate = value.tradingDate; // รัน data เมื่อวันที่
      const netAssetValueDate = value.netAssetValueDate;
      const netAssetValue = value.netAssetValue;
      console.log( [key,name, priceMovementIndex, price, prevprice, tradingDate, tradingdayclose] );
    }
}

function save(){
  const tday = new Date().toJSON().slice(0,10);
  console.save(runResult, "bloombergdata-"+tday+".json");
}
