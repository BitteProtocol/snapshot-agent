import { NextResponse } from 'next/server';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propsalId = searchParams.get('propsalId');
    const vote = searchParams.get('vote');

    console.log('proposal----', propsalId);
    console.log('vote----', vote);


    return NextResponse.json({ winning: "winning" }, { status: 200 });


  } catch (error) {
    console.error('Error generating EVM transaction:', error);
    return NextResponse.json({ error: 'Failed to generate EVM transaction' }, { status: 500 });
  }
}
