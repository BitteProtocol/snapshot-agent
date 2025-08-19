import { NextResponse } from "next/server";
import { SignMessageSchema } from "../../schema";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const space = searchParams.get('space');
    const network = searchParams.get('network');
    const choice = searchParams.get('choice');
    console.log("starthere=====", searchParams);

    const { evmAddress } = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    const dataString = JSON.stringify({
      domain: {
        name: "snapshot",
        version: "0.1.4",
        chainId: parseInt(network || '1', 10),
      },
      types: {
        Vote: [
          { "name": "from", "type": "address" },
          { "name": "space", "type": "string" },
          { "name": "timestamp", "type": "uint64" },
          { "name": "proposal", "type": "string" },
          { "name": "choice", "type": 'uint32' },
          { "name": "reason", "type": "string" },
          { "name": "app", "type": "string" },
          { "name": "metadata", "type": "string" },
        ],
        EIP712Domain: [
          { "name": "name", "type": "string" },
          { "name": "version", "type": "string" },
          { "name": "chainId", "type": "uint256" },
        ]
      },
      primaryType: "Vote",
      message: {
        from: evmAddress,
        space,
        timestamp: Math.floor(Date.now() / 1000),
        proposal: proposalId,
        choice: Number(choice),
        reason: "",
        app: "snapshot",
        metadata: JSON.stringify({}),
      },
    });

    console.log("dataString---------------", dataString);
    return NextResponse.json(
      {
        transaction: {
          chainId: parseInt(network || '1', 10),
          method: "eth_signTypedData_v4",
          params: [evmAddress, dataString],
        },
        meta: `Sign Vote Typed Data.`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_signTypedData payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
