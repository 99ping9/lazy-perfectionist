import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCdR9D0sgGpqPe4rxGgTXoJvLySxelUGI0";

if (!apiKey) {
    console.error("Please provide API Key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
    try {
        console.log("Attempting to generate content with gemini-1.5-flash-latest (v1)...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }, { apiVersion: "v1" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
