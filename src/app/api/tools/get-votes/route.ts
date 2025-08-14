import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: 'Bearer f51ccea7608eb627e3fe1049377dcd6bd01216a2551ff7c391d5b5faaaf41e5f',
  }
});

type Vote = { id: string, voter: string, created: number, reason: string, proposal: { id: string }, choice: string, space: { id: string } }

async function fetchProposalsWithGraphQLRequest(proposalId: string) {

  // Define the GraphQL query
  const GET_VOTES_QUERY = gql`
    query GetVotes($proposalId: String!) {
        votes (
        first: 1000
        skip: 0
        where: {
          proposal: $proposalId
        }
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        voter
        created
        reason
        proposal {
          id
        }
        choice
        space {
          id
        }
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ votes: Vote[] }>(GET_VOTES_QUERY, { proposalId });
    console.log('Success! Retrieved', data);
    return data;
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

  const proposalId = searchParams.get('proposalId');

  console.log('GET VVOTES ======----', searchParams);


  try {
    const votes = await fetchProposalsWithGraphQLRequest(proposalId || '');

    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
