import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { angularBuildersMultiproject } from './angular-builders-multiproject';
import * as helpers from '../../helpers';
import * as angularHelpers from '../../generators/ANGULAR/helpers';

const checkAngularBuilders = async () => {
  mockStorybookData({ mainConfig: {}, storybookVersion: '7.0.0' });

  // mock file system (look at eslint plugin test)

  return angularBuildersMultiproject.check({
    packageManager: makePackageManager({}),
  });
};

jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'),
  isNxProject: jest.fn(),
}));

jest.mock('../../generators/ANGULAR/helpers', () => ({
  ...jest.requireActual('../../generators/ANGULAR/helpers'),
  AngularJSON: jest.fn(),
}));

jest.mock('@angular/core', () => ({
  VERSION: { major: 13 },
}));

describe('is Nx project', () => {
  beforeEach(() => {
    (helpers.isNxProject as any as jest.SpyInstance).mockReturnValue(true);
  });

  it('should return null', async () => {
    await expect(checkAngularBuilders()).resolves.toBeNull();
  });
});

describe('is not Nx project', () => {
  beforeEach(() => {
    (helpers.isNxProject as any as jest.SpyInstance).mockReturnValue(false);
  });

  describe('angular builders', () => {
    afterEach(jest.restoreAllMocks);

    describe('Angular not found', () => {
      it('should return null', async () => {
        await expect(checkAngularBuilders()).resolves.toBeNull();
      });
    });

    describe('Angular < 14.0.0', () => {
      it('should return null', async () => {
        await expect(checkAngularBuilders()).resolves.toBeNull();
      });
    });

    describe('Angular >= 14.0.0', () => {
      beforeEach(() => {
        // Mock Angular version
        jest.requireMock('@angular/core').VERSION = { major: 14 };
      });
      describe('has one Storybook builder defined', () => {
        beforeEach(() => {
          // Mock AngularJSON.constructor
          (angularHelpers.AngularJSON as jest.Mock).mockImplementation(() => ({
            hasStorybookBuilder: true,
          }));
        });

        it('should return null', async () => {
          await expect(checkAngularBuilders()).resolves.toBeNull();
        });
      });

      describe('has one project', () => {
        beforeEach(() => {
          // Mock AngularJSON.constructor
          (angularHelpers.AngularJSON as jest.Mock).mockImplementation(() => ({
            hasStorybookBuilder: false,
            projects: {
              project1: { root: 'project1', architect: {} },
            },
            rootProject: 'project1',
          }));
        });

        it('should return null', async () => {
          await expect(checkAngularBuilders()).resolves.toBeNull();
        });
      });

      describe('has multiple projects without root project defined', () => {
        beforeEach(() => {
          // Mock AngularJSON.constructor
          (angularHelpers.AngularJSON as jest.Mock).mockImplementation(() => ({
            hasStorybookBuilder: false,
            projects: {
              project1: { root: 'project1', architect: {} },
              project2: { root: 'project2', architect: {} },
            },
            rootProject: null,
          }));
        });

        it('should return an empty object', async () => {
          await expect(checkAngularBuilders()).resolves.toMatchObject({});
        });
      });
    });
  });
});
