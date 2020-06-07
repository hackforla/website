/***********************
 * Configuration
 ***********************/

var PROJECT_IDENTIFIER = 'id';


/***********************
 * Top-level API
 ***********************/

/**
 * Wraps a Hack for LA project object for filtering
 * @param {Object} data - the object containing all filterable fields for a project 
 */
function Project(data) {
    this.id = data[PROJECT_IDENTIFIER];
    this.data = data;
}

Project.prototype = {
    get: function (fieldName) {
        if(fieldName in this.data) {
            return this.data[fieldName];
        }
        return new Array();
    }
};

/**
 * Stores and applies filter conditions
 */
function ProjectFilter(valuesByCategory) {
    this.conditions = new Map();
    this.valuesByCategory = valuesByCategory;
}

ProjectFilter.prototype = {

    /** Add filters from URL params */
    populateFromUrlParams: function() {
        const params = getUrlSearchParams();
        for(let [key, value] of params) {
            if(value instanceof Array) {
                for(let i in value) {
                    this.addCondition(key, value[i]);
                }
            } else {
                this.addCondition(key, value);
            }
        }
    },

    /** Add filters from URL params */
    propagateUrlParams: function() {
        if(this.conditions.size < 1) {
            return;
        }
        let queryString = '?';
        for (let [categoryName, valueSet] of this.conditions.entries()) {
            if(valueSet.size < 1) {
                continue;
            }
            queryString += categoryName + '=';

            [...valueSet].forEach((value, index) => {
                queryString += value.replace(' ', '+');
                if(index < valueSet.size - 1) {
                    queryString += ',';
                }
            });

            queryString += '&';            
        }
        if(queryString[queryString.length - 1] === '&') {
            queryString = queryString.slice(0,queryString.length - 1);
        }
        window.history.replaceState(null, '', queryString);
    },

    /** Create a filter entry for category, if necessary */
    addCategoryIfMissing: function (categoryName) {
        if (!this.conditions.has(categoryName)) {
            this.conditions.set(categoryName, new Set());
        }
    },

    /** Include records with specified value in category filter */
    addCondition: function (categoryName, value) {
        this.addCategoryIfMissing(categoryName);
        this.conditions.get(categoryName).add(value);
    },

    /** Exclude records with specified value in category filter */
    removeCondition: function (categoryName, value) {
        if (this.conditions.has(categoryName) && this.conditions.get(categoryName).has(value)) {
            this.conditions.get(categoryName).delete(value);
        }
    },

    /** Check all indicated filter constraints against a single record */
    satisfiesConditions: function (project) {
        for (let [categoryName, valueSet] of this.conditions.entries()) {
            if(valueSet.size < 1) {
                // when no filter is set for a given category, 
                //   all records should satisfy the condition
                continue;
            }
            let conditionMet = false;
            const values = project.get(categoryName);
            for (let value in values) {
                if (valueSet.has(values[value])) {
                    conditionMet = true;
                    break;
                }
            }
            if (!conditionMet) {
                return false;
            }
        }
        return true;

    },

    /** Check all indicated filter constraints against a single record */
    satisfiesConditionsExceptCategory: function (project, category) {
        for (let [categoryName, valueSet] of this.conditions.entries()) {
            
            if(categoryName === category) {
                continue;
            }

            if(valueSet.size < 1) {
                // when no filter is set for a given category, 
                //   all records should satisfy the condition
                continue;
            }
            let conditionMet = false;
            const values = project.get(categoryName);
            for (let value in values) {
                if (valueSet.has(values[value])) {
                    conditionMet = true;
                    break;
                }
            }
            if (!conditionMet) {
                return false;
            }
        }
        return true;

    },

    /** Return record IDs satisfying filter, and the updated counts associated with each field value */
    getFilterReport: function(projects) {

        const filtered = projects.filter(p => this.satisfiesConditions(p));
        const countReport = new Map();

        for(let [categoryName, valueSet] of this.valuesByCategory.entries()) {
            
            countReport.set(categoryName, new Map());
            
            // for every term in this category, count how many projects have 
            //    this value in their term list
            valueSet.forEach(value => {
                countReport
                    .get(categoryName)
                    .set(
                        value, 
                        // filtered.filter(p => p.get(categoryName).indexOf(value) >= 0).length
                        projects
                            .filter(p => this.satisfiesConditionsExceptCategory(p, categoryName))
                            .filter(p => p.get(categoryName).indexOf(value) >= 0)
                            .length
                    );
            });

        }
        return {
            ids: filtered.map(p => p.get('id')),
            counts: mapToObj(countReport)
        };
    }

};


/***********************
 * Utilities
 ***********************/

/** Convert an ES6 Map to an Object */
function mapToObj(m) {
    let o = {};
    for(let [key, value] of m) {
        if(value instanceof Map) {
            o[key] = mapToObj(value);
        } else if (value instanceof Set) {
            o[key] = setToArr(value);
        } else {
            o[key] = value;
        }
    }
    return o;
}

/** Convert an ES6 Set to an Array */
function setToArr(s) {
    let a = [];
    for(let value of m) {
        if(value instanceof Map) {
            a.push(mapToObj(value));
        } else if (value instanceof Set) {
            a.push(setToArr(value));
        } else {
            a.push(value);
        }
    }
    return a;

}


/** Helper for initializing filter from query string (note: dedicated URLSearchParams API not supported in IE) */
function getUrlSearchParams() {
    const queryString = window.location.search;
    const params = new Map();
    if(queryString.length < 2) {
        return params;
    }
    const components = queryString.slice(1).split('&');
    for(let componentIndex in components) {
        const component = components[componentIndex];

        const tuple = component.split('=');
        const key = tuple[0];
        if(tuple[1].indexOf(',') < 0) {
            params.set(key, tuple[1].replace('+', ' '));
        } else {
            const value = new Array();
            const valuesStrings = tuple[1].split(',');
            for(let valueIndex in valuesStrings) {
                value.push(valuesStrings[valueIndex].replace('+', ' '));
            }
            params.set(key, value);
        }
        
    }
    return params;
    
}
