import { NextResponse } from "next/server";
import { SignatureValidationSchema } from "../../schema";
import { normalizeSignature, verifySignature } from "../../logic";

const SNAPSHOT_HUB_URL = "https://hub.snapshot.org/api/msg";

async function submitVoteToSnapshot(
  account: string,
  message: string,
  signature: string,
) {
  try {
    // Prepare the payload for Snapshot
    const payload = {
      address: account,
      data: JSON.parse(message),
      sig: signature,
    };
    console.log("validate ------payload", payload);

    // Submit to Snapshot Hub
    const response = await fetch(SNAPSHOT_HUB_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    const responseText = await response.text();
    let responseData: {
      error_description?: string;
      message?: string;
      [key: string]: unknown;
    };
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    // Handle different response status codes
    if (response.ok) {
      console.log("Vote submitted successfully:", responseData);
      return { success: true, data: responseData };
    } else {
      // Handle business logic errors gracefully
      if (
        response.status === 400 &&
        responseData?.error_description === "no voting power"
      ) {
        console.log("User has no voting power for this space");
        return {
          success: false,
          error: "no_voting_power",
          message: "User does not have voting power in this space",
        };
      }

      // Handle other client errors
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          error: "client_error",
          message: responseData?.error_description || responseText,
          status: response.status,
        };
      }

      // Handle server errors
      throw new Error(
        `Snapshot server error! status: ${response.status}, message: ${responseText}`,
      );
    }
  } catch (error) {
    console.error("Error submitting vote:", error);
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
      const submitResult = await submitVoteToSnapshot(
        evmAddress,
        message as string,
        normalizeSignature(signature),
      );

      if (submitResult.success) {
        return NextResponse.json(
          {
            valid,
            vote_submitted: true,
            snapshot_response: submitResult.data,
          },
          { status: 200 },
        );
      } else {
        // Handle business logic errors gracefully
        if (submitResult.error === "no_voting_power") {
          return NextResponse.json(
            {
              valid,
              vote_submitted: false,
              error: submitResult.error,
              message: submitResult.message,
            },
            { status: 200 },
          ); // Return 200 since signature validation succeeded
        } else {
          return NextResponse.json(
            {
              valid,
              vote_submitted: false,
              error: submitResult.error,
              message: submitResult.message,
            },
            { status: 400 },
          );
        }
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      const publicMessage = `Error submitting vote to Snapshot: ${error}`;
      return NextResponse.json(
        {
          valid,
          vote_submitted: false,
          error: publicMessage,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const publicMessage = `Error validating payload: ${error}`;
    console.error(publicMessage, error);
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  }
}
