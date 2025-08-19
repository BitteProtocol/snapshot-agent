import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: `Bearer ${process.env.SNAPSHOT_API_KEY}`,
  }
});

type Proposal = { id: string, title: string, state: string, author: string, space: { name: string }, start: number, end: number, scores_total: string, choices: string[], scores_updated: number }

async function fetchProposalsWithGraphQLRequest(proposalId: string) {

  // Define the GraphQL query
  const GET_PROPOSAL_QUERY = gql`
    query GetProposal($proposalId: String!) {
        proposal(id: $proposalId) {
          id
          title
          network
          strategies {
            name
            network
            params
          }
          space {
            id
            name
          }
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ proposal: Proposal }>(GET_PROPOSAL_QUERY, { proposalId });
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

  console.log('PPPPPPPPPPPn----', searchParams);


  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const proposal = await fetchProposalsWithGraphQLRequest(proposalId || '');

    // Method 2: Using fetch API directly
    // const proposals = await fetchProposalsWithFetch();

    // Method 3: Using axios (uncomment axios code above first)
    // const proposals = await fetchProposalsWithAxios();

    // Process and display results
    console.log('\n=== PROPOSAL RESULTS ===', proposal);
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


    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
