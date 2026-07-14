import { MasterDesignAgent } from './src/agents/MasterDesignAgent';

async function test() {
  const agent = new MasterDesignAgent();
  
  // Use a small 1x1 pixel base64 image just to see if the API accepts the payload
  const emptyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const params = {
    screenshots: {
      desktop: emptyBase64,
      tablet: emptyBase64,
      mobile: emptyBase64,
      fullPage: emptyBase64,
      fullPageNoModals: emptyBase64
    }
  };

  try {
    const res = await agent.analyze('https://example.com', params);
    console.log('SUCCESS:', res);
  } catch (err: any) {
    console.error('FAILED!');
    console.error(err.message);
    if (err.cause) console.error('CAUSE:', err.cause);
    if (err.data) console.error('DATA:', err.data);
  }
}

test();
