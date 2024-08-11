import {BedrockRuntimeClient, InvokeModelCommand} from "@aws-sdk/client-bedrock-runtime";
import Valkey from 'iovalkey'
import dotenv from 'dotenv'
dotenv.config()

export const subscribe = (channel) => {
    const valkeyClient = new Valkey(process.env.VALKEY);
    valkeyClient.subscribe(channel, async (err, count) => {
        if(err) {
            console.error(`ERROR: failed to subscribe to channel ${channel}. error: ${err.message}`);
        } else {
            console.log(`NOTIFICATION: successfully subscribed to channel ${channel}`);
        }
    })
    return valkeyClient;
}

export const sendToChannel = (channel, message) => {
    const valkeyClient = new Valkey(process.env.VALKEY);
    valkeyClient.publish(channel, message);
}

const bedrockClient = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
    }
})

export const invokeModel = async (prompt) => {
    const command = new InvokeModelCommand({
        "modelId": "anthropic.claude-3-haiku-20240307-v1:0",
        "contentType": "application/json",
        "accept": "application/json",
        "body": JSON.stringify({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        })
    })
    const response = await bedrockClient.send(command);
    const decodedResponseBody = JSON.parse(new TextDecoder().decode(response.body));
    return decodedResponseBody.content[0].text;
}

