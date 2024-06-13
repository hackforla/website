// This file was created for issue  #6548
// File: codeql-queries/exclude-patterns.ql

import javascript

from File file
where (file.getExtension() = "js" or file.getExtension() = "html")
  and not file.getCode().matches(".*\\{%.*%\\}.*") // Exclude Liquid code
  and not file.getCode().matches(".*---.*")        // Exclude YAML front matter
select file
