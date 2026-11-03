const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/voice-agent.js'),'utf8');

function page(online=true){
  const button={disabled:false,hidden:false,textContent:'🎙️ Ask by voice'};
  const status={textContent:''};
  const children=[];
  const events=[];
  const document={
    getElementById(id){return id==='voiceAgentButton'?button:id==='voiceAgentStatus'?status:null;},
    createElement(tag){return {
      tag,attributes:{},setAttribute(name,value){this.attributes[name]=value;},
      remove(){const index=children.indexOf(this);if(index>=0) children.splice(index,1);}
    };},
    body:{appendChild(element){children.push(element);}}
  };
  const navigator={onLine:online};
  const context=vm.createContext({document,navigator,window:{TrainingAnalytics:{track(name){events.push(name);}}}});
  vm.runInContext(source,context);
  return {button,status,children,events,navigator,run(code){return vm.runInContext(code,context);}};
}

test('voice widget and external script load only after the staff member clicks',()=>{
  const p=page();
  assert.equal(p.children.length,0);
  p.run('loadVoiceAgent()');
  assert.equal(p.children.length,2);
  const [widget,script]=p.children;
  assert.equal(widget.tag,'elevenlabs-convai');
  assert.equal(widget.attributes['agent-id'],'agent_1101m5w478hnemes4vb1kjge6d1e');
  assert.equal(script.src,'https://unpkg.com/@elevenlabs/convai-widget-embed');
  assert.deepEqual(p.events,['voice_widget_requested']);
  p.run('loadVoiceAgent()');
  assert.equal(p.children.length,2);
  script.onload();
  assert.equal(p.button.hidden,true);
  assert.match(p.status.textContent,/microphone permission/);
});

test('offline staff retain the guide without a third-party request',()=>{
  const p=page(false);
  p.run('loadVoiceAgent()');
  assert.equal(p.children.length,0);
  assert.equal(p.events.length,0);
  assert.match(p.status.textContent,/works offline/);
});

test('failed widget load cleans up and allows a retry',()=>{
  const p=page();
  p.run('loadVoiceAgent()');
  p.children[1].onerror();
  assert.equal(p.children.length,0);
  assert.equal(p.button.disabled,false);
  p.run('loadVoiceAgent()');
  assert.equal(p.children.length,2);
});
