import {OpenAI} from 'langchain/llms/openai';

const model = new OpenAI({openAIApiKey: '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'});

console.log('start invoking llm');
const res = await model.call('Hello.');

console.log(res);
