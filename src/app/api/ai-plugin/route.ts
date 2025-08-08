import { NextResponse } from "next/server";
import { ACCOUNT_ID, BASE_CHAIN_ID, PLUGIN_URL } from "../../config";
import {
  chainIdParam,
  addressParam,
  SignRequestResponse200,
  AddressSchema,
  MetaTransactionSchema,
  SignRequestSchema,
} from "@bitte-ai/agent-sdk";

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Snapshot DAO Agent",
      description: "Read + vote on DAO proposals on Snapshot",
      version: "1.0.2",
    },
    servers: [
      {
        url: "https://snapshot-agent-theta.vercel.app/"
      }
    ],
    "x-mb": {
      "account-id": "0x66268791B55e1F5fA585D990326519F101407257",
      email: "nate@bitte.ai",
      assistant: {
        name: "Snapshot DAO Agent",
        description:
          "An agent that constructs EVM signature requests and validates cryptographic signatures for voting on snapshot DAOs. Use the generate-evm-tx primitive to create signature requests for transactions, personal messages, or EIP-712 typed data after eth_signTypedData is called. After a user signs a request, automatically validate the signature using the validate tool to verify authenticity and always inclue the message that was signed.",
        instructions: `
          After the eth_signTypedData tool is signed You create EVM transactions and signature requests using the generate-evm-tx primitive.
          After a message or typed data is signed, pass the message, evmAddress and signature back into the validate tool.
          To validate a signature, you must provide three pieces of information: 
          1) REQUIRED: the original message/data that was signed, 
          2) REQUIRED: the Ethereum address that allegedly created the signature, and 
          3) REQUIRED: the signature itself (65-byte hex string starting with 0x). 
        `,
        image: "https://pbs.twimg.com/profile_images/1835017202023776259/0SESZlTn_400x400.jpg",
        repo: "https://github.com/BitteProtocol/snapshot-agent",
        categories: ["DAO"],
        tools: [{ type: "generate-evm-tx" }],
        chainIds: [BASE_CHAIN_ID],
      },
    },
    paths: {
      "/api/tools/sendTransaction": {
        get: {
          summary: "returns non-trivial sendTransaction payloads",
          description:
            "Constructs non-trivial, zero-valued transactions to self",
          operationId: "sendTransaction",
          parameters: [
            { $ref: "#/components/parameters/numSuccess" },
            { $ref: "#/components/parameters/numFail" },
            { $ref: "#/components/parameters/evmAddress" },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },

      "/api/tools/eth_signTypedData": {
        get: {
          summary: "Used for voting on a proposal, returns EIP-712 typed data non-trivial eth_signTypedData request and genate a signature request.",
          description:
            "When a vote is made, Constructs signable (expired) eth_signTypedData EIP-712 as the origional message payload and ALWAYS generate an EVM transaction immidiately by calling the generate-evm-tx tool with the payload to get a signature request. Make sure the messgage is the same as the message that was signed and always send this to the verified tool when it's called.",
          operationId: "eth_signTypedData",
          parameters: [
            { $ref: "#/components/parameters/message" },
            { $ref: "#/components/parameters/evmAddress" },
            {
              name: "proposalId",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "The ID of the proposal to vote on"
            },
            {
              name: "space",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "The name of the space to vote on, also known as the DAO usually ends with .eth"
            },
            {
              name: "choice",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "for or against the proposal usually 1 for a yes or for or 2 for against or no"
            },
          ],
          responses: {
            "200": { $ref: "#/components/responses/SignRequestResponse200" },
          },
        },
      },
      "/api/tools/validate": {
        get: {
          summary: "Validates EVM signature authenticity",
          description:
            "Verifies that a cryptographic signature was created by the specified Ethereum address for the given message or typed data. Returns true if the signature is valid and was created by the provided address, false otherwise. This endpoint supports EIP-712 structured data. All input parameters are required: message, evmAddress and signature! Always have the message be the same as the message that was signed.",
          operationId: "validate",
          parameters: [
            {
              name: "message",
              in: "query",
              required: true,
              description:
                "The original message or data that was signed. For EIP-712 typed data, provide a JSON object with 'domain', 'types', 'message', and 'primaryType' fields. This must be the exact same data that was originally signed.",
              schema: {
                type: "object",
                description: "EIP-712 TypedData object",
                required: ["types", "primaryType", "domain", "message"],
                properties: {
                  types: {
                    type: "object",
                    additionalProperties: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["name", "type"],
                        properties: {
                          name: { type: "string" },
                          type: { type: "string" },
                        },
                      },
                    },
                  },
                  primaryType: { type: "string" },
                  domain: { type: "object" },
                  message: { type: "object" },
                },
              },
            },
            { $ref: "#/components/parameters/evmAddress" },
            {
              name: "signature",
              in: "query",
              required: true,
              description:
                "The cryptographic signature to validate. Must be a 65-byte hex string starting with '0x' (e.g., '0x1234...'). This signature should have been created by signing the provided message with the private key corresponding to the evmAddress.",
              schema: {
                type: "string",
                pattern: "^0x[a-fA-F0-9]+$",
              },
            },
          ],
          responses: {
            "200": {
              description: "Validation result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      valid: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/tools/get-proposal": {
        get: {
          summary: "Get Proposal",
          description: "Get proposals and make sure the proposal ID easy to find to send to vote tool",
          operationId: "get-proposal",
          parameters: [
            {
              name: "accountId",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "The name of the space to vote on, also known as the DAO usually ends with .eth"
            },
            {
              name: "evmAddress",
              in: "query",
              required: true,
              schema: {
                type: "string"
              },
              description: "The user's EVM address"
            },
            {
              name: "state",
              in: "query",
              required: true,
              schema: {
                type: "string",
                enum: ["closed", "active", "open", "pending"]
              },
              description: "The state of the proposal"
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      result: {
                        type: "string",
                        description: "The result of proposals made by account",
                      }
                    }
                  }
                }
              },


            },
            "500": {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        description: "Error message"
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
    },
    components: {
      parameters: {
        chainId: chainIdParam,
        message: {
          name: "message",
          in: "query",
          required: true,
          description:
            "The original message or data that was signed. For EIP-712 typed data, provide a JSON object with 'domain', 'types', 'message', and 'primaryType' fields. This must be the exact same data that was originally signed.",
          schema: {
            type: "object",
            description: "EIP-712 TypedData object",
            required: ["types", "primaryType", "domain", "message"],
            properties: {
              types: {
                type: "object",
                additionalProperties: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["name", "type"],
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                    },
                  },
                },
              },
              primaryType: { type: "string" },
              domain: { type: "object" },
              message: { type: "object" },
            },
          },
        },
        numSuccess: {
          ...chainIdParam,
          name: "numSuccess",
          description: "Number of successful transactions",
        },
        numFail: {
          ...chainIdParam,
          required: false,
          name: "numFail",
          description: "Number of failing transactions",
        },
        evmAddress: { ...addressParam, name: "evmAddress" },
        signature: { ...addressParam, name: "signature" },
      },
      responses: {
        SignRequestResponse200,
      },
      schemas: {
        Address: AddressSchema,
        MetaTransaction: MetaTransactionSchema,
        SignRequest: SignRequestSchema,
        SwapFTData: {
          type: "object",
          description: "UI data for swap widget",
          additionalProperties: true,
        },
        TypedData: {
          type: "object",
          description: "EIP-712 TypedData object",
          required: ["types", "primaryType", "domain", "message"],
          properties: {
            types: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "object",
                  required: ["name", "type"],
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                  },
                },
              },
            },
            primaryType: { type: "string" },
            domain: { type: "object" },
            message: { type: "object" },
          },
        },
        AppData: {
          description:
            "The string encoding of a JSON object representing some `appData`. The format of the JSON expected in the `appData` field is defined [here](https://github.com/cowprotocol/app-data).",
          type: "string",
          example: '{"version":"0.9.0","metadata":{}}',
        },
        AppDataHash: {
          description:
            "32 bytes encoded as hex with `0x` prefix. It's expected to be the hash of the stringified JSON object representing the `appData`.",
          type: "string",
        },
        SigningScheme: {
          description: "How was the order signed?",
          type: "string",
          enum: ["eip712", "ethsign", "presign", "eip1271"],
        },
        EcdsaSigningScheme: {
          description: "How was the order signed?",
          type: "string",
          enum: ["eip712", "ethsign"],
        },
        Signature: {
          description: "A signature.",
          oneOf: [
            { $ref: "#/components/schemas/EcdsaSignature" },
            { $ref: "#/components/schemas/PreSignature" },
          ],
        },
        EcdsaSignature: {
          description:
            "65 bytes encoded as hex with `0x` prefix. `r || s || v` from the spec.",
          type: "string",
          example:
            "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        },
        PreSignature: {
          description: 'Empty signature bytes. Used for "presign" signatures.',
          type: "string",
          example: "0x",
        },
      },
    },
  };

  return NextResponse.json(pluginData);
}
