import { NextResponse } from "next/server";
import { SignatureValidationSchema } from "../../schema";
import { normalizeSignature, verifySignature } from "../../logic";

const SNAPSHOT_HUB_URL = 'https://hub.snapshot.org/api/msg';




async function submitVoteToSnapshot(account: string, message: string, signature: string) {
  try {
    // Prepare the payload for Snapshot
    const payload = {
      address: account,
      data: JSON.parse(message),
      sig: signature
    };
    console.log("validate ------payload", payload);

    // Submit to Snapshot Hub
    const response = await fetch(SNAPSHOT_HUB_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': 'Bearer f51ccea7608eb627e3fe1049377dcd6bd01216a2551ff7c391d5b5faaaf41e5f',
      },
      body: JSON.stringify(payload)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Vote submitted successfully:', result);
    return result;

  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("validate!!!!-----------/", searchParams);
    const { evmAddress, message, signature } = SignatureValidationSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );
    const valid = await verifySignature(
      evmAddress,
      message,
      normalizeSignature(signature),
    );

    try {
      await submitVoteToSnapshot(evmAddress, message as string, normalizeSignature(signature));
      return NextResponse.json({ valid }, { status: 200 });
    } catch (error) {
      console.error('Error submitting vote:', error);
      const publicMessage = `Error validating payload: ${error}`;
      return NextResponse.json({ error: publicMessage }, { status: 500 });
    }


  } catch (error) {
    const publicMessage = `Error validating payload: ${error}`;
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
