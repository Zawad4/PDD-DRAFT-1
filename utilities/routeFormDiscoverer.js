/**
 * Automated React Route & Form Scanner / Dynamic Test Generator
 * Reads React application source code (App.jsx, pages/*.jsx) to automatically discover routes,
 * forms, inputs, and validation rules for dynamic E2E test generation.
 */

import fs from 'fs';
import path from 'path';
import config from '../config/env.config.js';
import logger from './logger.js';

export class RouteFormDiscoverer {
  constructor(srcPath = path.join(config.paths.root, 'src')) {
    this.srcPath = srcPath;
  }

  /**
   * Scans App.jsx and page components to discover routes and forms.
   */
  discoverRoutesAndForms() {
    logger.info(`Scanning React application source at: [${this.srcPath}]`);
    const routes = this.discoverRoutes();
    const forms = this.discoverForms();

    logger.info(`Discovered ${routes.length} React routes & ${forms.length} component forms.`);
    return { routes, forms };
  }

  /**
   * Discovers active React routes / tabs from App.jsx or router definitions.
   */
  discoverRoutes() {
    const appPath = path.join(this.srcPath, 'App.jsx');
    const routes = [];

    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf-8');
      
      // Match activeTab === '...' or <Route path="..."
      const tabMatches = content.match(/activeTab\s*===\s*['"]([^'"]+)['"]/g) || [];
      const navItemMatches = content.match(/id:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"]/g) || [];
      
      tabMatches.forEach(m => {
        const routeName = m.replace(/activeTab\s*===\s*['"]([^'"]+)['"]/, '$1');
        if (!routes.some(r => r.name === routeName)) {
          routes.push({
            name: routeName,
            url: `${config.baseUrl}?tab=${routeName}`,
            source: 'App.jsx Tab Navigation'
          });
        }
      });

      navItemMatches.forEach(m => {
        const [, id] = m.match(/id:\s*['"]([^'"]+)['"]/) || [];
        if (id && !routes.some(r => r.name === id)) {
          routes.push({
            name: id,
            url: `${config.baseUrl}?tab=${id}`,
            source: 'Nav Items Registry'
          });
        }
      });
    }

    if (routes.length === 0) {
      // Fallback default routes if scan empty
      return [
        { name: 'home', url: `${config.baseUrl}/`, source: 'Default' },
        { name: 'discovery', url: `${config.baseUrl}/#discovery`, source: 'Default' },
        { name: 'community', url: `${config.baseUrl}/#community`, source: 'Default' },
        { name: 'auth', url: `${config.baseUrl}/#auth`, source: 'Default' }
      ];
    }

    return routes;
  }

  /**
   * Scans pages/*.jsx to discover form inputs, validation attributes & fields.
   */
  discoverForms() {
    const pagesDir = path.join(this.srcPath, 'pages');
    const forms = [];

    if (!fs.existsSync(pagesDir)) return forms;

    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

    files.forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const componentName = file.replace(/\.jsx?$/, '');

      // Regex matcher for input fields and validation attributes
      const inputRegex = /<input\s+([^>]+)\/>/gi;
      const selectRegex = /<select\s+([^>]+)>([\s\S]*?)<\/select>/gi;
      
      const fields = [];
      let match;

      while ((match = inputRegex.exec(content)) !== null) {
        const attrs = match[1];
        const type = (attrs.match(/type=['"]([^'"]+)['"]/) || [])[1] || 'text';
        const name = (attrs.match(/name=['"]([^'"]+)['"]/) || attrs.match(/placeholder=['"]([^'"]+)['"]/) || [])[1] || 'field';
        const required = attrs.includes('required') || attrs.includes('aria-required');
        const minLength = (attrs.match(/minLength=\{?(\d+)\}?/) || [])[1];
        const maxLength = (attrs.match(/maxLength=\{?(\d+)\}?/) || [])[1];

        fields.push({
          name,
          type,
          required: Boolean(required),
          minLength: minLength ? parseInt(minLength, 10) : null,
          maxLength: maxLength ? parseInt(maxLength, 10) : null,
          rawAttributes: attrs
        });
      }

      while ((match = selectRegex.exec(content)) !== null) {
        const attrs = match[1];
        const name = (attrs.match(/name=['"]([^'"]+)['"]/) || [])[1] || 'dropdown';
        fields.push({
          name,
          type: 'select',
          required: attrs.includes('required')
        });
      }

      if (fields.length > 0) {
        forms.push({
          component: componentName,
          file,
          fieldsCount: fields.length,
          fields
        });
      }
    });

    return forms;
  }
}

export default new RouteFormDiscoverer();
