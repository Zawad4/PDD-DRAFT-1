import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export class RouteDiscoveryEngine {
  /**
   * Scans React source code files to discover routes, forms, and validation rules.
   */
  static discoverRoutesAndForms(srcDir = path.resolve('src')) {
    logger.info('Starting Dynamic React Route & Form Discovery...');
    const discovery = {
      routes: [],
      forms: [],
      dynamicValidationScenarios: []
    };

    try {
      if (!fs.existsSync(srcDir)) {
        logger.warn(`Source directory ${srcDir} not found for static analysis.`);
        return discovery;
      }

      // 1. Scan App.jsx for Nav Tabs & Routes
      const appFile = path.join(srcDir, 'App.jsx');
      if (fs.existsSync(appFile)) {
        const appContent = fs.readFileSync(appFile, 'utf8');
        const routeMatches = appContent.match(/id:\s*['"]([^'"]+)['"]/g) || [];
        const routeNames = routeMatches.map(m => m.replace(/id:\s*['"]/, '').replace(/['"]/, ''));
        discovery.routes = Array.from(new Set(routeNames));
      }

      // Default routes fallback if regex didn't extract
      if (discovery.routes.length === 0) {
        discovery.routes = ['landing', 'discovery', 'marketplace', 'venue-manager', 'tournaments', 'community', 'profile', 'auth'];
      }

      // 2. Scan component pages for Forms and Input Validations
      const pagesDir = path.join(srcDir, 'pages');
      if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
        files.forEach(file => {
          const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
          const pageName = file.replace(/\.(jsx|js)$/, '');

          // Check if file contains <form>
          if (content.includes('<form') || content.includes('handleSubmit') || content.includes('handleListProduct')) {
            const formObj = {
              page: pageName,
              file,
              inputs: []
            };

            // Detect input types and attributes
            const inputMatches = content.match(/<input[^>]*>/g) || [];
            inputMatches.forEach(inp => {
              const nameMatch = inp.match(/name=['"]([^'"]+)['"]/) || inp.match(/placeholder=['"]([^'"]+)['"]/);
              const typeMatch = inp.match(/type=['"]([^'"]+)['"]/);
              const isRequired = inp.includes('required');

              if (nameMatch) {
                formObj.inputs.push({
                  identifier: nameMatch[1],
                  type: typeMatch ? typeMatch[1] : 'text',
                  required: isRequired
                });
              }
            });

            discovery.forms.push(formObj);
          }
        });
      }

      // 3. Generate Dynamic Validation Scenarios
      discovery.forms.forEach(form => {
        form.inputs.forEach(input => {
          if (input.required) {
            discovery.dynamicValidationScenarios.push({
              module: form.page,
              field: input.identifier,
              testName: `Dynamic Form Validation: ${form.page} - Empty Required Field (${input.identifier})`,
              input: '',
              expectedOutcome: 'validation_error'
            });
          }

          if (input.type === 'email') {
            discovery.dynamicValidationScenarios.push({
              module: form.page,
              field: input.identifier,
              testName: `Dynamic Form Validation: ${form.page} - Invalid Email Format (${input.identifier})`,
              input: 'invalid-email-no-at-domain',
              expectedOutcome: 'validation_error'
            });
          }

          if (input.type === 'number') {
            discovery.dynamicValidationScenarios.push({
              module: form.page,
              field: input.identifier,
              testName: `Dynamic Form Validation: ${form.page} - Negative Number Rejected (${input.identifier})`,
              input: '-500',
              expectedOutcome: 'validation_error'
            });
          }
        });
      });

      logger.info(`Discovered ${discovery.routes.length} React routes and ${discovery.forms.length} forms with ${discovery.dynamicValidationScenarios.length} dynamic validation scenarios.`);
      return discovery;
    } catch (error) {
      logger.error(`Error during dynamic route discovery: ${error.message}`);
      return discovery;
    }
  }
}
