import javascript

from File file
where (file.getExtension() = "js" or file.getExtension() = "html")
  and not file.getCode().matches(".*\\{%.*%\\}.*") // Exclude Liquid code
  and not file.getCode().matches(".*---.*")        // Exclude YAML front matter
select file