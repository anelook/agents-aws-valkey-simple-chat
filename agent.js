import {invokeModel, sendToChannel, subscribe} from "./helpers.js";
import {getContinueConversationPrompt, getStartConversationPrompt} from "./prompts.js";

class Agent {
    constructor(agentName, anotherAgent) {
        this.agentName = agentName;
        this.anotherAgent = anotherAgent;
        this.shortMemory = [];
    }

    getPrompt(message) {
        if(!message) {
            return getStartConversationPrompt(this.agentName);
        }

        return getContinueConversationPrompt(this.agentName, this.shortMemory.join('\n\n'), message)
    }

    async startConversation(recipient) {
        await this.replyToMessage(recipient);
    }

    async replyToMessage(recipient, message) {
        const prompt = this.getPrompt(message);
        const response = await invokeModel(prompt);
        console.log("=========================================")
        console.log(`${this.agentName.toUpperCase()}: ${response}`);
        if(message) {
            this.shortMemory.push(`${recipient} said: ${message}`)
        }

        this.shortMemory.push(`You replied: ${response}`);

        sendToChannel(recipient, JSON.stringify({agent: this.agentName, message: response}));
    }

    async startListeningToOthers() {
        const subscriber = subscribe(this.agentName);
        subscriber.on("message", async (channel, message) => {
            const parsedMessage = JSON.parse(message);
            // parsedMessage.agent and parsedMessage.message
            await this.replyToMessage(parsedMessage.agent, parsedMessage.message)
        })
    }

    async initiate() {
        await this.startListeningToOthers();
        if (this.agentName === 'Judy') {
            await this.startConversation(this.anotherAgent);
        }

    }
}
export default Agent;