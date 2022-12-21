import Image from 'next/image';
import styles from '../styles/mobile.module.css';
import { ChangeEvent, useState } from 'react';
import {
  includeKorean,
  KoreanOrEnglish,
  onlyEnglish,
} from '../lib/utils/checkLanguage';
import { PapagoResponseType } from './api/papago';
import { ImageResponseType } from './api/image';
import Head from 'next/head';
import { CreateImageRequestSizeEnum } from 'openai';
import Layout from '../components/layout';

const statusTextOptions = {
  sensing: '언어 감지 중..',
  korean: '한국어 감지',
  english: '영어 감지',
  translating: '번역 중..',
  translateError: '번역 실패',
};

const initTranslate = {
  new: false,
  result: '',
};

const initImageURl = {
  url: '',
  isLoading: false,
  error: false,
};

const imageSize: CreateImageRequestSizeEnum = '256x256';
type PageName = 'Text' | 'Output';

export default function Mobile() {
  const [currentPage, setCurrentPage] = useState<PageName>('Text');
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageUrl, setImageUrl] = useState(initImageURl);
  const [statusText, setStatusText] = useState(statusTextOptions.sensing);
  const [textareaInput, setTextareaInput] = useState('');
  const [translate, setTranslate] = useState(initTranslate);

  function setStatusTextHandler(text: string) {
    if (!KoreanOrEnglish(text)) {
      // 영어나 한국어가 아니라면 언어 감지
      setStatusText(statusTextOptions.sensing);
    } else if (includeKorean(text)) {
      // 한국어가 포함되어 있다면 한국어 감지
      setStatusText(statusTextOptions.korean);
    } else if (onlyEnglish(text)) {
      // 영어로만 이루어져 있다면 영어 감지
      setStatusText(statusTextOptions.english);
    }
  }

  // 이미지 불러오기 버튼
  async function clickGetImageBtnHandler() {
    let text = textareaInput.trim();
    if (!text.length) return;

    if (statusText === statusTextOptions.korean) {
      // 번역이 최신 상태면 그대로 쓴다.
      if (translate.new) {
        text = translate.result;
      } else {
        const prevStatus = statusText;
        setStatusText(statusTextOptions.translating);
        const papagoResponseData: PapagoResponseType = await fetch(
          `/api/papago?text=${text}`
        ).then((res) => res.json());
        if (!papagoResponseData.ok) {
          setStatusText(statusTextOptions.translateError);
          return;
        }
        text = papagoResponseData.translatedText;
        setTranslate({ new: true, result: text });
        setStatusText(prevStatus);
      }
    }
    setCurrentPage('Output');
    setImageUrl((prev) => ({ ...prev, isLoading: true }));
    const imageResponseData: ImageResponseType = await fetch(
      `/api/image?text=${text}&size=${imageSize}`
    ).then((res) => res.json());
    if (!imageResponseData.ok) {
      setImageUrl((prev) => ({ ...prev, isLoading: false, error: true }));
      return;
    }
    setImageUrl((prev) => ({
      ...prev,
      url: imageResponseData.imageUrl,
      isLoading: false,
    }));
  }

  function retryHandler() {
    if (!imageUrl.url.length) return;
    clickGetImageBtnHandler();
  }

  // 번역 결과 보기
  async function translateHandler() {
    const text = textareaInput.trim();
    if (!text.length) {
      alert('문장을 입력하세요!');
      return;
    }
    if (!translate.new) {
      const prevStatus = statusText;
      setStatusText(statusTextOptions.translating);

      const papagoResponseData: PapagoResponseType = await fetch(
        `/api/papago?text=${text}`
      ).then((res) => res.json());
      console.log(papagoResponseData.translatedText);
      if (!papagoResponseData.ok) {
        setStatusText(statusTextOptions.translateError);
        return;
      }

      setTranslate({ new: true, result: papagoResponseData.translatedText });
      setStatusText(prevStatus);
      setStatusTextHandler(textareaInput.trim());
    }
    setShowOverlay(true);
  }

  function mainTextareaOnchangeHandler(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    const text = event.target.value;
    setTextareaInput(text);
    setTranslate(initTranslate);
    setStatusTextHandler(text.trim());
  }

  function overlayTextareaOnchangeHandler(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    const text = event.target.value;
    if (!onlyEnglish(text.trim())) {
      alert('한국어는 입력할 수 없습니다.');
      return;
    }
    setTranslate({ new: false, result: text });
  }

  // 수정된 결과 보기
  async function translatedTextSubmitHandler() {
    const text = translate.result.trim();
    if (!text.length) {
      alert('문장을 입력하세요!');
      return;
    }
    setShowOverlay(false);
    setImageUrl((prev) => ({ ...prev, isLoading: true }));
    setCurrentPage('Output');
    const imageResponseData: ImageResponseType = await fetch(
      `/api/image?text=${text}`
    ).then((res) => res.json());
    if (!imageResponseData.ok) {
      setImageUrl((prev) => ({ ...prev, isLoading: false, error: true }));
      return;
    }
    setImageUrl((prev) => ({
      ...prev,
      url: imageResponseData.imageUrl,
      isLoading: false,
    }));
  }

  return (
    <Layout>
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.form}>
            <textarea
              className={styles.textarea}
              typeof='text'
              placeholder='영어만 입력 가능합니다.'
              spellCheck={false}
              value={translate.result}
              onChange={overlayTextareaOnchangeHandler}
            ></textarea>
            <button
              className={styles['submit-btn']}
              onClick={translatedTextSubmitHandler}
              // disabled={translate.result.trim().length === 0}
            >
              {translate.new
                ? '이미지 생성하기'
                : '수정된 번역으로 이미지 생성하기'}
            </button>
            <button
              className={styles['close-overlay-btn']}
              onClick={() => setShowOverlay(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <h2 className={styles.title}>어떤 이미지를 만들어볼까요?</h2>
      <main className={styles.main}>
        <div className={styles['current-page']}>
          {['Text', 'Output'].map((pageName) => (
            <div
              key={pageName}
              onClick={() => setCurrentPage(pageName as PageName)}
              className={`${styles.page} ${
                currentPage === pageName ? styles.active : ''
              }`}
            >
              <span>{pageName}</span>
              {currentPage === pageName && <div className={styles.line}></div>}
            </div>
          ))}
        </div>
        {currentPage === 'Text' ? (
          <div className={styles['input-form']}>
            <textarea
              className={styles.textarea}
              typeof='text'
              placeholder='자유롭게 설명해보세요!'
              spellCheck={false}
              value={textareaInput}
              onChange={mainTextareaOnchangeHandler}
            ></textarea>
            <div className={styles['notice-lang']}>{statusText}</div>
            <div className={styles.btns}>
              <button
                className={styles['submit-btn']}
                onClick={clickGetImageBtnHandler}
              >
                {statusText === statusTextOptions.korean ||
                statusText === statusTextOptions.translating
                  ? '번역 후 이미지 생성'
                  : '이미지 생성하기'}
              </button>

              <button
                className={styles['show-translate-btn']}
                onClick={translateHandler}
              >
                번역 결과 보기
              </button>
            </div>
          </div>
        ) : (
          <div className={styles['output-wrapper']}>
            <div
              className={`${styles.result} ${
                imageUrl.isLoading ? styles.loading : ''
              }`}
            >
              {imageUrl.isLoading ? (
                // <h2>Loading...</h2>
                // <span>이미지를 생성하는데 시간이 다소 걸릴 수 있어요</span>
                <span></span>
              ) : imageUrl.error ? (
                <h2>이미지를 불러올 수 없습니다.</h2>
              ) : !imageUrl.url.length ? null : (
                <Image
                  src={imageUrl.url}
                  alt='결과 이미지'
                  width={256}
                  height={256}
                  hidden={imageUrl.url.length === 0}
                />
              )}
            </div>
            <div className={styles.btns}>
              <button
                className={styles['show-translate-btn']}
                onClick={translateHandler}
              >
                번역 결과 보기
              </button>
              <button className={styles['retry-btn']} onClick={retryHandler}>
                <Image src={'/retry.svg'} alt='' width={15} height={15} />
              </button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
