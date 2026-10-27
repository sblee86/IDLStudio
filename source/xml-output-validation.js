'use strict';
// 출력 원문을 변경하지 않고 태그 짝/속성 문법과 네임스페이스 선언을 구분합니다.
function xmlParserError(doc){const errors=doc.getElementsByTagNameNS('http://www.mozilla.org/newlayout/xml/parsererror.xml','parsererror');if(errors[0])return errors[0];return [...doc.getElementsByTagNameNS('http://www.w3.org/1999/xhtml','parsererror')].find(e=>/This page contains the following errors:/i.test(e.textContent))||null}
function xmlRootToken(text){
 // 주석/처리 지시문의 예제 태그를 루트로 오인하지 않습니다.
 const token=/<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<([^\s<>!?/]+)(?=[\s/>])/g;let match;
 while((match=token.exec(text)))if(match[1])return {insert:match.index+1+match[1].length,name:match[1]};return null;
}
function validateOutputXML(text){
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('외부 선언(DOCTYPE/ENTITY)은 지원하지 않습니다.');
 const warnings=[],seen=new Set();let validationText=text;
 for(let attempt=0;attempt<=32;attempt++){
  const doc=new DOMParser().parseFromString(validationText,'application/xml'),error=xmlParserError(doc);
  if(!error)return {document:doc,warnings};
  const detail=error.textContent.replace(/\s+/g,' ').replace(/Below is a rendering[\s\S]*/i,'').trim();
  const missing=[...detail.matchAll(/Namespace prefix\s+([A-Za-z_][\w.-]*)\s+(?:(?:on|for)\s+.*?)?is not defined/gi)].map(m=>m[1]);
  if(missing.length){const root=xmlRootToken(validationText),fresh=[...new Set(missing)].filter(p=>!seen.has(p)&&!['xml','xmlns'].includes(p));if(root&&fresh.length&&attempt<32){
    // 임시 선언은 검증 복사본에만 넣습니다. generateOutput 결과와 내보낼 파일에는 절대 넣지 않습니다.
    const declarations=fresh.map(prefix=>{seen.add(prefix);warnings.push(prefix);return ' xmlns:'+prefix+'="urn:idl-studio:validation-only:'+prefix+'"'}).join('');
    validationText=validationText.slice(0,root.insert)+declarations+validationText.slice(root.insert);continue;
  }}
  let message;if(/mismatch|Opening and ending tag|tag.*not match/i.test(detail))message='XML 태그 오류: 여는 태그와 닫는 태그의 이름을 똑같이 맞춰주세요. 예: <NOM:interaction> → </NOM:interaction>.';
  else if(missing.length)message='XML 네임스페이스를 확인하지 못했습니다. 접두사 이름/선언 위치를 확인하세요.';
  else message='XML 문법 오류: 태그·따옴표·속성·이스케이프를 확인하세요.';
  throw Error(message+'\n\n파서 상세: '+detail.slice(0,700));
 }
 throw Error('XML 접두사는 32개 이하로 지원합니다.');
}
