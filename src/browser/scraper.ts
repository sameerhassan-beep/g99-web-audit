import { chromium, Browser } from 'playwright';

export interface ScrapeResult {
  url: string;
  html: string;
  metadata: {
    title: string;
    description: string;
  };
  screenshots: {
    desktop: string; // base64
    tablet: string;
    mobile: string;
    fullPage: string;
  };
}

export class WebsiteScraper {
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrape(url: string): Promise<ScrapeResult> {
    if (!this.browser) await this.init();
    
    const context = await this.browser!.newContext();
    const page = await context.newPage();

    // Navigate and wait for page to load (networkidle can timeout on sites with tracking pixels/websockets)
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    const html = await page.content();
    const title = await page.title();
    const description = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta ? meta.getAttribute('content') || '' : '';
    });

    // Capture Viewports
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    const desktopBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    const mobileBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });

    // Full Page (Reset to desktop width for full scroll capture)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    const fullPageBuffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: true });

    await context.close();

    return {
      url,
      html,
      metadata: {
        title,
        description,
      },
      screenshots: {
        desktop: desktopBuffer.toString('base64'),
        tablet: tabletBuffer.toString('base64'),
        mobile: mobileBuffer.toString('base64'),
        fullPage: fullPageBuffer.toString('base64'),
      }
    };
  }
}
