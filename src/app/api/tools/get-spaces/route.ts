import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: 'Bearer f51ccea7608eb627e3fe1049377dcd6bd01216a2551ff7c391d5b5faaaf41e5f',
  }
});

type Space = {
  id: string
  name: string
  about: string
  network: string
  symbol: string
  strategies: string[]
  admins: string[]
  members: string[]
  filters: string[]
  plugins: string[]
}

async function fetchSpacesWithGraphQLRequest(spaceSearch: string) {

  // Define the GraphQL query
  const GET_SPACES_QUERY = gql`
    query GetSpaces($spaceSearch: String!) {
     spaces(
        first: 20,
        skip: 0,
        orderBy: "created",
        orderDirection: asc,
        where: {
          search: $spaceSearch
        }
      ) {
        id
        name
        about
        network
        symbol
        strategies {
          name
          params
        }
        admins
        members
        filters {
          minScore
          onlyMembers
        }
        plugins
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ spaces: Space[] }>(GET_SPACES_QUERY, { spaceSearch });
    console.log('Success! Retrieved', data, 'proposals');
    return data;
  } catch (error) {
    console.error('Error fetching spaces:', error);
    throw error;
  }
}




/**
 * The accountId and evmAddress are in the context, so when defined in the OpenAPI
 *  spec they are automatically populated.
 */
export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);


  console.log('SPACE0000000----', searchParams);

  const spaceSearch = searchParams.get("spaceSearch");



  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const spaces = await fetchSpacesWithGraphQLRequest(spaceSearch || '');

    // Method 2: Using fetch API directly
    // const proposals = await fetchProposalsWithFetch();

    // Method 3: Using axios (uncomment axios code above first)
    // const proposals = await fetchProposalsWithAxios();

    // Process and display results
    console.log('\n=== PROPOSAL RESULTS ===');
    // spaces.forEach((proposal: Space, index: number) => {
    //   const formatted = formatProposal(proposal);
    //   console.log(`   ID: ${formatted}`);
    // });


    return NextResponse.json({ spaces });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
