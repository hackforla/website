const {createFilter, projectDataSorter} = require('../../../assets/js/current-projects.js');

const defaultProjectData = [
        {
            "project" : {
                "title": "Web Project",
                "programAreas" : ["Diversity / Equity / Inclusion", "Social Safety Net"],
                "technologies" : ["JavaScript", "Python", "React"],
                "languages" : ["PHP", "Ruby"],
                "tools" : ["Git", "SQL"],
                "status" : "Active"
            },
        },
        {
            "project" : {
                "title": "Simple Project",
                "programAreas" : ["Civic Tech Infrastructure"],
                "technologies" : ["C++"],
                "languages" : ["C"],
                "tools": ["Docker"],
                "status" : "Completed"
        },
        },
        {
            "project" : {
                "title": "Best Project",
                "programAreas" : ["Social Safety Net"],
                "technologies" : ["Python"],
                "languages" : ["PHP"],
                "tools" : ["Git"],
                "status" : 'Active',
            },
        },
        {
            "project" : {
                "title": "Test Project",
                "programAreas" : ["Social Safety Net"],
                "technologies" : ["Python"],
                "languages" : ["PHP"],
                "tools" : ["Git"],
                "status" : 'Active',
            },
        },
        {
            "project" : {
                "title": "Empty Project A",
                "programAreas" : [],
                "technologies" : [],
                "languages" : [],
                "tools" : [],
                "status" : 'On Hold',
            },
        },
        {
            "project" : {
                "title": "Empty Project B",
            },
        },
    ]

describe('createFilter', () => {
    
    it('returns program, technologies, languages, tools, and status filters for non-check pages', () => {
        const filters = createFilter(defaultProjectData);
        expect(filters['programs']).not.toBeUndefined();
        expect(filters['technologies']).not.toBeUndefined();
        expect(filters['languages']).not.toBeUndefined();
        expect(filters['tools']).not.toBeUndefined();
        expect(filters['status']).not.toBeUndefined();
    });

    it('returns technologies, languages, and tools filters only for check pages', () => {
        const filters = createFilter(defaultProjectData, true);
        expect(filters['technologies']).not.toBeUndefined();
        expect(filters['languages']).not.toBeUndefined();
        expect(filters['tools']).not.toBeUndefined();

        expect(filters['programs']).toBeUndefined();
        expect(filters['status']).toBeUndefined();
    });

    it('returns a program filter that provides a flat array of programs for non-check pages', () => {
        const nonCheckfilters = createFilter(defaultProjectData);
        const expectedPrograms = [
            "Diversity / Equity / Inclusion",
            "Social Safety Net",
            "Civic Tech Infrastructure",
        ].sort();

        // Expect values and length are equal
        expect(nonCheckfilters['programs']).toEqual(expectedPrograms);
        expect(nonCheckfilters['programs']).toHaveLength(expectedPrograms.length);
    });

    it('returns a technologies filter that provides a flat array of technologies for check and non-check pages', () => {
        const checkfilters = createFilter(defaultProjectData);
        const nonCheckfilters = createFilter(defaultProjectData);
        const expectedTechnologies = ["JavaScript", "Python", "React", "C++"].sort();

        // Expect values and length are equal
        expect(checkfilters['technologies']).toEqual(expectedTechnologies);
        expect(checkfilters['technologies']).toHaveLength(expectedTechnologies.length);

        expect(nonCheckfilters['technologies']).toEqual(expectedTechnologies);
        expect(nonCheckfilters['technologies']).toHaveLength(expectedTechnologies.length);
    });

    it('returns a languages filter that provides a flat array of languages for check and non-check pages', () => {
        const checkfilters = createFilter(defaultProjectData);
        const nonCheckfilters = createFilter(defaultProjectData);
        const expectedLanguages = ["PHP", "Ruby", "C"].sort();

        // Expect values and length are equal
        expect(checkfilters['languages']).toEqual(expectedLanguages);
        expect(checkfilters['languages']).toHaveLength(expectedLanguages.length);

        expect(nonCheckfilters['languages']).toEqual(expectedLanguages);
        expect(nonCheckfilters['languages']).toHaveLength(expectedLanguages.length);

    });

    it('returns a tools filter that provides a flat array of tools for check and non-check pages', () => {
        const checkfilters = createFilter(defaultProjectData);
        const nonCheckfilters = createFilter(defaultProjectData);
        const expectedTools = ["Git", "SQL", "Docker"].sort();

        // Expect values and length are equal
        expect(checkfilters['tools']).toEqual(expectedTools);
        expect(checkfilters['tools']).toHaveLength(expectedTools.length);

        expect(nonCheckfilters['tools']).toEqual(expectedTools);
        expect(nonCheckfilters['tools']).toHaveLength(expectedTools.length);

    });

    it('returns a status filter that provides a flat array of statuses for check and non-check pages', () => {
        const nonCheckfilters = createFilter(defaultProjectData);

        // TODO: Currently, the project with "empty" status inserts undefined in this filter. 
        // Might not be desired behavior.
        const expectedStatuses = ["Active", "Completed", "On Hold", undefined].sort();

        // Expect values and length are equal
        expect(nonCheckfilters['status']).toEqual(expectedStatuses);
        expect(nonCheckfilters['status']).toHaveLength(expectedStatuses.length);
    });

});

describe("projectDataSorter", () => {
    it('sorts projects alphabetically by title and status', () => {
        const expectedTitleOrder = [
            "Best Project",
            "Test Project",
            "Web Project",
            "Simple Project",
            "Empty Project A",
        ];

        const sortedProjects = projectDataSorter(defaultProjectData);

        expect(sortedProjects).toHaveLength(expectedTitleOrder.length);

        for (let i = 0; i < expectedTitleOrder.length; i++) {
            expect(sortedProjects[i].project.title).toEqual(expectedTitleOrder[i]);
        }
    })
});



