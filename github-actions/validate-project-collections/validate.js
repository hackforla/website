import {readFileSync, appendFileSync, readdirSync } from 'fs';
import fm from 'front-matter';
import { Validator } from 'jsonschema';
const validator = new Validator();

//["Active","On Hold","Completed"]
const schemaOptions ={
  "Active"    : "github-actions/validate-project-collections/schemas/schema_active.json",
  "On Hold"   : "github-actions/validate-project-collections/schemas/schema_onHold.json",
  "Completed" : "github-actions/validate-project-collections/schemas/schema_completed.json"
}

const projectFileLocation = '_projects';

(function main() {
  
  const file_path_list = get_all_file_path(projectFileLocation);

  const report = gernerateReport(file_path_list);

  const clean_report = cleanReport(report);

  writeCleanReportToFile('_data/project_validation_report.json',clean_report);


})();


function gernerateReport(file_path_list){
  const validation_list = [];
  for(const file_path of file_path_list){
    let file_data = readFileSync(file_path,'utf8');
    let extracted_data = front_matter_extract(file_data);
    let schema_to_use = JSON.parse(readFileSync(schemaOptions[extracted_data.attributes.status]));

    validation_list.push( validator.validate(extracted_data.attributes, schema_to_use) );
  }
  return validation_list;
}

function cleanReport(orginal_report_list){
  let cleaned_report = [];
  for(const original_report of orginal_report_list){
    if(original_report.errors.length > 0){
      let arr = [];
      for(let item of original_report.errors){
        arr.push({"message":item.message,"stack":item.stack})
      }
      let obj = {'file':original_report.instance.title,'errors': arr}
      cleaned_report.push(obj);
    }

  }

  return cleaned_report;
}

function writeCleanReportToFile(filename,cleanReport){
  appendFileSync(filename, JSON.stringify(cleanReport,null,4),() => {})
}



function front_matter_extract(file_data){
  let extracted_data = fm(file_data);
  return extracted_data;
}

function get_all_file_path(directory){
  try {
    const file_path_list = []
    let files =readdirSync(directory)
    files.forEach(file=>{
      file_path_list.push(`${directory}/${file}`)
    })
    return file_path_list;
  } catch (error) {
      throw new Error(error)
  }

}