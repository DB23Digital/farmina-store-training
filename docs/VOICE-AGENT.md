# Optional ElevenLabs voice buddy

The Products screen exposes **Ask by voice**. A tap creates the owner-supplied `<elevenlabs-convai>` element for `agent_1101m5w478hnemes4vb1kjge6d1e` and loads `https://unpkg.com/@elevenlabs/convai-widget-embed`. The external script is not requested on ordinary page load and is not cached by the training service worker. The offline **Help a customer** guide remains available if ElevenLabs cannot load.

The page does not start a call or request microphone permission itself. Staff use the widget to start the conversation. The page does not pass catalogue state, pet details, customer identity or GA4 identifiers into ElevenLabs. Consented GA4 tracks only that the widget was requested; it does not receive audio, transcripts or answers.

## ElevenLabs dashboard checks before live use

The widget requires a public agent with authentication disabled. Restrict its allowed domains to `apexpetgroup.co.za` and `www.apexpetgroup.co.za` in the agent Security settings, adding a test host only while needed. Review the agent's prompt and knowledge sources against the approved Farmina catalogue. In particular, the agent should avoid unsupported health outcomes, allergy diagnosis, stale prices and unverified pack suitability.

Review ElevenLabs' transcript retention and audio-saving settings before staff use the agent with customers. The local code cannot read or set those account options. The page asks staff not to share customer details, but that notice does not replace an agent privacy configuration.

## Verification

1. On the live HTTPS `/training/` page, confirm no ElevenLabs script request occurs before **Ask by voice** is tapped.
2. Tap **Ask by voice** and confirm the widget appears above the mobile navigation and the agent connects. Grant microphone permission only when intentionally testing a call.
3. Ask a factual product question and a price question. Confirm the agent uses current approved information and handles unknowns without guessing.
4. Check a declined GA4 session: the voice widget should still be available on tap, while GA4 receives no event.
5. After a first online load, take the app offline. The guided product flow should still work; the voice control should explain that it needs a connection.

Automated local checks run with `node --test tests/voice-agent.test.cjs tests/analytics.test.cjs`. They verify delayed loading, exact agent ID and URL, offline fallback, retry, and the GA4 parameter boundary. They cannot prove the ElevenLabs agent is public, allowlisted, microphone-capable or factually sound.

Official references: [widget embed and public-agent requirement](https://elevenlabs.io/docs/eleven-agents/customization/widget), [domain allowlists](https://elevenlabs.io/docs/eleven-agents/customization/authentication), [retention](https://elevenlabs.io/docs/eleven-agents/customization/privacy/retention), [audio saving](https://elevenlabs.io/docs/eleven-agents/customization/privacy/audio-saving).
