import { NextResponse } from "next/server";

export async function GET() {
    const pluginData = {
        openapi: "3.0.0",
        info: {
            title: "Snapshot-agent",
            description: "API for the boilerplate",
            version: "1.0.0"
        },
        servers: [
            {
                url: "https://snapshot-agent.vercel.app/"
            },
        ],
        "x-mb": {
            "account-id": 'nate.near',
            email: "nate@bitte.ai",
            assistant: {
                name: "Snapshot Agent",
                description: "Read open or closed porposals on snapshop to mage DAOs",
                instructions: "You create near and evm transactions, give blockchain information, tell the user's account id, interact with twitter and flip coins. For blockchain transactions, first generate a transaction payload using the appropriate endpoint (/api/tools/create-near-transaction or /api/tools/create-evm-transaction), then explicitly use the 'generate-transaction' tool for NEAR or 'generate-evm-tx' tool for EVM to actually send the transaction on the client side. For EVM transactions, make sure to provide the 'to' address (recipient) and 'amount' (in ETH) parameters when calling /api/tools/create-evm-transaction. Simply getting the payload from the endpoints is not enough - the corresponding tool must be used to execute the transaction.",
                tools: [{ type: "generate-evm-tx" }],
                image: "https://pbs.twimg.com/profile_images/1835017202023776259/0SESZlTn_400x400.jpg",
                repo: "https://github.com/BitteProtocol/snapshot-agent",
                categories: ["DAO"],
                chainIds: [1, 100, 8453, 42161, 43114, 11155111]
            },
        },
        paths: {
            "/api/tools/get-proposal": {
                get: {
                    summary: "Get Proposal",
                    description: "Get propals made by me",
                    operationId: "getProposal",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The EVM account id starting with 0x"
                        },
                        {
                            name: "evmAddress",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The user's EVM address"
                        },
                        {
                            name: "state",
                            in: "query",
                            required: false,
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
                                                type: "array",
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
            "/api/tools/vote": {
                get: {
                    operationId: "vote",
                    summary: "Create EVM transaction to vote on a proposal",
                    description: "Generate an EVM transaction payload with a for or against a vote to be used directly in the vote tool",
                    parameters: [
                        {
                            name: "propsalId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The proposal id voted on"
                        },
                        {
                            name: "vote",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "Voting for or against the proposal"
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
                                            evmSignRequest: {
                                                type: "object",
                                                properties: {
                                                    to: {
                                                        type: "string",
                                                        description: "Receiver address"
                                                    },
                                                    value: {
                                                        type: "string",
                                                        description: "Transaction value"
                                                    },
                                                    data: {
                                                        type: "string",
                                                        description: "Transaction data"
                                                    },
                                                    from: {
                                                        type: "string",
                                                        description: "Sender address"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
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
                        },
                        "500": {
                            description: "Server error",
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
                }
            },
        },
    };

    return NextResponse.json(pluginData);
}