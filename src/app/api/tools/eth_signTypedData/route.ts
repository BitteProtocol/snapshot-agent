import { NextResponse } from "next/server";
import { BASE_CHAIN_ID } from "@/src/app/config";
import { SignMessageSchema } from "../../schema";

const formatProposalId = (id: string) => {
  // Remove 0x prefix if present
  let cleanId = id.startsWith('0x') ? id.slice(2) : id;
  // Pad to 64 characters (32 bytes) if needed
  cleanId = cleanId.padStart(64, '0');
  // Add 0x prefix
  return '0x' + cleanId;
};


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const space = searchParams.get('space');
    const choice = searchParams.get('choice');
    console.log("starthere=====", searchParams);

    const { evmAddress } = SignMessageSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    const dataString = JSON.stringify({
      domain: {
        name: "snapshot-v2",
        version: "0.1.4",
        chainId: BASE_CHAIN_ID
      },
      types: {
        Vote: [
          { "name": "from", "type": "address" },
          { "name": "space", "type": "string" },
          { "name": "timestamp", "type": "uint64" },
          { "name": "proposal", "type": "string" },
          { "name": "app", "type": "string" },
          { "name": "metadata", "type": "string" },
          { "name": "choice", type: 'uint32' },
          { "name": "reason", type: "string" },
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
        app: "snapshot-v2",
        metadata: JSON.stringify({}),
        choice: Number(choice),
        reason: "",
      },
    });
    return NextResponse.json(
      {
        transaction: {
          chainId: BASE_CHAIN_ID,
          method: "eth_signTypedData_v4",
          params: [evmAddress, dataString],
        },
        meta: `Sign Dummy Typed Data.`,
      },
      { status: 200 },
    );
  } catch (error) {
    const publicMessage = "Error generating eth_signTypedData payload:";
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
