import { NextResponse } from "next/server";
import { GraphQLClient, gql } from 'graphql-request';


const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql';

// Initialize GraphQL client
const client = new GraphQLClient(SNAPSHOT_GRAPHQL_ENDPOINT, {
  headers: {
    authorization: `Bearer ${process.env.SNAPSHOT_API_KEY}`,
  }
});



type Follow = { follower: string, space: { id: string }, created: number }

async function fetchProposalsWithGraphQLRequest(evmAddress: string) {

  // Define the GraphQL query
  const GET_PROPOSALS_QUERY = gql`
    query GetProposals($evmAddress: String!) {
      follows(
        where: {
          follower: $evmAddress
        }
      ) {
        follower
        space {
          id
        }
        created
      }
    }
    `;

  try {
    console.log('Fetching proposals using graphql-request...');
    const data = await client.request<{ follows: Follow[] }>(GET_PROPOSALS_QUERY, { evmAddress });
    console.log('Success! Retrieved', data.follows, 'follows');
    return data.follows;
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

  console.log('PPPPPPPPPPPn----', searchParams);


  try {
    // Choose your preferred method:

    // Method 1: Using graphql-request (recommended)
    const follows = await fetchProposalsWithGraphQLRequest(evmAddress || '');

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


    return NextResponse.json({ follows });
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    process.exit(1);
  }
}
