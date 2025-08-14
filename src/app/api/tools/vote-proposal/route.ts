import { NextResponse } from "next/server";
import { BASE_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);


    const proposalId = searchParams.get('proposalId');
    const network = searchParams.get('network');
    console.log("starthere=====", searchParams);



    const { evmAddress } = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );



    const dataString = JSON.stringify({
      domain: {
        name: "snapshot",
        version: "0.1.4",
        chainId: network
      },
      types: {
        Vote: [
          { "name": "from", "type": "address" },
          { "name": "space", "type": "string" },
          { "name": "timestamp", "type": "uint64" },
          { "name": "proposal", "type": "bytes32" },
          { "name": "choice", "type": "uint32" },
          { "name": "reason", "type": "string" },
          { "name": "app", "type": "string" },
          { "name": "metadata", "type": "string" }
        ],
        EIP712Domain: [
          { "name": "name", "type": "string" },
          { "name": "version", "type": "string" },
          { "name": "chainId", "type": "uint256" }
        ]
      },
      primaryType: "Vote",
      message: {
        from: evmAddress,
        space: "nategeier.dcl.eth",
        timestamp: Math.floor(Date.now() / 1000),
        proposal: proposalId,
        choice: 1,
        reason: "",
        app: "snapshot",
        metadata: {}
      },
    });

    console.log("dataString_--------------", dataString);

    return NextResponse.json(
      {
        transaction: {
          chainId: network,
          method: "eth_signTypedData_v4",
          params: [evmAddress, dataString],
        },
        meta: `Sign Vote Proposals Data.`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_signTypedData payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}


