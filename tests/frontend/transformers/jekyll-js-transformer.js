const { Liquid } = require('liquidjs');
const path = require('path');
const matter = require('gray-matter');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Jest transformer that pre-processes JS-under-test
 * to populate LiquidJS and frontmatter statements
 * into pure JS that can be parsed by a test script
 * 
 * Works on CJS and MJS files
 */

/* Engine for performing the Liquid transformation */
const engine = new Liquid({
    root: [path.resolve(__dirname, "../../../_includes")],
    jekyllInclude: true,
})

/* Site context populated by actual site data*/
const siteData = getSiteData();

/**
 * Returns the "site" context for liquid processing, with
 * the content populated by the repos Jekyll JSON and YML files
 * 
 * @returns Object with format {"site":{...}}
 */
function getSiteData() {
    let _siteData = {"site":{}};

    // These sources will be added to site
    const sources = {
        "../../../_data": "data"
    };

    // Populate _siteData with the data from the sources
    for (const source in sources) {
        _siteData["site"][sources[source]] = loadDirData(path.resolve(__dirname, source));
    }
    return _siteData;
}

/**
 * Walks through the selected directory and returns an object containing
 * all the JSON and YML data contained within, maintaining the directory
 * hierarchy. Is called recursively to traverse all sub-directories.
 * 
 * @param {*} dir Directory name to process
 * @param {*} basePath Path to the directory being processed
 * @returns Object with format {dir : {...}}
 */
function loadDirData(dir, basePath = '') {
    const dirData = {};

    let dirItems;
    try {
        dirItems = fs.readdirSync(dir);
    } catch (error) {
        return dirData; // Directory doesn't exist or isn't readable
    }

    // Loop over all items in the directory
    for (const item of dirItems) {
        const fullPath = path.join(dir, item);
        const ext = path.extname(item);
        const name = path.basename(item, ext);

        try {
            // Try to read as a file
            const fileContent = fs.readFileSync(fullPath, 'utf-8');

            if (ext === ".json") {
                dirData[name] = JSON.parse(fileContent);
            } else if (ext === '.yml' || ext === '.yaml') {
                // Target YMLs might use multi-doc syntax, so we need to use loadAll
                const ymlDocs = yaml.loadAll(fileContent);

                // If only one document, return just the one. Otherwise return array
                dirData[name] = ymlDocs.length === 1 ? ymlDocs[0] : ymlDocs;
            }
        } catch {
            // Might be a directory instead
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    // Item is a subdirectory, so recurse on this functoin
                    dirData[item] = loadDirData(fullPath, path.join(basePath, item));
                }
            } catch (error) {
                // File or directory isn't accessible
                console.warn(`Could not access ${fullPath}: ${error}`);
            }
        }
    }
    return dirData;
}

module.exports = {
    process(sourceText, sourcePath, options) {
        try {
            // console.log(`Processing ${sourcePath}`);

            // Parse frontmatter if present
            const {content, data:fmData} = matter(sourceText);

            // Combine frontmatter data with site data
            const liquidData = {...fmData, ...siteData};

            // Render the liquid statements with the combined data
            const renderedJs = engine.parseAndRenderSync(content, liquidData);

            // Return transformed JS
            return { code: renderedJs };
        } catch (err) {
            console.error(`Error rendering ${sourcePath}: ${err}.`);

            // Return untransformed JS 
            return { code: sourceText}
        }
    }
};