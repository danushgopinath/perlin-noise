export function connectDeepgram({ apiKey, onTranscript, onClose, onError }) {
  const url = new URL("wss://api.deepgram.com/v1/listen");
  url.searchParams.set("model", "nova-2-general");
  url.searchParams.set("smart_format", "true");
  url.searchParams.set("punctuate", "true");
  url.searchParams.set("language", "en-US");

  const ws = new WebSocket(url.toString(), ["token", apiKey]);

  let mediaRecorder;
  ws.onopen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && ws.readyState === 1) {
          const buffer = await e.data.arrayBuffer();
          ws.send(buffer);
        }
      };
      mediaRecorder.start(100); 
    } catch (err) {
      onError?.(err);
      ws.close();
    }
  };

  ws.onmessage = (m) => {
    try {
      const data = JSON.parse(m.data);
      const alt = data?.channel?.alternatives?.[0];
      if (alt?.transcript) {
        const is_final = !!data?.is_final;
        onTranscript?.({ text: alt.transcript, is_final });
      }
    } catch {}
  };

  ws.onerror = (e) => onError?.(e);
  ws.onclose = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    onClose?.();
  };

  return () => {
    try { ws.close(); } catch {}
  };
}
