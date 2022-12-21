/**
 *
 * @param {text} text
 * @returns 한국어가 한글자라도 포함되어 있으면 true를 return
 */
export function includeKorean(text: string) {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
}

/**
 *
 * @param {text} text
 * @returns 모두 영어 or 숫자 or 기호 or 공백으로 구성되어 있으면 true를 return
 */
export function onlyEnglish(text: string) {
  return /^[A-Za-z0-9~!@#$%^&*()_+|<>?:{}' ']*$/.test(text);
}

/**
 *
 * @param {text} text
 * @returns 한국어나 영어가 아니라면 false를 return
 */
export function KoreanOrEnglish(text: string) {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|A-Za-z]/.test(text);
  // return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text) === false && /^[A-Za-z0-9
}
