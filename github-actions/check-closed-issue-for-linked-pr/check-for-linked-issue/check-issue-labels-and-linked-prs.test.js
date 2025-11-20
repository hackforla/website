'use strict';

const hasLinkedPrOrExcusableLabel = require('./check-issue-labels-and-linked-prs');

// ==================================================

// Create the github and context mocks.  Freezing Objects to prevent accidental
// changes.
const github = Object.freeze({ graphql: jest.fn() });
const context = deepFreeze({
  repo: {
    owner: 'owner1',
    repo: 'repo1',
  },
  payload: {
    issue: {
      number: 1,
      labels: [],
    },
  },
});

describe('hasLinkedPrOrExcusableLabel', () => {
  let contextCopy;

  beforeEach(() => {
    contextCopy = structuredClone(context);
    jest.resetAllMocks();
  });

  test.each([
    [[{ name: 'non-PR contribution' }]],
    [
      [
        { name: 'non-PR contribution' },
        { name: 'good first issue' },
        { name: 'size: 1pt' },
      ],
    ],
  ])(
    'If the issue has the "non-PR contribution" label, then return true.  ' +
      'Labels: %j.',
    async (labelsList) => {
      // Arrange
      contextCopy.payload.issue.labels = labelsList;

      // Act
      const result = await hasLinkedPrOrExcusableLabel({
        github,
        context: contextCopy,
      });

      // Assert
      expect(result).toBe(true);
      expect(github.graphql).not.toHaveBeenCalled();
    }
  );

  test.each([
    [[{ name: 'Ignore: Test' }]],
    [
      [
        { name: 'Ignore: Test' },
        { name: 'good first issue' },
        { name: 'size: 1pt' },
      ],
    ],
  ])(
    'If the issue has a label that includes "Ignore", then return true.  ' +
      'Labels: %j',
    async (labelsList) => {
      // Arrange
      contextCopy.payload.issue.labels = labelsList;

      // Act
      const result = await hasLinkedPrOrExcusableLabel({
        github,
        context: contextCopy,
      });

      // Assert
      expect(result).toBe(true);
      expect(github.graphql).not.toHaveBeenCalled();
    }
  );

  test('If the issue has a linked PR, then return true.', async () => {
    // Arrange
    github.graphql.mockResolvedValue({
      repository: {
        issue: {
          closedByPullRequestsReferences: {
            totalCount: 1,
          },
        },
      },
    });

    // Act
    const result = await hasLinkedPrOrExcusableLabel({
      github,
      context: contextCopy,
    });

    // Assert
    expect(result).toBe(true);
    expect(github.graphql).toHaveBeenCalledWith(
      expect.stringContaining('query'),
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue: context.payload.issue.number,
      }
    );
  });

  test(
    'If there is no linked PR nor any of the excusable labels, ' +
      'then return false.',
    async () => {
      // Arrange
      github.graphql.mockResolvedValue({
        repository: {
          issue: {
            closedByPullRequestsReferences: {
              totalCount: 0,
            },
          },
        },
      });

      // Act
      const result = await hasLinkedPrOrExcusableLabel({
        github,
        context: contextCopy,
      });

      // Assert
      expect(result).toBe(false);
      expect(github.graphql).toHaveBeenCalledWith(
        expect.stringContaining('query'),
        {
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue: context.payload.issue.number,
        }
      );
    }
  );
});

// ==================================================

/**
 * Helper function taken from MDN.  Freezes nested Objects.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#deep_freezing
 *
 * @param {*} object - Any JavaScript Object.
 * @returns Passed-in Object.
 */
function deepFreeze(object) {
  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
