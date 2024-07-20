// This file was created for issue  #6548
// File: ./github-actions/code-ql/exclude-patterns.ql

// import javascript

// from File file
// where (file.getExtension() = "js" or file.getExtension() = "html")
//   and not file.getCode().matches(".*\\{%-?\\s*[a-zA-Z]+.*%\\}.*") // Exclude Liquid code
//   and not file.getCode().matches("(?s).*---.*---.*") // Exclude YAML front matter
// select file


/**
 * @name Exclude YAML and Liquid Front Matter
 * @description Excludes YAML front matter and Liquid template sections from the analysis
 * @kind problem
 * @problem.severity warning
 */

 import javascript

 /** Predicate to identify YAML front matter lines */
 predicate isYamlFrontMatterLine(File f, int line) {
   exists (
     int start, int end |
     start = f.getLine(1).getLineNumber() and
     (end = f.getLine(2).getLineNumber() or end = f.getLine(3).getLineNumber()) and
     line >= start and
     line <= end and
     f.getLine(start).getText().matches("---") and
     f.getLine(end).getText().matches("---")
   )
 }
 
 /** Predicate to identify Liquid template sections */
 predicate isLiquidTemplateLine(File f, int line) {
   exists (
     string content |
     f.getLine(line).getText() = content and
     (
       content.matches("{%.*%}") or
       content.matches("{{.*}}")
     )
   )
 }
 
 /** Class to represent code excluding YAML front matter and Liquid templates */
 class CodeExcludingFrontMatter extends Expr {
   CodeExcludingFrontMatter() {
     this.getFile().getExtension() = "js" and
     not isYamlFrontMatterLine(this.getFile(), this.getLocation().getStartLine()) and
     not isLiquidTemplateLine(this.getFile(), this.getLocation().getStartLine())
   }
 }
 
 from CodeExcludingFrontMatter c
 select c, "Code excluding YAML front matter and Liquid templates"