const axios = require('axios')
const fs = require("fs");


const SPREAD_SHEET_ID = '1zkr_dEyiT-WTksUkVyL4jYQuYC5_YvJCLrUIfBf1CeE';
const BASE_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

const REQUEST_URL = `${BASE_API_URL}/${SPREAD_SHEET_ID}/values/\'Sheet1\'!A1:O?key=AIzaSyDsY0jyeGRnVYmQco1Pt0fW3iDyfHiyYZE`;



const sendGetRequest = async () => {
    try {
        const resp = await axios.get(REQUEST_URL);
        return resp.data.values;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};


const excel_data_array = sendGetRequest();
excel_data_array.then(data_array =>{
    const container=[];
    const keys = data_array[0];
    const request_data = data_array.slice(1);
    

    if(request_data[13] != 'FALSE'){

        request_data.forEach(function(person,i){
            let obj={};
            
            for(const [index,item] of keys.entries()){

                obj[item] = person[index].replace('""','')
            }
            delete obj['display'];
            delete obj['email'];
            container.push(obj);
            
        });

    }
    writeData(container)
})


function writeData(container){

    try{
        fs.writeFileSync('_data/_wins-data.json', JSON.stringify(container, null, 2));
    }catch(e){
        console.log(e)
    }

  }
