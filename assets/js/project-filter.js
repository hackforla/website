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

    /** Return record IDs satisfying filter, and the updated counts associated with each field value */
    getFilterReport: function(projects) {

        const filtered = projects.filter(p => this.satisfiesConditions(p));
        const countReport = new Map();

        for(let [categoryName, valueSet] of this.valuesByCategory.entries()) {

            countReport.set(categoryName, new Map());
            valueSet.forEach(value => {
                countReport
                    .get(categoryName)
                    .set(
                        value, 
                        filtered.filter(p => {
                            const v = p.get(categoryName);
                            const isMatch = v.indexOf(value) >= 0;
                            return isMatch;
                        }).length
                    );
            })

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

