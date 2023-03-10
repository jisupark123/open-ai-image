import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '../../lib/server/withHandler';
import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from 'openai';

export interface ImageResponseType extends ResponseType {
  imageUrl: string;
}

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getOpenaiImageUrl(
  text: string,
  size: CreateImageRequestSizeEnum
) {
  const response = await openai.createImage({
    prompt: text,
    n: 1,
    size,
  });
  return response.data.data[0].url;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, size } = req.query;
  console.log(text);
  const imageUrl = await getOpenaiImageUrl(
    text as string,
    size as CreateImageRequestSizeEnum
  );
  return res.json({ ok: true, imageUrl });
}

export default withHandler({ methods: ['GET'], handler });
