import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: 'Bearer f51ccea7608eb627e3fe1049377dcd6bd01216a2551ff7c391d5b5faaaf41e5f',
  }
});

type Proposal = { id: string, title: string, state: string, author: string, space: { name: string }, start: number, end: number, scores_total: string, choices: string[], scores_updated: number, network: string }

async function fetchProposalsWithGraphQLRequest(evmAddress: string, space: string, proposalId: string) {

  // Define the GraphQL query
  const GET_PROPOSALS_QUERY = gql`
    query GetProposals($evmAddress: String!, $space: String!, $proposalId: String!) {
      vp (
        voter: $evmAddress
        space: $space
        proposal: $proposalId
      ) {
        vp
        vp_by_strategy
        vp_state
      } 
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ proposals: Proposal[] }>(GET_PROPOSALS_QUERY, { evmAddress, space, proposalId });
    console.log('Success! Retrieved', data, 'proposals');
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

  const evmAddress = searchParams.get('evmAddress');
  const space = searchParams.get('space');
  const proposalId = searchParams.get('proposalId');


  console.log('PPPPPPPPPPPn----', searchParams);


  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const proposals = await fetchProposalsWithGraphQLRequest(evmAddress || '', space || 'all', proposalId || '');

    // Method 2: Using fetch API directly
    // const proposals = await fetchProposalsWithFetch();

    // Method 3: Using axios (uncomment axios code above first)
    // const proposals = await fetchProposalsWithAxios();

    // Process and display results
    // console.log('\n=== PROPOSAL RESULTS ===');
    // proposals.forEach((proposal: Proposal, index: number) => {
    //   const formatted = formatProposal(proposal);
    //   console.log(`\n${index + 1}. ${formatted.title}`);
    //   console.log(`   ID: ${formatted.id}`);
    //   console.log(`   Author: ${formatted.author}`);
    //   console.log(`   State: ${formatted.state}`);
    //   console.log(`   Space: ${formatted.space}`);
    //   console.log(`   Period: ${formatted.startDate} to ${formatted.endDate}`);
    //   console.log(`   Total Score: ${formatted.totalScore}`);
    //   console.log(`   Choices: ${formatted.choices.join(', ')}`);
    // });


    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
