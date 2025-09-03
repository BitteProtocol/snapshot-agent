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

async function fetchProposalsByAuthor(author: string) {
  // Define the GraphQL query to search by author
  const GET_PROPOSALS_BY_AUTHOR_QUERY = gql`
    query GetProposalsByAuthor($author: String!) {
      proposals(
        first: 10,
        skip: 0,
        where: {
          author: $author
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        network
        choices
        start
        end
        state
        author
        created
        space {
          id
          name
        }
      }
    }
    `;

  try {
    console.log('Fetching proposals by author:', author);
    const data = await client.request<{ proposals: Proposal[] }>(GET_PROPOSALS_BY_AUTHOR_QUERY, { author });
    console.log('Success! Retrieved', data.proposals.length, 'proposals by', author);
    return data.proposals;
  } catch (error) {
    console.error('Error fetching proposals by author:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const author = searchParams.get('author');

  if (!author) {
    return NextResponse.json({ error: 'Author parameter is required' }, { status: 400 });
  }

  try {
    const proposals = await fetchProposalsByAuthor(author);
    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Failed to fetch proposals by author:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}
