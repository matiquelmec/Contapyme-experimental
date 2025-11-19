const puppeteer = require('puppeteer');

async function captureConsoleErrors() {
  let browser;
  try {
    console.log('🚀 Iniciando captura de errores de consola en http://localhost:3000...\n');

    browser = await puppeteer.launch({
      headless: false, // Mostrar navegador para debugging
      devtools: true,  // Abrir devtools automáticamente
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();

    // Arrays para capturar diferentes tipos de mensajes
    const errors = [];
    const warnings = [];
    const logs = [];
    const networkErrors = [];

    // Capturar errores de consola
    page.on('console', msg => {
      const timestamp = new Date().toISOString();
      const type = msg.type();
      const text = msg.text();

      const message = `[${timestamp}] [${type.toUpperCase()}] ${text}`;

      switch(type) {
        case 'error':
          errors.push(message);
          console.log('🔴 ERROR:', message);
          break;
        case 'warning':
          warnings.push(message);
          console.log('🟡 WARNING:', message);
          break;
        case 'log':
        case 'info':
          logs.push(message);
          console.log('ℹ️  INFO:', message);
          break;
        default:
          console.log(`📝 [${type.toUpperCase()}]:`, message);
      }
    });

    // Capturar errores de página no manejados
    page.on('pageerror', error => {
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] [PAGE_ERROR] ${error.message}\n${error.stack}`;
      errors.push(message);
      console.log('💥 PAGE ERROR:', message);
    });

    // Capturar errores de red
    page.on('response', response => {
      const timestamp = new Date().toISOString();
      if (!response.ok()) {
        const message = `[${timestamp}] [NETWORK_ERROR] ${response.status()} ${response.statusText()} - ${response.url()}`;
        networkErrors.push(message);
        console.log('🌐 NETWORK ERROR:', message);
      }
    });

    // Capturar requests que fallan
    page.on('requestfailed', request => {
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] [REQUEST_FAILED] ${request.failure().errorText} - ${request.url()}`;
      networkErrors.push(message);
      console.log('📡 REQUEST FAILED:', message);
    });

    console.log('🔗 Navegando a http://localhost:3000...\n');

    // Navegar a la página
    const response = await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log(`📊 Respuesta inicial: ${response.status()} ${response.statusText()}\n`);

    // Esperar un poco más para capturar errores de hidratación
    console.log('⏳ Esperando errores de hidratación y carga...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Intentar interactuar con elementos para provocar más errores
    try {
      await page.evaluate(() => {
        // Trigger some interactions that might cause errors
        window.dispatchEvent(new Event('resize'));
        if (typeof window.React !== 'undefined') {
          console.log('React detected:', window.React.version);
        }
      });
    } catch (e) {
      console.log('Error en interacción:', e.message);
    }

    // Esperar un poco más
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Resumen de errores capturados
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMEN DE ERRORES CAPTURADOS');
    console.log('='.repeat(80));

    console.log(`\n🔴 ERRORES (${errors.length}):`);
    if (errors.length === 0) {
      console.log('  ✅ No se encontraron errores');
    } else {
      errors.forEach(error => console.log(`  ${error}`));
    }

    console.log(`\n🟡 WARNINGS (${warnings.length}):`);
    if (warnings.length === 0) {
      console.log('  ✅ No se encontraron warnings');
    } else {
      warnings.forEach(warning => console.log(`  ${warning}`));
    }

    console.log(`\n🌐 ERRORES DE RED (${networkErrors.length}):`);
    if (networkErrors.length === 0) {
      console.log('  ✅ No se encontraron errores de red');
    } else {
      networkErrors.forEach(netError => console.log(`  ${netError}`));
    }

    console.log(`\nℹ️  LOGS INFORMATIVOS (${logs.length}):`);
    if (logs.length <= 10) {
      logs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log(`  📝 Mostrando últimos 10 de ${logs.length} logs:`);
      logs.slice(-10).forEach(log => console.log(`  ${log}`));
    }

    console.log('\n' + '='.repeat(80));

    // Mantener navegador abierto por 30 segundos para inspección manual
    console.log('🔍 Manteniendo navegador abierto por 30 segundos para inspección manual...');
    console.log('💡 Revisa las DevTools manualmente para errores adicionales');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('💥 Error ejecutando script:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

captureConsoleErrors();