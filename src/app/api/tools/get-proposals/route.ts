import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: `Bearer ${process.env.SNAPSHOT_API_KEY}`,
  }
});

type Proposal = { id: string, title: string, state: string, author: string, space: { name: string }, start: number, end: number, scores_total: string, choices: string[], scores_updated: number, network: string }

async function fetchProposalsWithGraphQLRequest(spaceId: string, state: string) {

  // Define the GraphQL query
  const GET_PROPOSALS_QUERY = gql`
    query GetProposals($spaceId: String!, $state: String!) {
      proposals(
        first: 20,
        skip: 0,
        where: {
          space_in: [$spaceId],
          state: $state
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        network
        start
        end
        snapshot
        state
        space {
          id
          name
        }
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ proposals: Proposal[] }>(GET_PROPOSALS_QUERY, { spaceId, state });
    console.log('Success! Retrieved', data.proposals, 'proposals');
    return data.proposals;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}


/**
 * The accountId and evmAddress are in the context, so when defined in the OpenAPI
 *  spec they are automatically populated.
 */
export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const spaceId = searchParams.get('spaceId');
  const state = searchParams.get("state");

  console.log('PPPPPPPPPPPn----', searchParams);

  console.log('state----', state);

  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const proposals = await fetchProposalsWithGraphQLRequest(spaceId || '', state?.toString() || '');


    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
