'use strict';
// 파일 메뉴·단축키·우상단 버튼이 모두 같은 전체 저장 경로를 사용합니다.
let workspaceSaveBusy=false;
async function saveWholeWorkspace(){
 if(workspaceSaveBusy||saveInProgress||markdownMutationBusy){notify('다른 저장/문서 작업이 끝난 뒤 다시 시도하세요.');return {ok:false}}
 document.activeElement?.blur();syncDocument();
 if(!directoryHandle){notify('작업 폴더를 먼저 연결하세요. 전체 저장은 작업 폴더에 직접 저장합니다.');return {ok:false}}
 const directory=directoryHandle,docs=[...workspace.documents];let idlCount=0,mdCount=0,settingsSaved=false;
 workspaceSaveBusy=true;saveInProgress=true;clearTimeout(settingsSaveTimer);
 const controls=[...document.querySelectorAll('[data-cmd="saveall"]')];controls.forEach(b=>b.disabled=true);notify('IDL · Markdown · 설정 전체 저장 중…');
 try{
  await mdWriteQueue.catch(()=>{});await settingsWriteQueue.catch(()=>{});
  if(directoryHandle!==directory)throw Error('작업 폴더가 바뀌었습니다. 다시 전체 저장하세요.');
  if(settingsFolder!==directory||!settingsWritable)throw Error('설정 파일을 저장할 수 없습니다. 작업 폴더를 다시 연결하고 설정 상태를 확인하세요.');
  for(const doc of docs){const paths=markdownFilesFor(doc).map(f=>f.path);if(JSON.stringify(doc.data.markdownDocuments)!==JSON.stringify(paths)){doc.data.markdownDocuments=paths;doc.dirty=true}}
  idlCount=await writeIDLBatch(docs,directory,documentHandles,diskBaselines);
  if(directoryHandle!==directory)throw Error('작업 폴더가 바뀌었습니다.');
  mdCount=await queueMarkdownSave(docs);
  if(directoryHandle!==directory)throw Error('작업 폴더가 바뀌었습니다.');
  clearTimeout(settingsSaveTimer);await queueFolderSettingsSave();
  settingsSaved=folderSettingsStatus==='설정 파일 저장됨'&&settingsBaseline===diskSettingsSnapshot();
  if(!settingsSaved)throw Error('설정 파일 저장을 완료하지 못했습니다. 설정의 작업 폴더 탭에서 저장 상태를 확인하세요.');
  if(docs.some(d=>d.dirty||markdownFilesFor(d).some(f=>f.markdownDirty)))throw Error('저장 도중 새 편집 내용이 생겼습니다. 전체 저장을 한 번 더 눌러주세요.');
  dirty=activeDocument().dirty;workspacePersist();render();updateMarkdownVisibility();markMarkdownStatus();
  const totalMD=docs.reduce((n,d)=>n+markdownFilesFor(d).length,0);notify('전체 저장 완료 · '+docs.length+' IDL · '+totalMD+' MD · 설정 파일 → '+directory.name);
  return {ok:true,idlCount,mdCount,totalMD,settingsSaved};
 }catch(error){idlCount=error.savedCount??idlCount;mdCount=error.savedMarkdownCount??mdCount;notify('전체 저장 미완료 · IDL '+idlCount+'개 / MD '+mdCount+'개 저장됨: '+error.message);return {ok:false,idlCount,mdCount,settingsSaved,error:error.message}}
 finally{saveInProgress=false;workspaceSaveBusy=false;controls.forEach(b=>b.disabled=false);dirty=activeDocument().dirty;workspacePersist()}
}
const saveIDLBeforeWholeWorkspace=saveIDL;saveIDL=async function(all){if(all)return saveWholeWorkspace();if(workspaceSaveBusy){notify('전체 저장이 진행 중입니다.');return}return saveIDLBeforeWholeWorkspace(all)};
const openFolderBeforeWholeWorkspace=openFolder;openFolder=async function(...args){if(workspaceSaveBusy){notify('전체 저장 완료 후 작업 폴더를 바꿀 수 있습니다.');return}return openFolderBeforeWholeWorkspace(...args)};
const wholeSaveGuide=document.createElement('p');wholeSaveGuide.textContent='전체 저장: 우상단 작업 폴더 미리보기 오른쪽의 전체 저장, 파일 → 모두 저장 또는 지정한 모두 저장 단축키를 누릅니다. 모든 IDL·Markdown·화면/단축키/삭제 확인 설정을 같은 작업 폴더에 저장합니다. 다음 시작에서 이전 작업 폴더로 연결하면 함께 불러옵니다.';guide.append(wholeSaveGuide);
