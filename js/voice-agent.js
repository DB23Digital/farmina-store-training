// The ElevenLabs widget is loaded only after the staff member asks for it.
// It is an online third-party service, separate from GA4 consent and the offline guide.
const VOICE_AGENT_ID = 'agent_1101m5w478hnemes4vb1kjge6d1e';
const VOICE_WIDGET_SCRIPT = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
let voiceWidgetState = 'idle';

function loadVoiceAgent(){
  const button=document.getElementById('voiceAgentButton');
  const status=document.getElementById('voiceAgentStatus');
  if(!button || !status || voiceWidgetState==='loading') return;
  if(voiceWidgetState==='ready'){
    status.textContent='The voice widget is ready. Tap its conversation button to begin.';
    return;
  }
  if(navigator.onLine===false){
    status.textContent='Voice needs an internet connection. The Help a customer guide still works offline.';
    return;
  }

  voiceWidgetState='loading';
  button.disabled=true;
  button.textContent='Loading voice…';
  status.textContent='Loading the voice widget. No call starts until you choose to begin.';

  const widget=document.createElement('elevenlabs-convai');
  widget.setAttribute('agent-id',VOICE_AGENT_ID);
  widget.setAttribute('dismissible','true');
  widget.setAttribute('action-text','Ask a Farmina question');
  widget.setAttribute('start-call-text','Start voice chat');

  const script=document.createElement('script');
  script.src=VOICE_WIDGET_SCRIPT;
  script.async=true;
  script.type='text/javascript';
  script.onload=()=>{
    voiceWidgetState='ready';
    button.hidden=true;
    status.textContent='Voice widget ready. Tap it to start; your browser may ask for microphone permission.';
  };
  script.onerror=()=>{
    voiceWidgetState='idle';
    widget.remove();
    script.remove();
    button.disabled=false;
    button.textContent='🎙️ Try voice again';
    status.textContent='The voice service did not load. Check the connection and try again.';
  };

  document.body.appendChild(widget);
  document.body.appendChild(script);
  window.TrainingAnalytics?.track('voice_widget_requested');
}
