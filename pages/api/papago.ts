import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '../../lib/server/withHandler';

export interface PapagoResponseType extends ResponseType {
  translatedText: string;
}

/**
 * 한국어를 입력하면 번역된 영어를 반환하는 함수
 * @param string
 * @return string
 */
async function getTranslate(text: string) {
  const params = JSON.stringify({
    source: 'ko',
    target: 'en',
    text,
  });
  const config = {
    headers: {
      'content-type': 'application/json',
      'X-Naver-Client-Id': process.env.NAVER_PAPAGO_CLIENT_ID,
      'X-Naver-Client-Secret': process.env.NAVER_PAPAGO_CLIENT_SECRET,
    },
  };
  const response = await axios.post(
    'https://openapi.naver.com/v1/papago/n2mt',
    params,
    config
  );

  // console.log(response.data.message.result.translatedText);
  return response.data.message.result.translatedText;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.query;
  const translatedText = await getTranslate(text as string);
  console.log(translatedText);
  return res.json({ ok: true, translatedText });
}

export default withHandler({ methods: ['GET'], handler });
