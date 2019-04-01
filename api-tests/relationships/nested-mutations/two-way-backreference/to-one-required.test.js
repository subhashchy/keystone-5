const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

jest.setTimeout(6000000);

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          location: { type: Relationship, ref: 'Location.company' },
        },
      });

      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.location', isRequired: true },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('update one to one relationship back reference', () => {
      test(
        'nested create',
        runner(setupKeystone, async ({ keystone, findById }) => {
          const locationName = sampleOne(alphanumGenerator);
          const { data } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createCompany(data: {
            location: { create: { name: "${locationName}" } }
          }) {
            id
            location {
              id
            }
          }
        }
    `,
          });

          const companyId = data.createCompany.id;
          const locationId = data.createCompany.location.id;

          const location = await findById('Location', locationId);
          const company = await findById('Company', companyId);

          // Everything should now be connected
          expect(company.location.toString()).toBe(locationId.toString());
          expect(location.company.toString()).toBe(companyId.toString());
        })
      );
    });
  })
);
