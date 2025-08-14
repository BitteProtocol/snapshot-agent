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

async function fetchProposalsWithGraphQLRequest(accountId: string, state: string) {

  // Define the GraphQL query
  const GET_PROPOSALS_QUERY = gql`
    query GetProposals {
      proposals(
        first: 20,
        skip: 0,
        where: {
          space_in: ["${accountId}"],
          state: "${state}"
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        network
        choices
        start
        end
        snapshot
        state
        scores
        scores_by_strategy
        scores_total
        scores_updated
        author
        space {
          id
          name
        }
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ proposals: Proposal[] }>(GET_PROPOSALS_QUERY);
    console.log('Success! Retrieved', data.proposals, 'proposals');
    return data.proposals;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

// function formatProposal(proposal: Proposal) {
//   return {
//     id: proposal.id,
//     title: proposal.title,
//     state: proposal.state,
//     author: proposal.author,
//     space: proposal.space.name,
//     startDate: new Date(proposal.start * 1000).toISOString(),
//     endDate: new Date(proposal.end * 1000).toISOString(),
//     totalScore: proposal.scores_total,
//     choices: proposal.choices,
//     scoresUpdated: proposal.scores_updated ? new Date(proposal.scores_updated * 1000).toISOString() : null
//   };
// }


/**
 * The accountId and evmAddress are in the context, so when defined in the OpenAPI
 *  spec they are automatically populated.
 */
export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const accountId = searchParams.get('accountId');
  const state = searchParams.get("state");

  console.log('PPPPPPPPPPPn----', searchParams);

  console.log('state----', state);

  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const proposals = await fetchProposalsWithGraphQLRequest(accountId || '', state?.toString() || 'all');

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
